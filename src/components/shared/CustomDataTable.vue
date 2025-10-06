<script setup lang="ts">
/**
 * CustomDataTable.vue
 *
 * A feature-rich data table component with server-side pagination, filtering,
 * grouping, selection, CRUD actions, custom actions, downloads, and dialogs.
 *
 * Key features:
 * - Server-side pagination and infinite scroll
 * - Optional grouping with expand/collapse
 * - Row selection (single/multi) with external v-model
 * - Dynamic actions column with CRUD/routes/downloads/custom buttons
 * - Date conversion between Shamsi and Gregorian with optional timezone
 *
 * Accessibility:
 * - Adds ARIA attributes to group headers and busy regions
 * - Keyboard support for toggling groups and activating selection on rows
 */
import { computed, onMounted, ref, watch, shallowRef, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import { useTableSelection } from '@/composables/useTableSelection';
import axiosInstance from '@/services/axiosInstance';
import apiService from '@/services/apiService';
import { useRouter } from 'vue-router';
import type { Component } from 'vue';
import { DateConverter } from '@/utils/date-convertor';
import { useDebounceFn } from '@vueuse/core';
import MoneyInput from '@/components/shared/MoneyInput.vue';
import { formatNumberWithCommas } from '@/utils/number-formatter';
import { IconChevronRight, IconChevronDown } from '@tabler/icons-vue';

/**
 * Table header definition
 */
interface Header {
  title: string;
  key: string;
  sortable?: boolean;
  editable?: boolean;
  width?: number;
  hidden?: boolean;
  defaultValue?: string | number | boolean;
  isDate?: boolean;
  style?: Record<string, string>;
  translate?: boolean;
  options?: Array<{ title: string; value: string | number | boolean }>;
  conditionalStyle?: (value: any, item: any) => Record<string, string>;
  // New properties for custom JSON support
  nestedKey?: string; // For nested properties like "user.name"
  customRenderer?: (item: any) => string | number | boolean; // Custom renderer function
  formatter?: (value: any, item: any) => string; // Custom formatter function
  type?: string;
}

interface CustomAction {
  title: string;
  component: Component;
  condition?: (item: any) => boolean; // Optional condition function
}

interface CustomButtonAction {
  label: string;
  color?: string;
  onClick: (item: any) => void;
  disabled?: boolean;
}

/**
 * Component props
 */
interface Props {
  apiResource: string;
  headers: Header[];
  actions?: ('create' | 'edit' | 'delete' | 'view')[];
  routes?: Record<string, string> | ((item: any) => Record<string, string>);
  downloadLink?: Record<string, string>;
  formComponent?: Component;
  customActions?: CustomAction[];
  customButtons?: CustomButtonAction[];
  customButtonsFn?: (item: any) => CustomButtonAction[];
  filterComponent?: Component;
  autoFetch?: boolean;
  queryParams?: Record<string, any>;
  showPagination?: boolean;
  height: number;
  pagination?: any;
  showRefreshButton?: boolean; // Shows refresh button in action buttons
  title?: string; // Custom title for the page
  selectable?: boolean; // Enable row selection
  multiSelect?: boolean; // Allow multiple row selection
  selectedItems?: any[]; // External selected items (for v-model)
  uniqueKey?: string | ((item: any) => string | number); // Custom unique key for selection
  pageSize?: number; // Page size for pagination (default: 10)
  groupBy?: string | ((item: any) => string | number); // Property to group items by
  groupHeaderTemplate?: (groupKey: string | number, groupItems: any[]) => string; // Custom group header template
  defaultExpanded?: boolean; // Whether groups are expanded by default
  defaultSelected?: string; // Property name to check for auto-selection (e.g., 'isSelected')
  dateWithTimezone?: boolean; // If true, save dates with local timezone offset at midnight
}

const props = withDefaults(defineProps<Props>(), {
  autoFetch: true,
  showPagination: true,
  showRefreshButton: false,
  selectable: false,
  multiSelect: false,
  selectedItems: () => [],
  uniqueKey: 'id',
  pageSize: 10,
  defaultExpanded: false,
  dateWithTimezone: false
});

const emit = defineEmits<{
  (e: 'update:selectedItems', items: any[]): void;
  (e: 'selection-change', items: any[]): void;
}>();

defineOptions({ inheritAttrs: false });

const items = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const dialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const editedItem = ref<Record<string, any> | null>(null);
const formModel = ref<Record<string, any>>({});
const itemToDelete = ref<Record<string, any> | null>(null);
const snackbar = ref(false);
const snackbarMessage = ref('');
const router = useRouter();
const itemsPerPage = ref(props.pageSize);
const totalSize = ref(0);
const totalPages = ref(0);
const currentPage = ref(1);
const sortBy = ref<{ key: string; order: 'asc' | 'desc' } | null>(null);
const filterDialog = ref(false);
const filterModel = ref<Record<string, any>>({});
const tableRef = ref<HTMLElement | null>(null);
const isLoadingMore = ref(false);
const hasMore = ref(true);

// Selection & grouping using composable (minimal-risk wiring)
const selection = useTableSelection(items, {
  multiSelect: props.multiSelect,
  uniqueKey: props.uniqueKey as any,
  groupBy: props.groupBy as any,
  defaultExpanded: props.defaultExpanded
});
const selectedItems = selection.selectedItems;
const selectAll = computed({
  get: () => selection.allSelected.value,
  set: (val: boolean) => {
    if (val) {
      selection.toggleSelectAll();
    } else {
      selection.clearSelection();
    }
  }
});
const groupedItems = selection.groupedItems as unknown as Ref<
  Array<{ groupKey: string | number; groupLabel: string; items: any[]; isExpanded: boolean; count: number }>
>;
const expandedGroups = selection.expandedGroups;

// Computed flag to determine if any actions should be shown
const hasAnyActions = computed(() => {
  const hasCrudActions = Array.isArray(props.actions) && props.actions.length > 0;
  const hasRoutes = !!props.routes && (typeof props.routes === 'function' || Object.keys(props.routes).length > 0);
  const hasDownloadLinks = !!props.downloadLink && Object.keys(props.downloadLink).length > 0;
  const hasCustomActions = Array.isArray(props.customActions) && props.customActions.length > 0;
  const hasCustomButtons = (Array.isArray(props.customButtons) && props.customButtons.length > 0) || !!props.customButtonsFn;
  return hasCrudActions || hasRoutes || hasDownloadLinks || hasCustomActions || hasCustomButtons;
});

// Function to get routes for a specific item
const getRoutesForItem = (item: any): Record<string, string> => {
  if (!props.routes) return {};
  if (typeof props.routes === 'function') {
    return props.routes(item);
  }
  return props.routes;
};

// Estimate auto width based on header title and type when width is not provided
const estimateColumnWidth = (header: Header): number => {
  const title = header.title || '';
  const basePadding = 32; // left/right padding
  const avgCharWidth = 10; // heuristic average per character
  const typeExtra = header.type && String(header.type).toLowerCase() === 'money' ? 40 : 0;
  const computed = basePadding + title.length * avgCharWidth + typeExtra;
  const min = 100;
  const max = 300;
  return Math.min(Math.max(computed, min), max);
};

// Headers with auto width applied when not specified
const autoHeaders = computed(() => {
  return props.headers.map((h) => ({
    ...h,
    width: h.width ?? estimateColumnWidth(h)
  }));
});

const selectionHeader = { title: '', key: 'selection', sortable: false, width: 50 } as const;

const groupedHeaders = computed(() => {
  const base = [
    ...(props.selectable ? [selectionHeader] : []),
    ...autoHeaders.value,
  ];

  if (!hasAnyActions.value) {
    return base;
  }

  // Calculate dynamic width based on actual button sizes (same logic as normalHeaders)
  let totalWidth = 0;

  // CRUD actions (edit, delete, view, create)
  if (props.actions) {
    props.actions.forEach(action => {
      switch (action) {
        case 'edit':
          totalWidth += 140; // "ویرایش ✏️" button width
          break;
        case 'delete':
          totalWidth += 120; // "حذف ❌" button width
          break;
        case 'view':
          totalWidth += 140; // "🔍 نمایش" button width
          break;
        case 'create':
          totalWidth += 120; // Create button width
          break;
      }
    });
  }

  // Route actions
  if (props.routes) {
    Object.keys(props.routes).forEach(routeKey => {
      totalWidth += 120; // Route button width (key.toUpperCase())
    });
  }

  // Download actions
  if (props.downloadLink) {
    Object.keys(props.downloadLink).forEach(key => {
      totalWidth += 120; // Download button width
    });
  }

  // Custom actions
  if (props.customActions) {
    props.customActions.forEach(action => {
      totalWidth += 140; // Custom action button width
    });
  }

  // Custom buttons
  if (props.customButtonsFn) {
    // For dynamic buttons, estimate based on typical button count
    totalWidth += 240; // 2 buttons * 120px each
  } else if (props.customButtons) {
    props.customButtons.forEach(button => {
      totalWidth += 120; // Custom button width
    });
  }

  // Add spacing between buttons (8px margin per button)
  const buttonCount = (props.actions?.length || 0) +
    (props.routes ? Object.keys(props.routes).length : 0) +
    (props.downloadLink ? Object.keys(props.downloadLink).length : 0) +
    (props.customActions?.length || 0) +
    (props.customButtons?.length || (props.customButtonsFn ? 2 : 0));

  const spacingWidth = Math.max(buttonCount - 1, 0) * 8; // 8px margin between buttons
  totalWidth += spacingWidth;

  // Add padding for the cell
  totalWidth += 32; // 16px padding on each side

  // Ensure minimum width
  const actionWidth = Math.max(totalWidth, 200);

  return [...base, { title: 'عملیات', key: 'actions', sortable: false, width: actionWidth }];
});

const normalHeaders = computed(() => {
  const base = [
    ...(props.selectable ? [selectionHeader] : []),
    ...autoHeaders.value,
  ];

  if (!hasAnyActions.value) {
    return base;
  }

  // Calculate dynamic width based on actual button sizes
  let totalWidth = 0;

  // CRUD actions (edit, delete, view, create)
  if (props.actions) {
    props.actions.forEach(action => {
      switch (action) {
        case 'edit':
          totalWidth += 140; // "ویرایش ✏️" button width
          break;
        case 'delete':
          totalWidth += 120; // "حذف ❌" button width
          break;
        case 'view':
          totalWidth += 140; // "🔍 نمایش" button width
          break;
        case 'create':
          totalWidth += 120; // Create button width
          break;
      }
    });
  }

  // Route actions
  if (props.routes) {
    Object.keys(props.routes).forEach(routeKey => {
      totalWidth += 120; // Route button width (key.toUpperCase())
    });
  }

  // Download actions
  if (props.downloadLink) {
    Object.keys(props.downloadLink).forEach(key => {
      totalWidth += 120; // Download button width
    });
  }

  // Custom actions
  if (props.customActions) {
    props.customActions.forEach(action => {
      totalWidth += 140; // Custom action button width
    });
  }

  // Custom buttons
  if (props.customButtonsFn) {
    // For dynamic buttons, estimate based on typical button count
    totalWidth += 240; // 2 buttons * 120px each
  } else if (props.customButtons) {
    props.customButtons.forEach(button => {
      totalWidth += 120; // Custom button width
    });
  }

  // Add spacing between buttons (8px margin per button)
  const buttonCount = (props.actions?.length || 0) +
    (props.routes ? Object.keys(props.routes).length : 0) +
    (props.downloadLink ? Object.keys(props.downloadLink).length : 0) +
    (props.customActions?.length || 0) +
    (props.customButtons?.length || (props.customButtonsFn ? 2 : 0));

  const spacingWidth = Math.max(buttonCount - 1, 0) * 8; // 8px margin between buttons
  totalWidth += spacingWidth;

  // Add padding for the cell
  totalWidth += 32; // 16px padding on each side

  // Ensure minimum width
  const actionWidth = Math.max(totalWidth, 200);

  return [...base, { title: 'عملیات', key: 'actions', sortable: false, width: actionWidth }];
});

// Helper function to get unique value from item
const getUniqueValue = (item: any): string | number => {
  if (typeof props.uniqueKey === 'function') {
    return props.uniqueKey(item);
  }

  if (typeof props.uniqueKey === 'string') {
    // Handle nested properties like "user.id"
    return props.uniqueKey.split('.').reduce((obj, key) => obj?.[key], item);
  }

  // Fallback to id
  return item.id;
};

// Helper function to get group value from item
const getGroupValue = (item: any): string | number => {
  if (!props.groupBy) return '';

  if (typeof props.groupBy === 'function') {
    return props.groupBy(item);
  }

  if (typeof props.groupBy === 'string') {
    // Handle nested properties like "user.department"
    return props.groupBy.split('.').reduce((obj, key) => obj?.[key], item);
  }

  return item[props.groupBy] || '';
};

// Note: Grouping logic is handled by useTableSelection composable

// Selection methods
const toggleSelection = (item: any) => {
  if (!props.selectable) return;
  selection.toggleSelection(item);
  emit('update:selectedItems', selectedItems.value);
  emit('selection-change', selectedItems.value);
};

const toggleSelectAll = () => {
  if (!props.selectable || !props.multiSelect) return;
  selection.toggleSelectAll();
  emit('update:selectedItems', selectedItems.value);
  emit('selection-change', selectedItems.value);
};

// Group toggle function
const toggleGroup = (groupKey: string | number) => selection.toggleGroup(groupKey);

// Expand all groups
const expandAllGroups = () => selection.expandAllGroups();

// Collapse all groups
const collapseAllGroups = () => selection.collapseAllGroups();

const isSelected = (item: any) => selection.isSelected(item);

// Computed properties for selection
const selectedCount = computed(() => selectedItems.value.length);
const hasSelection = computed(() => selectedItems.value.length > 0);

// Clear selection method
const clearSelection = () => {
  selection.clearSelection();
  emit('update:selectedItems', selectedItems.value);
  emit('selection-change', selectedItems.value);
};

// Memoize computed properties
const cleanFilterModel = computed(() => {
  const model = { ...filterModel.value };
  Object.keys(model).forEach((key) => {
    if (model[key] === null || model[key] === undefined || model[key] === '') {
      delete model[key];
    }
  });
  return model;
});

const hasFilterComponent = computed(() => {
  return !!props.filterComponent;
});

/**
 * Fetches data from server using current filters, query params, and pagination.
 * Converts date fields to Shamsi for display and computes grouping/selection state.
 * @param queryParams Optional extra query params to merge with filter and pagination
 */
const fetchData = async (queryParams?: {}) => {
  loading.value = true;
  error.value = null;

  let params: Record<string, any> = {
    ...cleanFilterModel.value,
    ...props.queryParams
  };

  if (queryParams) {
    params = { ...params, ...queryParams };
  }

  // Add pagination params last
  params = {
    ...params,
    page: currentPage.value - 1,
    size: itemsPerPage.value
  };

  try {
    const response = await api.fetch(params);
    items.value = response.data.content || [];

    // Convert dates to Shamsi format
    items.value = items.value.map((item: Record<string, any>) => {
      const newItem = { ...item };
      props.headers.forEach((header) => {
        if (header.isDate && newItem[header.key]) {
          try {
            newItem[header.key] = DateConverter.toShamsi(newItem[header.key]);
          } catch (error) {
            console.error(`Error converting date for field ${header.key}:`, error);
          }
        }
      });
      return newItem;
    });

    totalSize.value = response.data.page.totalElements;
    totalPages.value = response.data.page.totalPages;
    hasMore.value = currentPage.value < response.data.page.totalPages;

    // Grouping is handled automatically by useTableSelection composable

    // Auto-select items if defaultSelected prop is provided
    if (props.defaultSelected && items.value.length > 0 && props.defaultSelected in items.value[0]) {
      const defaultSelectedItems = items.value.filter(
        (item) => item[props.defaultSelected!] === true
      );
      selectedItems.value = [...defaultSelectedItems];
      emit('update:selectedItems', selectedItems.value);
      emit('selection-change', selectedItems.value);
    }
  } catch (err: any) {
    if (err.response) {
      error.value = `خطای سرور: ${err.response.status} - ${err.response.data.message || 'خطای ناشناخته'}`;
    } else if (err.request) {
      error.value = 'خطای شبکه. لطفا دوباره تلاش کنید.';
    } else {
      error.value = 'یک خطای غیرمنتظره رخ داد.';
    }
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Add debounced version after fetchData definition
const debouncedFetchData = useDebounceFn(fetchData, 300);

// Update watcher to use debounced function
watch(
  [cleanFilterModel],
  () => {
    debouncedFetchData();
  },
  { deep: true }
);

// Watch for pageSize prop changes
watch(
  () => props.pageSize,
  (newPageSize) => {
    itemsPerPage.value = newPageSize;
    // Reset to first page when page size changes
    currentPage.value = 1;
    // Refetch data with new page size
    debouncedFetchData();
  }
);

// Cleanup on component unmount
onBeforeUnmount(() => {
  // Remove cancel call as it's not supported
});

const api = apiService(axiosInstance, props.apiResource);
const customActionDialog = ref(false);
const customActionComponent = shallowRef<Component | null>(null);
const customActionItem = ref<any>(null);

// Add scroll event handler
const handleScroll = async (event: Event) => {
  const target = event.target as HTMLElement;
  const { scrollTop, scrollHeight, clientHeight } = target;

  // Check if we're near the bottom (within 100px)
  if (scrollHeight - scrollTop - clientHeight < 100 && !isLoadingMore.value && hasMore.value) {
    await loadMore();
  }
};

/**
 * Loads next page and appends to current items. Preserves selection defaults.
 */
const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return;

  isLoadingMore.value = true;
  currentPage.value++;

  try {
    const params = {
      ...cleanFilterModel.value,
      ...props.queryParams,
      page: currentPage.value - 1,
      size: itemsPerPage.value
    };

    const response = await api.fetch(params);
    const newItems = response.data.content || [];

    // Convert dates to Shamsi format
    const formattedItems = newItems.map((item: Record<string, any>) => {
      const newItem = { ...item };
      props.headers.forEach((header) => {
        if (header.isDate && newItem[header.key]) {
          try {
            newItem[header.key] = DateConverter.toShamsi(newItem[header.key]);
          } catch (error) {
            console.error(`Error converting date for field ${header.key}:`, error);
          }
        }
      });
      return newItem;
    });

    items.value = [...items.value, ...formattedItems];
    hasMore.value = currentPage.value < response.data.totalPages;

    // Auto-select new items if defaultSelected prop is provided
    if (props.defaultSelected && props.selectable) {
      const newSelectedItems = formattedItems.filter(
        (item: any) => item[props.defaultSelected!] === true
      );
      if (newSelectedItems.length > 0) {
        selectedItems.value = [...selectedItems.value, ...newSelectedItems];
        emit('update:selectedItems', selectedItems.value);
        emit('selection-change', selectedItems.value);
      }
    }
  } catch (err) {
    console.error('Error loading more items:', err);
    currentPage.value--; // Revert page number on error
  } finally {
    isLoadingMore.value = false;
  }
};

// Expose methods to parent component
defineExpose({
  fetchData,
  items,
  selectedItems,
  getSelectedItems: () => selectedItems.value,
  clearSelection: () => {
    selectedItems.value = [];
    selectAll.value = false;
  },
  // Grouping methods (handled by useTableSelection composable)
  groupedItems,
  toggleGroup,
  expandAllGroups,
  collapseAllGroups
});

/**
 * Opens the create/edit dialog and normalizes date fields for editing.
 */
const openDialog = (item?: any) => {
  editedItem.value = item ? { ...item } : {};
  isEditing.value = !!item;
  dialog.value = true;

  if (!isEditing.value) {
    for (const header of props.headers) {
      if (header.defaultValue !== undefined) {
        editedItem.value![header.key] = header.defaultValue;
      }
    }
  }

  // Sync form model with editedItem
  formModel.value = { ...editedItem.value };

  // Ensure date fields in edit mode are in Gregorian YYYY-MM-DD for the date picker
  if (isEditing.value) {
    try {
      props.headers.forEach((header) => {
        if (header.isDate) {
          const v = formModel.value[header.key];
          if (typeof v === 'string' && v.includes('/')) {
            // Convert Shamsi jYYYY/jMM/jDD -> YYYY-MM-DD for picker
            formModel.value[header.key] = DateConverter.toGregorian(v);
          } else if (typeof v === 'string' && v.includes('T')) {
            // Normalize ISO to YYYY-MM-DD for picker
            formModel.value[header.key] = v.split('T')[0];
          }
        }
      });
    } catch (e) {
      console.error('Error normalizing date fields for edit form:', e);
    }
  }
};

const openDeleteDialog = (item: any) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

/**
 * Persists the current form model, converting date fields back to Gregorian
 * (optionally with timezone) before sending to the API. Refreshes the table.
 */
const saveItem = async () => {
  if (!formModel.value) return;

  try {
    // Normalize dates before saving
    const dataToSave = { ...formModel.value };
    props.headers.forEach((header) => {
      if (header.isDate && dataToSave[header.key]) {
        try {
          const raw = dataToSave[header.key];
          if (typeof raw === 'string') {
            const toIsoWithOffset = (ymd: string) => {
              const [y, m, d] = ymd.split('-').map(Number);
              const local = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
              const offsetMin = -local.getTimezoneOffset();
              const sign = offsetMin >= 0 ? '+' : '-';
              const abs = Math.abs(offsetMin);
              const hh = String(Math.floor(abs / 60)).padStart(2, '0');
              const mm = String(abs % 60).padStart(2, '0');
              const mm2 = String(m).padStart(2, '0');
              const dd2 = String(d).padStart(2, '0');
              return `${y}-${mm2}-${dd2}T00:00:00${sign}${hh}:${mm}`;
            };

            if (raw.includes('/')) {
              // Shamsi jYYYY/jMM/jDD -> Gregorian YYYY-MM-DD
              const greg = DateConverter.toGregorian(raw);
              dataToSave[header.key] = props.dateWithTimezone ? toIsoWithOffset(greg) : greg;
            } else if (raw.includes('T')) {
              // ISO string -> keep as is or trim time if not requested
              dataToSave[header.key] = props.dateWithTimezone ? raw : raw.split('T')[0];
            } else {
              // Already YYYY-MM-DD
              dataToSave[header.key] = props.dateWithTimezone ? toIsoWithOffset(raw) : raw;
            }
          }
        } catch (error) {
          console.error(`Error converting date for field ${header.key}:`, error);
        }
      }
    });

    if (isEditing.value && dataToSave.id) {
      await api.update(dataToSave.id, dataToSave);
      snackbarMessage.value = '✅ آیتم با موفقیت بروزرسانی شد!';
    } else {
      const response = await api.create(dataToSave);
      snackbarMessage.value = '✅ آیتم با موفقیت ایجاد شد!';
      if (response.data) items.value.push(response.data);
    }

    snackbar.value = true;
    dialog.value = false;
    await fetchData();
  } catch (err) {
    console.error('خطا در ذخیره اطلاعات', err);
    snackbarMessage.value = '❌ خطا در ذخیره اطلاعات!';
    snackbar.value = true;
  }
};

/**
 * Deletes item by id and refreshes the list.
 */
const deleteItem = async (id: string) => {
  try {
    await api.delete(id);
    deleteDialog.value = false;
    items.value = items.value.filter((item) => item.id !== id);
    await fetchData();
  } catch (err) {
    console.error('خطا در حذف اطلاعات', err);
    snackbarMessage.value = '❌ خطا در حذف اطلاعات!';
    snackbar.value = true;
  }
};

/**
 * Navigates to a dynamic route constructed from the provided route template
 * and the selected item fields. Shows a snackbar if params are missing.
 */
const goToRoute = (key: string, item?: any) => {
  const routes = getRoutesForItem(item);
  if (!routes || !routes[key] || !item) return;

  let routePath = routes[key];
  const missingParams: string[] = [];

  routePath = routePath.replace(/\{(\w+)}/g, (_, field) => {
    if (item[field] !== undefined) {
      return item[field];
    } else {
      missingParams.push(field);
      return `{${field}}`;
    }
  });

  if (missingParams.length > 0) {
    snackbarMessage.value = ` خطا : ${missingParams.join(' , ')}  در خروجی نیست  `;
    snackbar.value = true;
    return;
  }

  router.push(routePath);
};

/**
 * Downloads a file from a URL present on the item. Tries fetch and falls back
 * to axios with blob response, handling common server error content types.
 */
const download = async (key: string, item: any) => {
  if (!props.downloadLink || !item) return;

  const fileKey = props.downloadLink[key];
  const fileUrl = item[fileKey];

  if (!fileUrl) {
    snackbarMessage.value = `❌ لینک فایل یافت نشد.`;
    snackbar.value = true;
    return;
  }

  try {
    // Method 1: Fetch file as blob with proper headers
    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/octet-stream,application/pdf,image/*,*/*',
      },
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response is actually a file or an error
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    console.log('Response headers:', {
      contentType,
      contentLength,
      url: fileUrl
    });

    // If content-type is XML, it's likely an error response
    if (contentType && contentType.includes('xml')) {
      const errorText = await response.text();
      console.error('Server returned XML error:', errorText);
      snackbarMessage.value = `❌ خطای سرور: فایل در دسترس نیست`;
      snackbar.value = true;
      return;
    }

    // If content-length is very small, it might be an error
    if (contentLength && parseInt(contentLength) < 1000) {
      const responseText = await response.text();
      console.log('Small response:', responseText);
      if (responseText.includes('error') || responseText.includes('Error')) {
        snackbarMessage.value = `❌ خطای سرور: فایل در دسترس نیست`;
        snackbar.value = true;
        return;
      }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;

    // Extract filename from URL or use default
    const filename = fileUrl.split('/').pop() || 'download';
    link.download = filename;

    // Add to DOM, click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    window.URL.revokeObjectURL(url);

    snackbarMessage.value = `✅ دانلود شروع شد`;
    snackbar.value = true;
  } catch (error) {
    console.error('Download error:', error);

    // Method 2: Try with axios instance (includes auth headers)
    try {
      const axiosResponse = await axiosInstance.get(fileUrl, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/octet-stream,application/pdf,image/*,*/*',
        }
      });

      // Check response type
      const contentType = axiosResponse.headers['content-type'];
      const contentLength = axiosResponse.headers['content-length'];

      console.log('Axios response headers:', {
        contentType,
        contentLength,
        url: fileUrl
      });

      // If it's XML, convert to text to see the error
      if (contentType && contentType.includes('xml')) {
        const textResponse = await axiosInstance.get(fileUrl, {
          responseType: 'text'
        });
        console.error('Server returned XML error:', textResponse.data);
        snackbarMessage.value = `❌ خطای سرور: فایل در دسترس نیست`;
        snackbar.value = true;
        return;
      }

      const blob = new Blob([axiosResponse.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const filename = fileUrl.split('/').pop() || 'download';
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      snackbarMessage.value = `✅ دانلود شروع شد`;
      snackbar.value = true;
    } catch (axiosError: any) {
      console.error('Axios download error:', axiosError);

      // Try to get the error response as text
      if (axiosError.response) {
        try {
          const errorText = await axiosInstance.get(fileUrl, {
            responseType: 'text'
          });
          console.error('Server error response:', errorText.data);
        } catch (textError) {
          console.error('Could not get error text:', textError);
        }
      }

      snackbarMessage.value = `❌ خطا در دانلود فایل`;
      snackbar.value = true;
    }
  }
};

/**
 * Handles pagination page change and refetches server data.
 */
const handlePageChange = (newPage: number) => {
  currentPage.value = newPage;
  debouncedFetchData();
};

onMounted(() => {
  if (props.autoFetch) {
    fetchData();
  }
});

const openCustomActionDialog = (action: CustomAction, item: any) => {
  customActionComponent.value = action.component;
  customActionItem.value = item;
  customActionDialog.value = true;
};

const getColumnStyle = (column: any, item: any) => {
  const header = props.headers.find((h) => h.key === column.key);
  if (!header) return {};

  const baseStyle = header.style || {};
  if (header.conditionalStyle) {
    const conditionalStyle = header.conditionalStyle(item[column.key], item);
    return { ...baseStyle, ...conditionalStyle };
  }
  return baseStyle;
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

/**
 * Returns the display value for a cell, applying custom renderer/formatter
 * and enum translation when configured on the column header.
 */
const getTranslatedValue = (value: any, column: any, item: any) => {
  const header = props.headers.find((h) => h.key === column.key);
  if (!header) return value;

  // Use custom renderer if provided
  if (header.customRenderer) {
    return header.customRenderer(item);
  }

  // Use custom formatter if provided
  if (header.formatter) {
    return header.formatter(value, item);
  }

  // Money type formatting with separators
  if (String(header.type).toLowerCase() === 'money') {
    try {
      return formatNumberWithCommas(value ?? 0, 0);
    } catch (e) {
      return value;
    }
  }

  if (header.translate) {
    if (header.options) {
      // Find matching option for enum value
      const option = header.options.find((opt) => opt.value === value);
      return option?.title || value;
    }
    // Fallback to basic translation if no options provided
    return translateValue(value);
  }
  return value;
};

const translateValue = (value: string) => {
  // Example translation mapping
  const translations: Record<string, string> = {
    ACTIVE: 'فعال',
    INACTIVE: 'غیرفعال',
    PENDING: 'در انتظار',
    COMPLETED: 'تکمیل شده'
    // Add more translations as needed
  };
  return translations[value] || value;
};

/**
 * Applies currently edited filters and refetches from the first page.
 */
const applyFilter = () => {
  currentPage.value = 1; // Reset to first page when applying new filters
  debouncedFetchData();
  filterDialog.value = false;
};

/**
 * Clears filters and refetches from the first page.
 */
const resetFilter = () => {
  filterModel.value = {};
  currentPage.value = 1;
  debouncedFetchData();
  filterDialog.value = false;
};

// Handle filter apply from custom filter component
/**
 * Receives filter data from a custom filter component and refetches.
 */
const handleFilterApply = (filterData: any) => {
  filterModel.value = filterData;
  currentPage.value = 1;
  debouncedFetchData();
  filterDialog.value = false;
};
</script>

<template>
  <!-- Page Title -->
  <div v-if="props.title" class="page-title">
    <h3 class="title-text">{{ props.title }}</h3>
  </div>

  <!-- Action Buttons OUTSIDE the table container -->
  <div class="action-buttons">
    <v-btn v-if="props.actions?.includes('create')" color="green" class="me-2" @click="openDialog()">ایجاد ✅</v-btn>
    <v-btn v-if="hasFilterComponent" class="me-2" @click="filterDialog = true">فیلتر 🔍</v-btn>
    <v-btn v-if="props.showRefreshButton" color="blue" @click="debouncedFetchData" :loading="loading">بروزرسانی 🔄</v-btn>

    <!-- Selection Actions -->
    <div v-if="props.selectable && hasSelection" class="selection-actions">
      <v-chip color="primary" class="me-2"> {{ selectedCount }} آیتم انتخاب شده </v-chip>
      <v-btn color="orange" size="small" class="me-2" @click="clearSelection"> پاک کردن انتخاب </v-btn>
    </div>
  </div>

  <!-- Data Table Container (fills parent height) -->
  <div class="data-table-container" v-bind="$attrs" role="region" :aria-busy="loading || isLoadingMore" :aria-live="(loading || isLoadingMore) ? 'polite' : 'off'">
    <template v-if="loading && !isLoadingMore">
      <v-skeleton-loader type="table" :loading="loading" class="mx-auto" max-width="100%" :boilerplate="false" />
    </template>
    <template v-else>
      <!-- Grouped Table Structure -->
      <div v-if="props.groupBy && groupedItems.length > 0" class="grouped-table">
        <!-- Group Controls -->
        <div class="group-controls mb-3">
          <v-btn size="small" color="primary" @click="expandAllGroups" class="me-2"> گسترش همه </v-btn>
          <v-btn size="small" color="secondary" @click="collapseAllGroups" class="me-2"> جمع کردن همه </v-btn>
        </div>

        <!-- Single Scrollable Container for All Groups -->
        <div class="groups-scroll-container" :style="{ height: `${props.height - 120}px` }">
          <div class="groups-container">
            <div v-for="group in groupedItems" :key="group.groupKey" class="group-section">
              <!-- Group Header -->
              <div
                class="group-header"
                role="button"
                tabindex="0"
                @click="toggleGroup(group.groupKey)"
                @keydown.enter.prevent="toggleGroup(group.groupKey)"
                @keydown.space.prevent="toggleGroup(group.groupKey)"
                :aria-expanded="group.isExpanded ? 'true' : 'false'"
                :aria-controls="`group-panel-${group.groupKey}`"
                :id="`group-header-${group.groupKey}`"
                :class="{ expanded: group.isExpanded }"
              >
                <IconChevronDown v-if="group.isExpanded" class="me-2 chevron-icon" />
                <IconChevronRight v-else class="me-2 chevron-icon" />
                <span class="group-label">{{ group.groupLabel }}</span>
                <v-chip size="small" color="darkprimary" class="ms-auto">{{ group.count }}</v-chip>
              </div>

              <!-- Group Items -->
              <transition name="group-expand" appear>
                <div v-if="group.isExpanded" class="group-items" :id="`group-panel-${group.groupKey}`" :aria-labelledby="`group-header-${group.groupKey}`" role="region">
                <v-data-table
                  :headers="groupedHeaders"
                  :items="group.items"
                  :items-per-page="itemsPerPage"
                  hide-default-footer
                  class="elevation-1 group-table"
                  no-data-text="رکوردی یافت نشد"
                  hover
                  :height="'auto'"
                >
                  <!-- Custom Header for Selection -->
                  <template v-slot:header.selection="{ column }">
                    <v-checkbox
                      v-if="props.selectable && props.multiSelect"
                      :model-value="selectAll"
                      @update:model-value="toggleSelectAll"
                      :indeterminate="selectedCount > 0 && selectedCount < items.length"
                      hide-details
                      density="compact"
                    />
                  </template>
                  <template v-slot:item="{ item, columns, index }">
                    <tr :style="{ background: index % 2 === 0 ? 'rgb(var(--v-theme-surface))' : 'rgb(var(--v-theme-lightprimary))' }" :tabindex="props.selectable ? 0 : -1" @keydown.enter.prevent="props.selectable && toggleSelection(item)">
                      <td
                        v-for="column in columns"
                        :key="column.key"
                        :style="{
                           ...getColumnStyle(column, item),
                           ...(column.width
                             ? { width: column.width + 'px', minWidth: column.width + 'px', maxWidth: column.width + 'px' }
                             : {})
                         }"
                      >
                        <!-- Selection Checkbox -->
                        <template v-if="column.key === 'selection'">
                          <v-checkbox
                            :model-value="isSelected(item)"
                            @update:model-value="toggleSelection(item)"
                            :disabled="!props.selectable"
                            hide-details
                            density="compact"
                          />
                        </template>
                        <template v-if="column.key === 'actions' && hasAnyActions">
                          <v-btn v-if="props.actions?.includes('edit')" color="blue" size="small" class="mr-2" @click="openDialog(item)">
                            ویرایش ✏️
                          </v-btn>
                          <v-btn
                            v-if="props.actions?.includes('delete')"
                            color="red"
                            size="small"
                            class="mr-2"
                            @click="openDeleteDialog(item)"
                          >حذف ❌
                          </v-btn>
                          <v-btn
                            v-if="props.actions?.includes('view')"
                            color="purple"
                            size="small"
                            class="mr-2"
                            @click="goToRoute('view', item)"
                          >🔍 نمایش
                          </v-btn>
                          <template v-for="(routePath, routeKey) in getRoutesForItem(item)" :key="routeKey">
                            <v-btn color="indigo" size="small" class="mr-2" @click="goToRoute(routeKey, item)">
                              {{ routeKey.toUpperCase() }}
                            </v-btn>
                          </template>
                          <v-btn v-for="(value, key) in props.downloadLink" size="small" class="mr-2" :key="key" @click="download(key, item)">
                            {{ key }} ⬇️
                          </v-btn>
                          <template v-for="(action, index) in props.customActions" :key="action.title || index">
                            <v-btn
                              v-if="!action.condition || action.condition(item)"
                              color="orange"
                              size="small"
                              class="mr-2"
                              @click="openCustomActionDialog(action, item)"
                            >
                              {{ action.title }}
                            </v-btn>
                          </template>
                          <template v-if="props.customButtonsFn">
                            <v-btn
                              v-for="button in props.customButtonsFn(item)"
                              :key="button.label"
                              :color="button.color || 'primary'"
                              size="small"
                              class="mr-2"
                              :disabled="button.disabled"
                              @click="button.onClick(item)"
                            >
                              {{ button.label }}
                            </v-btn>
                          </template>
                          <template v-else>
                            <v-btn
                              v-for="button in props.customButtons"
                              :key="button.label"
                              :color="button.color || 'primary'"
                              size="small"
                              class="mr-2"
                              @click="button.onClick(item)"
                            >
                              {{ button.label }}
                            </v-btn>
                          </template>
                        </template>
                        <template v-else>
                          {{ getTranslatedValue(getNestedValue(item, column.key), column, item) }}
                        </template>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <!-- Regular Table Structure (when not grouped) -->
      <v-data-table
        v-else
        :headers="normalHeaders"
        :items="items"
        :items-per-page="itemsPerPage"
        hide-default-footer
        class="elevation-1"
        no-data-text="رکوردی یافت نشد"
        hover
        fixed-header
        :height="props.height"
      >
        <!-- Custom Header for Selection -->
        <template v-slot:header.selection="{ column }">
          <v-checkbox
            v-if="props.selectable && props.multiSelect"
            :model-value="selectAll"
            @update:model-value="toggleSelectAll"
            :indeterminate="selectedCount > 0 && selectedCount < items.length"
            hide-details
            density="compact"
          />
        </template>
        <template v-slot:item="{ item, columns, index }">
          <tr :style="{ background: index % 2 === 0 ? 'rgb(var(--v-theme-surface))' : 'rgb(var(--v-theme-lightprimary))' }" :tabindex="props.selectable ? 0 : -1" @keydown.enter.prevent="props.selectable && toggleSelection(item)">
            <td
              v-for="column in columns"
              :key="column.key"
              :style="{
                 ...getColumnStyle(column, item),
                 ...(column.width ? { width: column.width + 'px', minWidth: column.width + 'px', maxWidth: column.width + 'px' } : {})
               }"
            >
              <!-- Selection Checkbox -->
              <template v-if="column.key === 'selection'">
                <v-checkbox
                  :model-value="isSelected(item)"
                  @update:model-value="toggleSelection(item)"
                  :disabled="!props.selectable"
                  hide-details
                  density="compact"
                />
              </template>
              <template v-if="column.key === 'actions' && hasAnyActions">
                <v-btn v-if="props.actions?.includes('edit')" color="blue" size="small" class="mr-2" @click="openDialog(item)">
                  ویرایش ✏️
                </v-btn>
                <v-btn v-if="props.actions?.includes('delete')" color="red" size="small" class="mr-2" @click="openDeleteDialog(item)"
                >حذف ❌
                </v-btn>
                <v-btn v-if="props.actions?.includes('view')" color="purple" size="small" class="mr-2" @click="goToRoute('view', item)"
                >🔍 نمایش
                </v-btn>
                <template v-for="(routePath, routeKey) in getRoutesForItem(item)" :key="routeKey">
                  <v-btn color="indigo" size="small" class="mr-2" @click="goToRoute(routeKey, item)">
                    {{ routeKey.toUpperCase() }}
                  </v-btn>
                </template>
                <v-btn v-for="(value, key) in props.downloadLink" size="small" class="mr-2" :key="key" @click="download(key, item)">
                  {{ key }} ⬇️
                </v-btn>
                <template v-for="(action, index) in props.customActions" :key="action.title || index">
                  <v-btn
                    v-if="!action.condition || action.condition(item)"
                    color="orange"
                    size="small"
                    class="mr-2"
                    @click="openCustomActionDialog(action, item)"
                  >
                    {{ action.title }}
                  </v-btn>
                </template>
                <template v-if="props.customButtonsFn">
                  <v-btn
                    v-for="button in props.customButtonsFn(item)"
                    :key="button.label"
                    :color="button.color || 'primary'"
                    size="small"
                    class="mr-2"
                    :disabled="button.disabled"
                    @click="button.onClick(item)"
                  >
                    {{ button.label }}
                  </v-btn>
                </template>
                <template v-else>
                  <v-btn
                    v-for="button in props.customButtons"
                    :key="button.label"
                    :color="button.color || 'primary'"
                    size="small"
                    class="mr-2"
                    @click="button.onClick(item)"
                  >
                    {{ button.label }}
                  </v-btn>
                </template>
              </template>
              <template v-else>
                {{ getTranslatedValue(getNestedValue(item, column.key), column, item) }}
              </template>
            </td>
          </tr>
        </template>
      </v-data-table>

      <!-- Loading indicator for infinite scroll -->
      <div v-if="isLoadingMore" class="d-flex justify-center align-center pa-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
    </template>

    <!-- Custom Pagination always visible at the bottom -->
    <div v-if="props.showPagination" class="pagination-wrapper">
      <div class="d-flex justify-space-between align-center pa-4">
        <div class="text-subtitle-2">
          نمایش {{ (currentPage - 1) * itemsPerPage + 1 }} تا {{ Math.min(currentPage * itemsPerPage, totalSize) }} از {{ totalSize }} رکورد
        </div>
        <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5" size="small" @update:model-value="handlePageChange" />
      </div>
    </div>
  </div>

  <v-dialog v-model="dialog" max-width="1400">
    <v-card>
      <v-card-title>{{ isEditing ? 'ویرایش' : 'ایجاد' }}</v-card-title>
      <v-card-text>
        <v-container>
          <component v-if="props.formComponent" :is="props.formComponent" v-model="formModel" />
          <template v-else>
            <v-row>
              <v-col v-for="header in props.headers" :key="header.key" cols="12" md="4">
                <template v-if="!header.hidden">
                  <MoneyInput
                    v-if="String(header.type).toLowerCase() === 'money'"
                    v-model="formModel[header.key]"
                    :label="header.title"
                    :disabled="header.editable === false"
                  />
                  <v-text-field
                    v-else
                    v-model="formModel[header.key]"
                    :label="header.title"
                    variant="outlined"
                    :disabled="header.editable === false"
                    :type="header.type"
                  />
                </template>
              </v-col>
            </v-row>
          </template>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="tonal" color="error" @click="dialog = false">انصراف</v-btn>
        <v-btn color="primary" var @click="saveItem">{{ isEditing ? 'ذخیره' : 'ایجاد' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title>حذف آیتم</v-card-title>
      <v-card-text> آیا مایل به حذف این رکورد هستید ?</v-card-text>
      <v-card-actions>
        <v-btn color="grey" @click="deleteDialog = false">انصراف</v-btn>
        <v-btn color="red" @click="deleteItem(itemToDelete?.id)">حذف</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="customActionDialog" max-width="1300">
    <v-card>
      <v-card-title>
        {{ props.customActions?.find((a) => a.component === customActionComponent)?.title || '' }}
      </v-card-title>
      <v-card-text>
        <component v-if="customActionComponent" :is="customActionComponent" :item="customActionItem" @close="customActionDialog = false" />
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Filter Dialog -->
  <v-dialog v-model="filterDialog" max-width="800">
    <v-card>
      <v-card-title>فیلتر</v-card-title>
      <v-card-text>
        <component
          v-if="props.filterComponent"
          :is="props.filterComponent"
          v-model="filterModel"
          @update:modelValue="filterModel = $event"
          @apply="handleFilterApply"
        />
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Snackbar for messages -->
  <v-snackbar v-if="snackbar" v-model="snackbar" :timeout="3000" location="top">
    {{ snackbarMessage }}
    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="snackbar = false">
        بستن
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
.data-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid rgb(var(--v-theme-borderLight));
}

/* Grouped Table Styles */
.grouped-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.group-controls {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  flex-shrink: 0;
}

.groups-scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
}

.group-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgb(var(--v-theme-lightprimary)) 0%, rgb(var(--v-theme-lightsecondary)) 100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgb(var(--v-theme-borderLight));
}

