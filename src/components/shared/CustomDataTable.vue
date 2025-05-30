<script setup lang="ts">
import { computed, onMounted, ref, watch, shallowRef } from 'vue';
import axiosInstance from '@/services/axiosInstance';
import apiService from '@/services/apiService';
import { useRouter } from 'vue-router';
import type { Component } from 'vue';
import { DateConverter } from '@/utils/date-convertor';

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
}

interface CustomAction {
  title: string;
  component: Component;
}

interface CustomButtonAction {
  label: string;
  color?: string;
  onClick: (item: any) => void;
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
  filterComponent?: Component;
  autoFetch?: boolean;
  queryParams?: Record<string, any>;
  showPagination?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoFetch: true,
  showPagination: true
});

const items = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const dialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const editedItem = ref<Record<string, any> | null>(null);
const formModel = ref<Record<string, any>>({});
const itemToDelete = ref<Record<string, any> | null>(null);
const snackbar = ref(true);
const snackbarMessage = ref('');
const router = useRouter();
const itemsPerPage = ref(10);
const totalSize = ref(0);
const totalPages = ref(0);
const currentPage = ref(1);
const sortBy = ref<{ key: string; order: 'asc' | 'desc' } | null>(null);
const filterDialog = ref(false);
const filterModel = ref<Record<string, any>>({});
const tableRef = ref<HTMLElement | null>(null);
const isLoadingMore = ref(false);
const hasMore = ref(true);

// Add a computed property to clean filter values
const cleanFilterModel = computed(() => {
  const cleaned: Record<string, any> = {};
  Object.entries(filterModel.value).forEach(([key, value]) => {
    // Check if value is not null, undefined, empty string, or empty array
    if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      cleaned[key] = value;
    }
  });
  return cleaned;
});

const api = apiService(axiosInstance, props.apiResource);
const customActionDialog = ref(false);
const customActionComponent = shallowRef<Component | null>(null);
const customActionItem = ref<any>(null);

const hasFilterComponent = computed(() => {
  return !!props.filterComponent;
});

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
  } catch (err) {
    console.error('Error loading more items:', err);
    currentPage.value--; // Revert page number on error
  } finally {
    isLoadingMore.value = false;
  }
};

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

    totalSize.value = response.data.totalElements;
    totalPages.value = response.data.totalPages;
    hasMore.value = currentPage.value < response.data.totalPages;
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

