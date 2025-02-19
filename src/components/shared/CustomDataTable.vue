<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import axiosInstance from "@/services/axiosInstance";
import apiService from "@/services/apiService";
import { useRouter } from 'vue-router';
import Loading from '@/components/Loading.vue';

// Props for API URL, Headers, Actions & Routes
interface Props {
  apiResource: string;
  headers: { title: string; key: string; sortable?: boolean; editable?: boolean; width?: number }[];
  actions?: ('create' | 'edit' | 'delete' | 'view')[]; // Default Actions
  routes?: Record<string, string>; // Dynamic Routes
}

const props = defineProps<Props>();

const items = ref<any[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const dialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const editedItem = ref<Record<string, any> | null>(null);
const itemToDelete = ref<Record<string, any> | null>(null);
const snackbar = ref(true);
const snackbarMessage = ref('');
const router = useRouter();
// Sorting & Pagination State
const itemsPerPage = ref(5);
const currentPage = ref(1);
const sortBy = ref<{ key: string; order: 'asc' | 'desc' } | null>(null);
// Dynamic API instance
const api = apiService(axiosInstance, props.apiResource);

// Fetch Data with Improved Error Handling
const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.fetch();
    items.value = response.data || [];
  } catch (err: any) {
    // Handle different error types
    if (err.response) {
      // Server-side error
      error.value = `Server Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`;
    } else if (err.request) {
      // Network error
      error.value = 'Network error. Please try again later.';
    } else {
      // Other errors
      error.value = 'An unexpected error occurred.';
    }
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Open Dialogs
const openDialog = (item?: any) => {
  editedItem.value = item ? { ...item } : {};
  isEditing.value = !!item;
  dialog.value = true;
};
const openDeleteDialog = (item: any) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

// Handle Save
const saveItem = async () => {
  if (!editedItem.value) return;

  try {
    if (isEditing.value && editedItem.value.id) {
      // Update Existing Item
      await api.update(editedItem.value.id, editedItem.value);
      snackbarMessage.value = "✅ Item updated successfully!";
    } else {
      // Create New Item
      const response = await api.create(editedItem.value);
      snackbarMessage.value = "✅ Item created successfully!";

      // Add the new item to the list if API returns it
      if (response.data) items.value.push(response.data);
    }

    snackbar.value = true;
    dialog.value = false;
    await fetchData(); // Refresh list
  } catch (err) {
    console.error("Error saving data", err);
    snackbarMessage.value = "❌ Error saving data!";
    snackbar.value = true;
  }
};

// Delete Item
const deleteItem = async (id: string) => {
  try {
    await api.delete(id);
    items.value = items.value.filter((item) => item.id !== id);
    await fetchData();
  } catch (err) {
    console.error("Error deleting data", err);
    snackbarMessage.value = "❌ Error deleting data!";
    snackbar.value = true;
  }
};

// Handle Navigation with Dynamic Routes
const goToRoute = (key: string, item?: any) => {
  if (!props.routes || !props.routes[key] || !item) return;

  let routePath = props.routes[key];

  // Find all dynamic parameters in route
  const missingParams: string[] = [];
  routePath = routePath.replace(/\{(\w+)}/g, (_, field) => {
    if (item[field] !== undefined) {
      return item[field]; // Replace with value
    } else {
      missingParams.push(field); // Add to missing parameters
      return `{${field}}`; // Keep unchanged
    }
  });

  // Show error if parameters are missing
  if (missingParams.length > 0) {
    snackbarMessage.value = ` خطا : ${missingParams.join(' , ')}  در خروجی نیست  `;
    snackbar.value = true;
    return;
  }

  router.push(routePath);
};

// Handle Sorting with Default Sort Key
const sortedItems = computed(() => {
  if (!sortBy.value) {
    const defaultKey = props.headers[0]?.key; // Default sort by first column
    return defaultKey ? [...items.value].sort((a, b) => a[defaultKey] < b[defaultKey] ? -1 : 1) : items.value;
  }

  const { key, order } = sortBy.value;
  return [...items.value].sort((a, b) => {
    const orderFactor = order === 'asc' ? 1 : -1;
    if (a[key] < b[key]) return -1 * orderFactor;
    if (a[key] > b[key]) return 1 * orderFactor;
    return 0;
  });
});

// Compute Paginated Items
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedItems.value.slice(start, end);
});

