<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import axiosInstance from '@/services/axiosInstance';
import apiService from '@/services/apiService';
import { useRouter } from 'vue-router';
import Loading from '@/components/Loading.vue';
import type { Component } from 'vue';

interface Header {
  title: string;
  key: string;
  sortable?: boolean;
  editable?: boolean;
  width?: number;
  hidden?: boolean;
  defaultValue?: string | number | boolean;
}

interface Props {
  apiResource: string;
  headers: Header[];
  actions?: ('create' | 'edit' | 'delete' | 'view')[];
  routes?: Record<string, string>;
  FormComponent?: Component;
  pagination?: boolean;
}

const props = defineProps<Props>();

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

const itemsPerPage = ref(5);
const currentPage = ref(1);
const sortBy = ref<{ key: string; order: 'asc' | 'desc' } | null>(null);

const api = apiService(axiosInstance, props.apiResource);
const createApi = apiService(axiosInstance, props.apiResource.split('/')[0]);

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.fetch(1703);
    items.value = response.data || [];
  } catch (err: any) {
    if (err.response) {
      error.value = `Server Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`;
    } else if (err.request) {
      error.value = 'Network error. Please try again later.';
    } else {
      error.value = 'An unexpected error occurred.';
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
        editedItem.value[header.key] = header.defaultValue;
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
    if (isEditing.value && formModel.value.id) {
      await api.update(formModel.value);
      console.log(formModel.value.id);
      snackbarMessage.value = '✅ Item updated successfully!';
    } else {
      const response = await createApi.create(formModel.value);
      snackbarMessage.value = '✅ Item created successfully!';
      if (response.data) items.value.push(response.data);
    }

    snackbar.value = true;
    dialog.value = false;
    await fetchData();
  } catch (err) {
    console.error('Error saving data', err);
    snackbarMessage.value = '❌ Error saving data!';
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
    console.error('Error deleting data', err);
    snackbarMessage.value = '❌ Error deleting data!';
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

const sortedItems = computed(() => {
  if (!sortBy.value) {
    const defaultKey = props.headers[0]?.key;
    return defaultKey ? [...items.value].sort((a, b) => (a[defaultKey] < b[defaultKey] ? -1 : 1)) : items.value;
  }

  const { key, order } = sortBy.value;
  return [...items.value].sort((a, b) => {
    const orderFactor = order === 'asc' ? 1 : -1;
    if (a[key] < b[key]) return -1 * orderFactor;
    if (a[key] > b[key]) return 1 * orderFactor;
    return 0;
  });
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedItems.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(items.value.length / itemsPerPage.value));

const onSortChange = (sort: any) => {
  if (sort.length > 0) {
    sortBy.value = { key: sort[0].key, order: sort[0].order };
  } else {
    sortBy.value = null;
  }
};

watch(() => props.apiResource, fetchData, { immediate: true });

onMounted(fetchData);
</script>

<template>
  <v-snackbar v-model="snackbar" color="red" timeout="3000">{{ snackbarMessage }}</v-snackbar>
  <v-snackbar v-model="error" color="error" class="mb-4" timeout="3000">{{ error }}</v-snackbar>

  <v-btn v-if="props.actions?.includes('create')" color="green" class="mb-3" @click="openDialog()">ایجاد ✅</v-btn>

  <div style="overflow-x: auto; white-space: nowrap">
    <v-data-table
      v-if="!loading"
      :headers="[...props.headers, { title: 'عملیات', key: 'actions', sortable: false }]"
      :items="items"
      hide-default-footer
      class="elevation-1"
      no-data-text="رکوردی یافت نشد"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn v-if="props.actions?.includes('edit')" color="blue" size="small" class="mr-2" @click="openDialog(item)">ویرایش ✏️</v-btn>
        <v-btn v-if="props.actions?.includes('delete')" color="red" size="small" class="mr-2" @click="openDeleteDialog(item)">حذف ❌</v-btn>
        <v-btn v-if="props.actions?.includes('view')" color="purple" size="small" class="mr-2" @click="goToRoute('view', item)">🔍 View</v-btn>
        <template v-for="(route, key) in props.routes" :key="key">
          <v-btn color="indigo" size="small" class="mr-2" @click="goToRoute(key, item)">
            {{ key.toUpperCase() }}
          </v-btn>
        </template>
      </template>
    </v-data-table>
    <Loading v-else />
  </div>

  <div v-if="!loading && pagination" class="d-flex justify-space-between align-center pa-4 bg-white">
    <span>
      نمایش {{ (currentPage - 1) * itemsPerPage + 1 }} تا
      {{ Math.min(currentPage * itemsPerPage, items.length) }}
      از {{ items.length }} رکورد
    </span>
    <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5" />
  </div>

  <v-dialog v-model="dialog" max-width="1000">
    <v-card>
      <v-card-title>{{ isEditing ? 'ویرایش' : 'ایجاد' }}</v-card-title>
      <v-card-text>
        <v-container>
          <component
            v-if="props.FormComponent"
            :is="props.FormComponent"
            v-model="formModel"
          />
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
      <v-card-text> آیا مایل به حذف این رکورد هستید ? </v-card-text>
      <v-card-actions>
        <v-btn color="grey" @click="deleteDialog = false">انصراف</v-btn>
        <v-btn color="red" @click="deleteItem(itemToDelete?.id)">حذف</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