// Expose methods to parent component
defineExpose({
  fetchData,
  items
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

// The current download function is commented out. Here's a working version:
const download = (key: string, item: any) => {
  if (!props.downloadLink || !item) return;

  const fileKey = props.downloadLink[key];
  const fileUrl = item[fileKey];

  if (!fileUrl) {
    snackbarMessage.value = `❌ لینک فایل یافت نشد.`;
    snackbar.value = true;
    return;
  }

  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = ''; // or provide a filename
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// const sortedItems = computed(() => {
//   if (!sortBy.value) {
//     const defaultKey = props.headers[0]?.key;
//     return defaultKey ? [...items.value].sort((a, b) => (a[defaultKey] < b[defaultKey] ? -1 : 1)) : items.value;
//   }
//
//   const { key, order } = sortBy.value;
//   return [...items.value].sort((a, b) => {
//     const orderFactor = order === 'asc' ? 1 : -1;
//     if (a[key] < b[key]) return -1 * orderFactor;
//     if (a[key] > b[key]) return 1 * orderFactor;
//     return 0;
//   });
// });

watch(currentPage, fetchData); // 👈 add this line

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

const getTranslatedValue = (value: any, column: any) => {
  const header = props.headers.find((h) => h.key === column.key);
  if (!header) return value;

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
  fetchData();
  filterDialog.value = false;
};

const resetFilter = () => {
  filterModel.value = {};
  currentPage.value = 1;
  fetchData();
  filterDialog.value = false;
};
</script>

<template>
  <!-- Action Buttons OUTSIDE the table container -->
  <div class="action-buttons">
    <v-btn v-if="props.actions?.includes('create')" color="green" class="me-2" @click="openDialog()">ایجاد ✅</v-btn>
    <v-btn v-if="hasFilterComponent" @click="filterDialog = true">فیلتر 🔍</v-btn>
  </div>

  <!-- Data Table Container (fills parent height) -->
  <div class="data-table-container">
    <div class="table-wrapper">
      <template v-if="loading && !isLoadingMore">
        <v-skeleton-loader type="table" :loading="loading" class="mx-auto" max-width="100%" :boilerplate="false" />
      </template>
      <template v-else>
        <v-data-table
          :headers="[...props.headers, { title: 'عملیات', key: 'actions', sortable: false }]"
          :items="items"
          hide-default-footer
          class="elevation-1"
          no-data-text="رکوردی یافت نشد"
          hover
          fixed-header
          :height="300"
        >
          <template v-slot:item="{ item, columns }">
            <tr>
              <td v-for="column in columns" :key="column.key" :style="getColumnStyle(column, item)">
                <template v-if="column.key === 'actions'">
                  <v-btn v-if="props.actions?.includes('edit')" color="blue" size="small" class="mr-2" @click="openDialog(item)">
                    ویرایش ✏️
                  </v-btn>
                  <v-btn v-if="props.actions?.includes('delete')" color="red" size="small" class="mr-2" @click="openDeleteDialog(item)"
                    >حذف ❌
                  </v-btn>
                  <v-btn v-if="props.actions?.includes('view')" color="purple" size="small" class="mr-2" @click="goToRoute('view', item)"
                    >🔍 نمایش
                  </v-btn>
                  <template v-for="(route, key) in props.routes" :key="key">
                    <v-btn color="indigo" size="small" class="mr-2" @click="goToRoute(key, item)">
                      {{ key.toUpperCase() }}
                    </v-btn>
                  </template>
                  <v-btn v-for="(link, key) in props.downloadLink" size="small" class="mr-2" :key="key" @click="download(key, item)">
                    {{ key.toUpperCase() }} ⬇️
                  </v-btn>
                  <v-btn
                    v-for="action in props.customActions"
                    :key="action.title"
                    color="orange"
                    size="small"
                    class="mr-2"
                    @click="openCustomActionDialog(action, item)"
                  >
                    {{ action.title }}
                  </v-btn>
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
                <template v-else>
                  {{ getTranslatedValue(item[column.key], column) }}
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
    </div>

    <!-- Custom Pagination always visible at the bottom -->
    <div v-if="props.showPagination" class="pagination-wrapper">
      <div class="d-flex justify-space-between align-center pa-4">
        <div class="text-subtitle-2">
          نمایش {{ (currentPage - 1) * itemsPerPage + 1 }} تا {{ Math.min(currentPage * itemsPerPage, totalSize) }} از {{ totalSize }} رکورد
        </div>
        <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5" size="small" @update:model-value="fetchData" />
      </div>
    </div>
  </div>

  <v-dialog v-model="dialog" max-width="800">
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
                />
              </v-col>
            </v-row>
          </template>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey" @click="dialog = false">انصراف</v-btn>
        <v-btn color="green" @click="saveItem">{{ isEditing ? 'ذخیره' : 'ایجاد' }}</v-btn>
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

  <v-dialog v-model="customActionDialog" max-width="800">
    <v-card>
      <v-card-title>
        {{ props.customActions?.find((a) => a.component === customActionComponent)?.title || '' }}
      </v-card-title>
      <v-card-text>
        <component
          v-if="customActionComponent"
          :is="customActionComponent"
          :item="customActionItem"
          @close="customActionDialog = false"
        />
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
        />
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey" @click="filterDialog = false">انصراف</v-btn>
        <v-btn color="primary" @click="applyFilter">اعمال فیلتر</v-btn>
        <v-btn color="error" @click="resetFilter">پاک کردن فیلتر</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.data-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.table-wrapper {
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  /* No overflow here, let v-data-table handle scroll */
}

.pagination-wrapper {
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
  z-index: 2;
}

.action-buttons {
  margin-bottom: 16px;
  padding: 0 0 8px 0;
}

:deep(.v-data-table__wrapper) {
  overflow: visible;
}

:deep(.v-data-table__wrapper table thead) {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  box-shadow: 0 2px 4px -2px rgba(0,0,0,0.04);
}
</style>