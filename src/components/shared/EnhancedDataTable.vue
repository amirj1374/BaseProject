<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useDataTable } from '@/composables/useDataTable';
import { useTableSelection } from '@/composables/useTableSelection';
import { useTableActions } from '@/composables/useTableActions';
import { useTableHeaders } from '@/composables/useTableHeaders';
import { DateConverter } from '@/utils/date-convertor';
import { IconChevronRight, IconChevronDown } from '@tabler/icons-vue';

// Define props
const props = defineProps({
  // Data props
  apiResource: {
    type: String,
    required: true
  },
  headers: {
    type: Array as () => any[],
    required: true
  },

  // Selection props
  selectable: {
    type: Boolean,
    default: false
  },
  multiSelect: {
    type: Boolean,
    default: false
  },
  uniqueKey: {
    type: [String, Function],
    default: 'id'
  },

  // Pagination props
  pageSize: {
    type: Number,
    default: 10
  },
  showPagination: {
    type: Boolean,
    default: true
  },

  // Grouping props
  groupBy: {
    type: [String, Function],
    default: ''
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  },

  // Action props
  actions: {
    type: Array as () => Array<'create' | 'edit' | 'delete' | 'view'>,
    default: () => []
  },
  routes: {
    type: Object,
    default: () => ({})
  },
  downloadLink: {
    type: Object,
    default: () => ({})
  },
  customActions: {
    type: Array,
    default: () => []
  },
  customButtons: {
    type: [Array, Function],
    default: () => []
  },

  // UI props
  title: {
    type: String,
    default: ''
  },
  height: {
    type: [Number, String],
    default: 'auto'
  },
  dense: {
    type: Boolean,
    default: false
  },

  // Query params
  queryParams: {
    type: Object,
    default: () => ({})
  },

  // Other
  autoFetch: {
    type: Boolean,
    default: true
  },
  showRefreshButton: {
    type: Boolean,
    default: false
  },
  dateWithTimezone: {
    type: Boolean,
    default: false
  },
  formComponent: {
    type: [Object, Function],
    default: null
  },
  filterComponent: {
    type: [Object, Function],
    default: null
  }
});

const emit = defineEmits([
  'update:selectedItems',
  'selection-change',
  'row-click',
  'sort-change',
  'filter-change',
  'refresh',
  'error'
]);

// Use composables
const {
  items,
  loading,
  error,
  hasMore,
  isLoadingMore,
  pagination,
  fetchData,
  loadMore,
  setPage,
  setItemsPerPage
} = useDataTable({
  apiResource: props.apiResource,
  queryParams: props.queryParams,
  pageSize: props.pageSize,
  autoFetch: props.autoFetch
});

const {
  selectedItems,
  groupedItems,
  expandedGroups,
  allSelected,
  someSelected,
  toggleSelection,
  toggleSelectAll,
  isSelected,
  clearSelection,
  toggleGroup,
  expandAllGroups,
  collapseAllGroups
} = useTableSelection(items, {
  multiSelect: props.multiSelect,
  uniqueKey: props.uniqueKey,
  groupBy: props.groupBy,
  defaultExpanded: props.defaultExpanded
});

const {
  dialog,
  deleteDialog,
  actionDialog,
  isEditing,
  editedItem,
  formModel,
  itemToDelete,
  currentAction,
  hasAnyActions,
  openDialog,
  openDeleteDialog,
  openActionDialog,
  resetDialogs,
  getItemActions
} = useTableActions({
  actions: props.actions,
  routes: props.routes,
  downloadLink: props.downloadLink,
  customActions: props.customActions,
  customButtons: props.customButtons,
  showRefreshButton: props.showRefreshButton
});

const {
  headers: processedHeaders,
  visibleColumns,
  fixedColumns,
  leftFixedColumns,
  rightFixedColumns,
  scrollableColumns,
  getColumnByKey,
  getColumnIndex
} = useTableHeaders(props.headers, {
  selectable: props.selectable,
  hasActions: hasAnyActions,
  actionsWidth: '200px',
  showSelection: true,
  showIndex: true
});

