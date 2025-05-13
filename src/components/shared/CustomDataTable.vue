<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import axiosInstance from '@/services/axiosInstance';
import apiService from '@/services/apiService';
import { useRouter } from 'vue-router';
import Loading from '@/components/Loading.vue';
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
  apiResource?: string;
  headers: Header[];
  itemsData?: any[];
  actions?: ('create' | 'edit' | 'delete' | 'view')[];
  routes?: Record<string, string>;
  downloadLink?: Record<string, string>;
  formComponent?: Component;
  customActions?: CustomAction[];
  customButtons?: CustomButtonAction[];
  filterComponent?: Component;
  autoFetch?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoFetch: true,
  itemsData: undefined
});

const localItemsStore = ref<any[]>([]);
const isLocalDataMode = computed(() => Array.isArray(props.itemsData));

watchEffect(() => {
  if (isLocalDataMode.value && props.itemsData) {
    localItemsStore.value = JSON.parse(JSON.stringify(props.itemsData));
    currentPage.value = 1;
    totalSize.value = localItemsStore.value.length;
    totalPages.value = Math.ceil(localItemsStore.value.length / itemsPerPage.value);
  } else {
    localItemsStore.value = [];
  }
});

const api = ref<ReturnType<typeof apiService> | null>(null);
watchEffect(() => {
  if (props.apiResource) {
    api.value = apiService(axiosInstance, props.apiResource);
  } else {
    api.value = null;
  }
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

const cleanFilterModel = computed(() => {
  const cleaned: Record<string, any> = {};
  Object.entries(filterModel.value).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '' && 
        !(Array.isArray(value) && value.length === 0)) {
      cleaned[key] = value;
    }
  });
  return cleaned;
});

const customActionDialog = ref(false);
const customActionComponent = ref<Component | null>(null);
const customActionItem = ref<any>(null);

const hasFilterComponent = computed(() => {
  return !!props.filterComponent;
});

