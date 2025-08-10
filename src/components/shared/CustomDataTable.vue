<script setup lang="ts">
import { computed, onMounted, ref, watch, shallowRef, onBeforeUnmount } from 'vue';
import axiosInstance from '@/services/axiosInstance';
import apiService from '@/services/apiService';
import { useRouter } from 'vue-router';
import type { Component } from 'vue';
import { DateConverter } from '@/utils/date-convertor';
import { useDebounceFn } from '@vueuse/core';
import { IconChevronRight, IconChevronDown } from '@tabler/icons-vue';

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

interface Props {
  apiResource: string;
  headers: Header[];
  actions?: ('create' | 'edit' | 'delete' | 'view')[];
  routes?: Record<string, string>;
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
  defaultExpanded: false
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

// Selection state
const selectedItems = ref<any[]>([]);
const selectAll = ref(false);

// Grouping state
const groupedItems = ref<
  Array<{
    groupKey: string | number;
    groupLabel: string;
    items: any[];
    isExpanded: boolean;
    count: number;
  }>
>([]);
const expandedGroups = ref<Set<string | number>>(new Set());

// Computed flag to determine if any actions should be shown
const hasAnyActions = computed(() => {
  const hasCrudActions = Array.isArray(props.actions) && props.actions.length > 0;
  const hasRoutes = !!props.routes && Object.keys(props.routes).length > 0;
  const hasDownloadLinks = !!props.downloadLink && Object.keys(props.downloadLink).length > 0;
  const hasCustomActions = Array.isArray(props.customActions) && props.customActions.length > 0;
  const hasCustomButtons = (Array.isArray(props.customButtons) && props.customButtons.length > 0) || !!props.customButtonsFn;
  return hasCrudActions || hasRoutes || hasDownloadLinks || hasCustomActions || hasCustomButtons;
});

const selectionHeader = { title: '', key: 'selection', sortable: false, width: 50 } as const;

const groupedHeaders = computed(() => {
  const base = [
    ...(props.selectable ? [selectionHeader] : []),
    ...props.headers,
  ];
  return hasAnyActions.value
    ? [...base, { title: 'عملیات', key: 'actions', sortable: false }]
    : base;
});

const normalHeaders = computed(() => {
  const base = [
    ...(props.selectable ? [selectionHeader] : []),
    ...props.headers,
  ];
  return hasAnyActions.value
    ? [...base, { title: 'عملیات', key: 'actions', sortable: false, width: props.customActions?.length ? props.customActions.length * 120 : 650 }]
    : base;
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

// Helper function to get group label
const getGroupLabel = (groupKey: string | number, groupItems: any[]): string => {
  if (props.groupHeaderTemplate) {
    return props.groupHeaderTemplate(groupKey, groupItems);
  }

  return `${groupKey} (${groupItems.length} آیتم)`;
};

// Function to group items
const groupItems = (items: any[]) => {
  if (!props.groupBy) {
    groupedItems.value = [];
    return;
  }

  const groups = new Map<string | number, any[]>();

  // Group items by the specified property
  items.forEach((item) => {
    const groupKey = getGroupValue(item);
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(item);
  });

  // Convert to array format
  groupedItems.value = Array.from(groups.entries()).map(([groupKey, groupItems]) => ({
    groupKey,
    groupLabel: getGroupLabel(groupKey, groupItems),
    items: groupItems,
    isExpanded: props.defaultExpanded || expandedGroups.value.has(groupKey),
    count: groupItems.length
  }));

  // Sort groups by key
  groupedItems.value.sort((a, b) => {
    if (typeof a.groupKey === 'string' && typeof b.groupKey === 'string') {
      return a.groupKey.localeCompare(b.groupKey);
    }
    return a.groupKey < b.groupKey ? -1 : a.groupKey > b.groupKey ? 1 : 0;
  });
};

// Selection methods
const toggleSelection = (item: any) => {
  if (!props.selectable) return;

  const itemUniqueValue = getUniqueValue(item);
  const index = selectedItems.value.findIndex((selected) => getUniqueValue(selected) === itemUniqueValue);

  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    if (props.multiSelect) {
      selectedItems.value.push(item);
    } else {
      selectedItems.value = [item];
    }
  }

  // Emit selection change events
  emit('update:selectedItems', selectedItems.value);
  emit('selection-change', selectedItems.value);
};

const toggleSelectAll = () => {
  if (!props.selectable || !props.multiSelect) return;

  if (selectAll.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = [...items.value];
  }
  selectAll.value = !selectAll.value;

  // Emit selection change events
  emit('update:selectedItems', selectedItems.value);
  emit('selection-change', selectedItems.value);
};

// Group toggle function
const toggleGroup = (groupKey: string | number) => {
  const group = groupedItems.value.find((g) => g.groupKey === groupKey);
  if (group) {
    group.isExpanded = !group.isExpanded;

    if (group.isExpanded) {
      expandedGroups.value.add(groupKey);
    } else {
      expandedGroups.value.delete(groupKey);
    }
  }
};

// Expand all groups
const expandAllGroups = () => {
  groupedItems.value.forEach((group) => {
    group.isExpanded = true;
    expandedGroups.value.add(group.groupKey);
  });
};

// Collapse all groups
const collapseAllGroups = () => {
  groupedItems.value.forEach((group) => {
    group.isExpanded = false;
    expandedGroups.value.delete(group.groupKey);
  });
};

const isSelected = (item: any) => {
  const itemUniqueValue = getUniqueValue(item);
  return selectedItems.value.some((selected) => getUniqueValue(selected) === itemUniqueValue);
};

// Computed properties for selection
const selectedCount = computed(() => selectedItems.value.length);
const hasSelection = computed(() => selectedItems.value.length > 0);

// Clear selection method
const clearSelection = () => {
  selectedItems.value = [];
  selectAll.value = false;

  // Emit selection change events
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

// Modify fetchData to handle pagination correctly
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

    // Group items if groupBy is specified
    groupItems(items.value);

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

// Load more data
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
  // Grouping methods
  groupedItems,
  toggleGroup,
  expandAllGroups,
  collapseAllGroups,
  groupItems
});

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
};