// Watchers
watch(selectedItems, (newVal) => {
  emit('update:selectedItems', newVal);
  emit('selection-change', newVal);
}, { deep: true });

watch(error, (newError) => {
  if (newError) {
    emit('error', newError);
  }
});

// Methods
const handleSort = (sortBy: any) => {
  emit('sort-change', sortBy);
  fetchData({ sort: sortBy });
};

const handleFilter = (filters: any) => {
  emit('filter-change', filters);
  fetchData({ filters });
};

const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', { row, column, event });
};

const refresh = () => {
  clearSelection();
  fetchData();
  emit('refresh');
};

// Expose methods to parent
const getSelectedItems = () => selectedItems.value;

defineExpose({
  items,
  selectedItems: getSelectedItems,
  clearSelection,
  refresh,
  fetchData,
  groupedItems,
  expandAllGroups,
  collapseAllGroups,
  toggleGroup
});
</script>

<template>
  <div class="enhanced-data-table">
    <!-- Title and Toolbar -->
    <div v-if="title || $slots.toolbar" class="d-flex justify-space-between align-center mb-4">
      <h2 v-if="title" class="text-h6">{{ title }}</h2>
      <div class="d-flex align-center">
        <slot name="toolbar" />
        <v-btn
          v-if="showRefreshButton"
          icon
          small
          class="ml-2"
          @click="refresh"
          :loading="loading"
          :disabled="loading"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Filter Component -->
    <slot v-if="$slots.filter" name="filter" />
    <component
      v-else-if="filterComponent"
      :is="filterComponent"
      @filter="handleFilter"
      @reset="refresh"
    />

    <!-- Data Table -->
    <div class="data-table-container" :style="{ height: typeof height === 'number' ? `${height}px` : height }">
      <v-data-table
        v-if="!groupBy || groupedItems.length === 0"
        :headers="visibleColumns"
        :items="items"
        :items-per-page="pagination.itemsPerPage"
        :page.sync="pagination.currentPage"
        :server-items-length="pagination.totalItems"
        :loading="loading"
        :dense="dense"
        :show-select="selectable"
        :single-select="!multiSelect"
        :item-key="typeof uniqueKey === 'string' ? uniqueKey : 'id'"
        :footer-props="{
          'items-per-page-options': [10, 25, 50, 100],
          'show-first-last-page': true
        }"
        @update:options="fetchData"
        @click:row="handleRowClick"
      >
        <!-- Custom slots for columns -->
        <template v-for="header in headers" v-slot:[`item.${header.key}`]="{ item, value }">
          <slot :name="`item.${header.key}`" :item="item" :value="value">
            {{ value }}
          </slot>
        </template>

        <!-- Actions column -->
        <template v-if="hasAnyActions" v-slot:item.actions="{ item }">
          <div class="d-flex align-center justify-end">
            <v-tooltip v-for="(action, index) in getItemActions(item)" :key="index" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  :color="action.color || 'primary'"
                  :icon="!!action.icon"
                  :text="!action.icon"
                  :outlined="action.outlined"
                  :rounded="action.rounded"
                  :class="action.class"
                  :disabled="typeof action.disabled === 'function' ? action.disabled(item) : action.disabled"
                  @click.stop="action.onClick(item)"
                  small
                  class="ml-1"
                >
                  <v-icon v-if="action.icon" small>{{ action.icon }}</v-icon>
                  <span v-else>{{ action.label }}</span>
                </v-btn>
              </template>
              <span>{{ action.tooltip || action.label }}</span>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>

      <!-- Grouped Table -->
      <div v-else class="grouped-table">
        <div class="group-controls mb-3">
          <v-btn size="small" color="primary" @click="expandAllGroups" class="me-2">
            <v-icon left>mdi-unfold-more-horizontal</v-icon>
            Expand All
          </v-btn>
          <v-btn size="small" color="secondary" @click="collapseAllGroups" class="me-2">
            <v-icon left>mdi-unfold-less-horizontal</v-icon>
            Collapse All
          </v-btn>
        </div>

        <div class="groups-scroll-container" :style="{ maxHeight: typeof height === 'number' ? `${height - 100}px` : '600px' }">
          <v-expansion-panels v-model="expandedGroups" multiple>
            <v-expansion-panel v-for="(group, i) in groupedItems" :key="i">
              <v-expansion-panel-header>
                <template v-slot:default="{ open }">
                  <v-icon left>{{ open ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                  {{ group.groupLabel }}
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-data-table
                  :headers="visibleColumns"
                  :items="group.items"
                  :items-per-page="pagination.itemsPerPage"
                  :loading="loading"
                  :dense="dense"
                  :show-select="selectable"
                  :single-select="!multiSelect"
                  :item-key="typeof uniqueKey === 'string' ? uniqueKey : 'id'"
                  @click:row="handleRowClick"
                >
                  <!-- Custom slots for columns in grouped table -->
                  <template v-for="header in headers" v-slot:[`item.${header.key}`]="{ item, value }">
                    <slot :name="`item.${header.key}`" :item="item" :value="value">
                      {{ value }}
                    </slot>
                  </template>

                  <!-- Actions column in grouped table -->
                  <template v-if="hasAnyActions" v-slot:item.actions="{ item }">
                    <div class="d-flex align-center justify-end">
                      <v-tooltip v-for="(action, index) in getItemActions(item)" :key="index" bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            v-on="on"
                            :color="action.color || 'primary'"
                            :icon="!!action.icon"
                            :text="!action.icon"
                            :outlined="action.outlined"
                            :rounded="action.rounded"
                            :class="action.class"
                            :disabled="typeof action.disabled === 'function' ? action.disabled(item) : action.disabled"
                            @click.stop="action.onClick(item)"
                            small
                            class="ml-1"
                          >
                            <v-icon v-if="action.icon" small>{{ action.icon }}</v-icon>
                            <span v-else>{{ action.label }}</span>
                          </v-btn>
                        </template>
                        <span>{{ action.tooltip || action.label }}</span>
                      </v-tooltip>
                    </div>
                  </template>
                </v-data-table>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && !groupBy" class="mt-4">
      <v-pagination
        v-model="pagination.currentPage"
        :length="pagination.totalPages"
        :total-visible="7"
        @input="setPage"
      />
      <div class="d-flex justify-end align-center mt-2">
        <span class="text-caption mr-2">Items per page:</span>
        <v-select
          v-model="pagination.itemsPerPage"
          :items="[10, 25, 50, 100]"
          dense
          outlined
          hide-details
          style="max-width: 100px;"
          @change="setItemsPerPage"
        />
      </div>
    </div>

    <!-- Dialogs -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEditing ? 'Edit' : 'Create' }} Item</span>
        </v-card-title>
        <v-card-text>
          <component
            v-if="formComponent"
            :is="formComponent"
            v-model="formModel"
            :is-editing="isEditing"
            :item="editedItem"
            @submit="saveItem"
            @cancel="dialog = false"
          />
          <slot v-else name="form" :item="editedItem" :is-editing="isEditing">
            <p>No form component provided. Please provide a form component or use the form slot.</p>
          </slot>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this item? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red darken-1" text @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="actionDialog" max-width="800px">
      <v-card v-if="currentAction">
        <v-card-title>{{ currentAction.title }}</v-card-title>
        <v-card-text>
          <component
            :is="currentAction.component"
            v-model="formModel"
            :item="editedItem"
            @submit="handleCustomAction"
            @cancel="actionDialog = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.enhanced-data-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.data-table-container {
  flex: 1;
  overflow: auto;
  position: relative;
}

.grouped-table {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.groups-scroll-container {
  overflow-y: auto;
  flex: 1;
}

.group-controls {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}
</style>
