<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['update']);

const router = useRouter();

// Interfaces
interface Header {
  title: string;
  align: string;
  key: string;
  sortable?: boolean;
}

interface TableInput {
  label?: string;
  value?: string;
  key?: string;
  editable?: boolean;
}

interface DataTableData {
  title: string;
  header?: Header[];
  tableInput?: TableInput[];
  icon?: string;
  loading?: boolean;
  items?: any;
  hasChild?: boolean;
  hideDelete?: boolean;
  hideCreate?: boolean;
  hasUpload?: boolean;
  hideEdit?: boolean;
  actionComponents?: Array;
}

// Props
const props = defineProps<DataTableData>();

// Variables
const composeDialogStatus = ref(false);
const deleteDialogStatus = ref(false);
const editingObject = ref<Partial<TableInput>>({});
const parentObject = ref<Partial<TableInput>>({});

// Functions
function requireDeleteItem(item: TableInput) {
  editingObject.value = { ...item };
  deleteDialogStatus.value = true;
}

function deleteItem() {
  const updatedItems = props.items.filter((i: TableInput) => i.id !== editingObject.value?.id);

  emit('update', updatedItems);

  deleteDialogStatus.value = false;
}

function requireComposeItem(item: TableInput) {
  editingObject.value = { ...item };

  composeDialogStatus.value = true;
}

function routeToChild(item: TableInput) {
  parentObject.value = { ...item };
  console.log(parentObject.value);
  router.push(`/base/bank/${parentObject.value.id}/account`);
}

function composeItem() {
  const output = props.tableInput?.reduce((acc, { key, value }) => {
    acc[key] = value;

    return acc;
  }, {});

  if (editingObject.value?.id) {
    const updatedItems = [
      ...props.items.filter((i: any) => i.id !== editingObject.value.id),
      {
        ...output,
        id: editingObject.value.id
      }
    ];

    emit('update', updatedItems);

    composeDialogStatus.value = false;
  } else {
    const randomId = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

    const updatedItems = [...props.items, { ...output, id: randomId }];

    emit('update', updatedItems);

    composeDialogStatus.value = false;
  }
}
</script>

<template>
  <v-data-table
    :headers="props.header"
    :items="props.items"
    :sort-by="[{ key: 'calories', order: 'asc' }]"
    items-per-page-text="دیتا در هر صفحه"
    no-data-text="دیتایی یافت نشد"
  >
    <template v-slot:top>
      <v-toolbar>
        <v-toolbar-title>{{ props.title }}</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <!-- Add/Edit Dialog -->
        <v-dialog v-model="composeDialogStatus" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn v-if="!hideCreate" class="mb-2" color="primary" v-bind="props" @click="editingObject = {}">ایجاد </v-btn>
            <v-btn v-if="hideCreate" class="mb-2" color="secondry" v-bind="props" @click="editingObject = {}">بارگزاری فایل </v-btn>
          </template>
          <v-card>
            <!--            <v-card-title>-->
            <!--              <span class="text-h5">{{ props.title }}</span>-->
            <!--            </v-card-title>-->
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col v-for="(input, index) in props.tableInput" :key="`editItem-${index}`" cols="12" md="6" sm="6" v-if="!hasUpload">
                    <v-text-field
                      v-model="input.value"
                      :label="input.label"
                      class="mt-4 mb-8"
                      color="primary"
                      density="comfortable"
                      dir="rtl"
                      hide-details="auto"
                      required
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="12" sm="12" v-if="hasUpload" class="mt-4 mb-8">
                    <v-file-input clearable label="فایل" show-size></v-file-input>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions v-if="!hasUpload">
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="composeDialogStatus = false">انصراف</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="composeItem">ذخیره</v-btn>
            </v-card-actions>
            <v-card-actions v-if="hasUpload">
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="composeDialogStatus = false">بارگزاری</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteDialogStatus" max-width="500px">
          <v-card>
            <v-card-title class="text-h5 text-center">آیا از حذف {{ editingObject?.title }} اطمینان دارید؟ </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="deleteItem">تایید و حذف</v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="deleteDialogStatus = false">انصراف</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>

    <!-- Action Buttons -->
    <template v-slot:item.actions="{ item }" v-if="!hideEdit || !hideDelete">
      <div class="d-flex align-center justify-center ga-2">
        <TrashIcon v-if="!hideDelete" class="icon" @click="requireDeleteItem(item)" />

        <EditIcon v-if="!hideEdit" class="icon" @click="requireComposeItem(item)" />

        <component :is="actionComponent" v-for="(actionComponent, idx) in props.actionComponents" :key="idx" :rowData="item" />
      </div>
    </template>
  </v-data-table>
</template>