.group-header:hover {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary200)) 0%, rgb(var(--v-theme-secondary200)) 100%);
}

.group-header.expanded {
  background: rgb(var(--v-theme-lightsecondary))
}

.group-label {
  font-weight: 600;
  color: rgb(var(--v-theme-darksecondary));
  flex: 1;
}

.group-items {
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
}

/* Group expansion transitions */
.group-expand-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 0;
  opacity: 0;
}

.group-expand-enter-to {
  max-height: 1000px;
  opacity: 1;
}

.group-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1000px;
  opacity: 1;
}

.group-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Chevron icon rotation */
.chevron-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.group-header.expanded .chevron-icon {
  transform: rotate(0deg);
}

.group-header:not(.expanded) .chevron-icon {
  transform: rotate(-90deg);
}

.group-table {
  border: none !important;
  box-shadow: none !important;
}

.group-table :deep(.v-data-table__wrapper) {
  border: none !important;
  overflow: visible !important;
}

.group-table :deep(.v-data-table__thead) {
  background: rgb(var(--v-theme-lightprimary)) !important;
}

.group-table :deep(.v-data-table__tbody tr:hover) {
  background: rgb(var(--v-theme-primary200)) !important;
}

.group-table :deep(.v-data-table__tbody) {
  overflow: visible !important;
}

.pagination-wrapper {
  flex-shrink: 0;
  border-top: 1px solid rgb(var(--v-theme-borderLight));
  background: rgb(var(--v-theme-surface));
  z-index: 2;
}

.page-title {
  margin-bottom: 16px;
  padding: 16px 0 8px 0;
  border-bottom: 1px solid rgb(var(--v-theme-borderLight));
}

.title-text {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--v-primary-base);
}

.action-buttons {
  margin-bottom: 16px;
  padding: 0 0 8px 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.selection-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}

:deep(.v-data-table__wrapper table thead) {
  position: sticky;
  top: 0;
  background: rgb(var(--v-theme-surface));
  z-index: 1;
  box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.04);
}

:deep(.v-data-table__wrapper tbody tr:nth-child(even)) {
  background: rgb(var(--v-theme-lightprimary)) !important;
}

:deep(.v-data-table__wrapper tbody tr:nth-child(odd)) {
  background: rgb(var(--v-theme-surface)) !important;
}
</style>