const openDeleteDialog = (item: any) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const saveItem = async () => {
  if (!formModel.value) return;

  try {
    // Convert Shamsi dates back to Gregorian before saving
    const dataToSave = { ...formModel.value };
    props.headers.forEach((header) => {
      if (header.isDate && dataToSave[header.key]) {
        try {
          dataToSave[header.key] = DateConverter.toGregorian(dataToSave[header.key]);
        } catch (error) {
          console.error(`Error converting date for field ${header.key}:`, error);
        }
      }
    });

    if (isEditing.value && dataToSave.id) {
      await api.update(dataToSave);
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

const goToRoute = (key: string, item?: any) => {
  if (!props.routes || !props.routes[key] || !item) return;

  let routePath = props.routes[key];
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

// Improved download function with proper URL handling
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

// Handle page change from pagination
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

const applyFilter = () => {
  currentPage.value = 1; // Reset to first page when applying new filters
  debouncedFetchData();
  filterDialog.value = false;
};

const resetFilter = () => {
  filterModel.value = {};
  currentPage.value = 1;
  debouncedFetchData();
  filterDialog.value = false;
};

// Handle filter apply from custom filter component
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
  <div class="data-table-container" v-bind="$attrs">
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
              <div class="group-header" @click="toggleGroup(group.groupKey)" :class="{ expanded: group.isExpanded }">
                <IconChevronRight v-if="group.isExpanded" class="me-2" />
                <IconChevronDown v-else class="me-2" />
                <span class="group-label">{{ group.groupLabel }}</span>
                <v-chip size="small" color="primary" class="ms-auto">{{ group.count }}</v-chip>
              </div>

              <!-- Group Items -->
              <div v-if="group.isExpanded" class="group-items">
                <v-data-table
                  :headers="groupedHeaders"
                  :items="group.items"
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
                    <tr :style="{ background: index % 2 === 0 ? '#fff' : '#f5f7fa' }">
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
                          <template v-for="(routePath, routeKey) in props.routes" :key="routeKey">
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
            </div>
          </div>
        </div>
      </div>

      <!-- Regular Table Structure (when not grouped) -->
      <v-data-table
        v-else
        :headers="normalHeaders"
        :items="items"
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
          <tr :style="{ background: index % 2 === 0 ? '#fff' : '#f5f7fa' }">
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
                <template v-for="(routePath, routeKey) in props.routes" :key="routeKey">
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
                <v-text-field
                  v-model="formModel[header.key]"
                  :label="header.title"
                  variant="outlined"
                  :disabled="header.editable === false"
                  v-if="!header.hidden"
                  :type="header.type"
                />
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
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
  background: linear-gradient(135deg, #f5f7fa 0%, #e3ebeb 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #e0e0e0;
}

.group-header:hover {
  background: linear-gradient(135deg, #e3f2fd 0%, #e3ebeb 100%);
}

.group-header.expanded {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
}

.group-label {
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.group-items {
  background: white;
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
  background: #f8f9fa !important;
}

.group-table :deep(.v-data-table__tbody tr:hover) {
  background: #f5f7fa !important;
}

.group-table :deep(.v-data-table__tbody) {
  overflow: visible !important;
}

.pagination-wrapper {
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
  z-index: 2;
}

.page-title {
  margin-bottom: 16px;
  padding: 16px 0 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
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
  background: white;
  z-index: 1;
  box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.04);
}

:deep(.v-data-table__wrapper tbody tr:nth-child(even)) {
  background: #f5f7fa !important;
}

:deep(.v-data-table__wrapper tbody tr:nth-child(odd)) {
  background: #fff !important;
}
</style>