const fetchData = async () => {
  if (isLocalDataMode.value) {
    loading.value = true;
    localItemsStore.value = localItemsStore.value.map(item => {
      const newItem = { ...item };
      props.headers.forEach(header => {
        if (header.isDate && newItem[header.key] && typeof newItem[header.key] === 'string') {
          try {
            // Assuming DateConverter is available and working
            // newItem[header.key] = DateConverter.toShamsi(newItem[header.key]);
          } catch (error) {
            console.error(`Error converting date for field ${header.key}:`, error);
          }
        }
      });
      return newItem;
    });
    totalSize.value = localItemsStore.value.length;
    totalPages.value = Math.ceil(totalSize.value / itemsPerPage.value);
    if (currentPage.value > totalPages.value && totalPages.value > 0) currentPage.value = totalPages.value;
    else if (totalPages.value === 0) currentPage.value = 1;
    loading.value = false;
    return;
  }

  if (!api.value) {
    items.value = [];
    totalSize.value = 0;
    totalPages.value = 0;
    loading.value = false;
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const response = await api.value.fetch(currentPage.value - 1, itemsPerPage.value, cleanFilterModel.value);
    items.value = response.data.content || [];
    
    // Convert dates to Shamsi format
    items.value = items.value.map(item => {
      const newItem = { ...item };
      props.headers.forEach(header => {
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

  const dataToSave = { ...formModel.value };
  props.headers.forEach(header => {
    if (header.isDate && dataToSave[header.key]) {
      try {
        // Assuming DateConverter is available and working
        // dataToSave[header.key] = DateConverter.toGregorian(dataToSave[header.key]);
      } catch (error) {
        console.error(`Error converting date for field ${header.key}:`, error);
      }
    }
  });

  if (isLocalDataMode.value) {
    if (isEditing.value && dataToSave.id) {
      const index = localItemsStore.value.findIndex(item => item.id === dataToSave.id);
      if (index !== -1) {
        localItemsStore.value.splice(index, 1, { ...dataToSave });
      } else {
        // Item not found for update, could add as new or show error
        localItemsStore.value.push({ ...dataToSave, id: Date.now().toString() }); // Add as new if not found
      }
    } else {
      localItemsStore.value.push({ ...dataToSave, id: dataToSave.id || Date.now().toString() });
    }
    // Manually trigger re-computation for displayed items if not automatically picked up by totalSize/totalPages change
    // This might involve a trick or ensuring dependencies of processedAndPaginatedItems are robustly reactive
    // For now, let's assume changes to localItemsStore directly trigger computed prop updates.
    // Update totalSize and totalPages as they are used by pagination display
    totalSize.value = localItemsStore.value.length; 
    totalPages.value = Math.ceil(localItemsStore.value.length / itemsPerPage.value);
    if (currentPage.value > totalPages.value && totalPages.value > 0) currentPage.value = totalPages.value;
    else if (totalPages.value === 0) currentPage.value = 1;

    snackbarMessage.value = '✅ آیتم با موفقیت در لیست محلی ذخیره شد!';
  } else if (api.value) { // API mode
    try {
      if (isEditing.value && dataToSave.id) {
        await api.value.update(dataToSave);
        snackbarMessage.value = '✅ آیتم با موفقیت بروزرسانی شد!';
      } else {
        const response = await api.value.create(dataToSave);
        snackbarMessage.value = '✅ آیتم با موفقیت ایجاد شد!';
        // if (response.data) items.value.push(response.data); // This might not be needed if fetchData is called
      }
      await fetchData(); // Refresh data from API
    } catch (err) {
      console.error('خطا در ذخیره اطلاعات', err);
      snackbarMessage.value = '❌ خطا در ذخیره اطلاعات!';
      snackbar.value = true; // Show error snackbar
      return; // Prevent closing dialog on error
    }
  } else {
    error.value = "ذخیره سازی پیکربندی نشده است (نه آیتم محلی و نه منبع API).";
    snackbarMessage.value = '❌ خطا در ذخیره اطلاعات!';
    snackbar.value = true;
    return;
  }

  snackbar.value = true;
  dialog.value = false;
};

const deleteItem = async (id: string) => {
  if (isLocalDataMode.value) {
    localItemsStore.value = localItemsStore.value.filter((item) => item.id !== id);
    totalSize.value = localItemsStore.value.length;
    totalPages.value = Math.ceil(localItemsStore.value.length / itemsPerPage.value);
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value;
    } else if (totalPages.value === 0) {
      currentPage.value = 1;
    }
    snackbarMessage.value = '✅ آیتم با موفقیت از لیست محلی حذف شد!';
  } else if (api.value) { // API mode
    try {
      await api.value.delete(id);
      await fetchData(); // Refresh data from API
      snackbarMessage.value = '✅ آیتم با موفقیت حذف شد!';
    } catch (err) {
      console.error('خطا در حذف اطلاعات', err);
      snackbarMessage.value = '❌ خطا در حذف اطلاعات!';
      snackbar.value = true; // Show error snackbar
      return; // Prevent closing dialog on error
    }
  } else {
    error.value = "حذف پیکربندی نشده است (نه آیتم محلی و نه منبع API).";
    snackbarMessage.value = '❌ خطا در حذف اطلاعات!';
    snackbar.value = true;
    return;
  }

  deleteDialog.value = false;
  snackbar.value = true;
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
  link.download = '';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const processedAndPaginatedItems = computed(() => {
  if (isLocalDataMode.value) {
    let itemsToDisplay = [...localItemsStore.value];

    if (Object.keys(cleanFilterModel.value).length > 0) {
      itemsToDisplay = itemsToDisplay.filter(item => {
        return Object.entries(cleanFilterModel.value).every(([key, filterValue]) => {
          if (item[key] === undefined || item[key] === null) return false;
          return String(item[key]).toLowerCase().includes(String(filterValue).toLowerCase());
        });
      });
    }

    totalSize.value = itemsToDisplay.length;
    totalPages.value = Math.ceil(itemsToDisplay.length / itemsPerPage.value);
    
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
    } else if (totalPages.value === 0 && itemsToDisplay.length === 0) {
        currentPage.value = 1;
    }

    if (sortBy.value) {
      const { key, order } = sortBy.value;
      itemsToDisplay.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        const orderFactor = order === 'asc' ? 1 : -1;

        if (valA === null || valA === undefined) return 1 * orderFactor;
        if (valB === null || valB === undefined) return -1 * orderFactor;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * orderFactor;
        } else {
          return String(valA).localeCompare(String(valB)) * orderFactor;
        }
      });
    }

    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return itemsToDisplay.slice(start, end);
  }
  return items.value;
});

watch(currentPage, () => {
  if (!isLocalDataMode.value) {
    fetchData();
  }
});

onMounted(() => {
  if (isLocalDataMode.value) {
    fetchData();
  } else if (props.autoFetch && props.apiResource) {
    fetchData();
  }
});

const openCustomActionDialog = (action: CustomAction, item: any) => {
  customActionComponent.value = action.component;
  customActionItem.value = item;
  customActionDialog.value = true;
};

const getColumnStyle = (column: any, item: any) => {
  const header = props.headers.find(h => h.key === column.key);
  if (!header) return {};

  const baseStyle = header.style || {};
  if (header.conditionalStyle) {
    const conditionalStyle = header.conditionalStyle(item[column.key], item);
    return { ...baseStyle, ...conditionalStyle };
  }
  return baseStyle;
};

const getTranslatedValue = (value: any, column: any) => {
  const header = props.headers.find(h => h.key === column.key);
  if (!header) return value;

  if (header.translate) {
    if (header.options) {
      const option = header.options.find(opt => opt.value === value);
      return option?.title || value;
    }
    return translateValue(value);
  }
  return value;
};

const translateValue = (value: string) => {
  const translations: Record<string, string> = {
    'ACTIVE': 'فعال',
    'INACTIVE': 'غیرفعال',
    'PENDING': 'در انتظار',
    'COMPLETED': 'تکمیل شده',
  };
  return translations[value] || value;
};

const applyFilter = () => {
  currentPage.value = 1;
  if (!isLocalDataMode.value) {
    fetchData();
  }
  filterDialog.value = false;
};

const resetFilter = () => {
  filterModel.value = {};
  currentPage.value = 1;
  if (!isLocalDataMode.value) {
    fetchData();
  }
  filterDialog.value = false;
};
</script>

<template>
  <v-snackbar v-model="snackbar" color="red" timeout="3000">{{ snackbarMessage }}</v-snackbar>
  <v-snackbar v-model="error" color="error" class="mb-4" timeout="3000">{{ error }}</v-snackbar>

  <div class="d-flex align-center mb-3">
    <v-btn v-if="props.actions?.includes('create')" color="green" class="me-2" @click="openDialog()">ایجاد ✅</v-btn>
    <v-btn v-if="hasFilterComponent" @click="filterDialog = true">فیلتر 🔍</v-btn>
  </div>

  <div style="overflow-x: auto; white-space: nowrap">
    <v-data-table
      v-if="!loading"
      :headers="[...props.headers, { title: 'عملیات', key: 'actions', sortable: false }]"
      :items="processedAndPaginatedItems"
      hide-default-footer
      class="elevation-1"
      no-data-text="رکوردی یافت نشد"
    >
      <template v-slot:item="{ item, columns }">
        <tr>
          <td v-for="column in columns" :key="column.key" :style="getColumnStyle(column, item)">
            <template v-if="column.key === 'actions'">
              <v-btn v-if="props.actions?.includes('edit')" color="blue" size="small" class="mr-2" @click="openDialog(item)"> ویرایش ✏️ </v-btn>
              <v-btn v-if="props.actions?.includes('delete')" color="red" size="small" class="mr-2" @click="openDeleteDialog(item)"
                >حذف ❌
              </v-btn>
              <v-btn v-if="props.actions?.includes('view')" color="purple" size="small" class="mr-2" @click="goToRoute('view', item)"
                >View
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
    <Loading v-else />
  </div>
  <v-divider />
  <div v-if="!loading" class="h-25 d-flex justify-space-between align-center px-4 bg-white">
    <h5>
      نمایش {{ (currentPage - 1) * items.length }} تا
      {{ currentPage * itemsPerPage }}
      از {{ totalSize }} رکورد
    </h5>
    <v-pagination size="small" v-model="currentPage" :length="totalPages" :total-visible="5" />
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
        {{ props.customActions?.find(a => a.component === customActionComponent)?.title || '' }}
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