// Compute Total Pages
const totalPages = computed(() => Math.ceil(items.value.length / itemsPerPage.value));

// Handle Sorting Change
const onSortChange = (sort: any) => {
  if (sort.length > 0) {
    sortBy.value = { key: sort[0].key, order: sort[0].order };
  } else {
    sortBy.value = null;
  }
};

// Watch API changes
watch(() => props.apiResource, fetchData, { immediate: true });

// Fetch Data on Mount
onMounted(fetchData);
</script>

<template>
  <v-snackbar v-model="snackbar" color="red" timeout="3000">
    {{ snackbarMessage }}
  </v-snackbar>
  <v-snackbar v-model="error" color="error" class="mb-4" timeout="3000">{{error}}</v-snackbar>

  <!-- Create Button -->
  <v-btn v-if="props.actions?.includes('create')" color="green" class="mb-3" @click="openDialog()"> ✅ Create New </v-btn>

  <div style="overflow-x: auto; white-space: nowrap;">
    <!-- Data Table -->
    <v-data-table
      v-if="!loading"
      :headers="[...props.headers, { title: 'Actions', key: 'actions', sortable: false }]"
      :items="items"
      hide-default-footer
      class="elevation-1"
    >
      <!-- Actions Column -->
      <template v-slot:item.actions="{ item }">
        <v-btn v-if="props.actions?.includes('edit')" color="blue" size="small" class="mr-2" @click="openDialog(item)"> ✏️ Edit </v-btn>
        <v-btn v-if="props.actions?.includes('delete')" color="red" size="small" class="mr-2" @click="openDeleteDialog(item)"> ❌ Delete </v-btn>
        <v-btn v-if="props.actions?.includes('view')" color="purple" size="small" class="mr-2" @click="goToRoute('view', item)"> 🔍 View </v-btn>
        <!-- Dynamic Route Buttons -->
        <template v-for="(route, key) in props.routes" :key="key">
          <v-btn color="indigo" size="small" class="mr-2" @click="goToRoute(key, item)">
            {{ key.toUpperCase() }}
          </v-btn>
        </template>
      </template>
    </v-data-table>
    <Loading v-else />
  </div>
  <!-- Custom Pagination -->
  <div v-if="!loading" class="d-flex justify-space-between align-center pa-4 bg-white">
      <span>
        نمایش {{ (currentPage - 1) * itemsPerPage + 1 }} تا
        {{ Math.min(currentPage * itemsPerPage, items.length) }}
        از {{ items.length }} رکورد
      </span>
    <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5" />
  </div>

  <!-- Create/Edit Dialog -->
  <v-dialog v-model="dialog" max-width="800">
    <v-card>
      <v-card-title>{{ isEditing ? 'Edit' : 'Create' }}</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col v-for="header in props.headers" :key="header.key" cols="12" md="4">
              <v-text-field
                v-model="editedItem![header.key]"
                :label="header.title"
                variant="outlined"
                :readonly="header.editable === true"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey" @click="dialog = false">Cancel</v-btn>
        <v-btn color="green" @click="saveItem">{{ isEditing ? 'Save' : 'Create' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Dialog -->
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title>Delete Item</v-card-title>
      <v-card-text>
        Are you sure you want to delete item <strong>{{ itemToDelete?.id }}</strong
      >?
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey" @click="deleteDialog = false">Cancel</v-btn>
        <v-btn color="red" @click="deleteItem(itemToDelete?.id)">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
