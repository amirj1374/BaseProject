<template>
  <div class="lc-section">
    <div class="section-header">
      <h4 class="section-title">اعتبارات اسنادی</h4>
      <v-btn
        color="primary"
        @click="openDialog"
        :disabled="loading"
      >
        افزودن اعتبار اسنادی
      </v-btn>
    </div>

    <v-data-table-virtual
      :headers="headers"
      :items="lcs"
      :loading="loading"
      no-data-text="رکوردی یافت نشد"
      density="comfortable"
      hover
      hide-default-footer
      class="lc-table elevation-1"
    >
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <v-btn
            size="small"
            icon
            color="primary"
            @click="editItem(item)"
          >
            <IconPencil size="20" />
          </v-btn>
          <v-btn
            size="small"
            icon
            color="error"
            @click="deleteItem(item)"
          >
            <IconTrash size="20" />
          </v-btn>
        </div>
      </template>
    </v-data-table-virtual>

    <v-dialog
      v-model="dialog"
      max-width="800px"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <span class="text-h6">{{ isEditing ? 'ویرایش اعتبار اسنادی' : 'افزودن اعتبار اسنادی' }}</span>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="closeDialog"
          >
            <IconX size="20" />
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid">
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.amount"
                  label="مبلغ اعتبار اسنادی"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v: string) => !!v || 'مبلغ اعتبار اسنادی الزامی است']"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.type"
                  label="نوع اعتبار اسنادی"
                  variant="outlined"
                  density="comfortable"
                  :items="lcTypes"
                  :rules="[(v: string) => !!v || 'نوع اعتبار اسنادی الزامی است']"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.validityPeriod"
                  label="مدت اعتبار"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v: string) => !!v || 'مدت اعتبار الزامی است']"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="saveLC"
            :loading="loading"
            :disabled="!isFormValid"
          >
            {{ isEditing ? 'ویرایش' : 'ذخیره' }}
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="closeDialog"
          >
            انصراف
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { IconTrash, IconX, IconPencil } from '@tabler/icons-vue';

interface LetterOfCredit {
  id: number;
  type: string;
  amount: string;
  validityPeriod: string;
}

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', data: LetterOfCredit): void;
  (e: 'delete', item: LetterOfCredit): void;
  (e: 'edit', item: LetterOfCredit): void;
}>();

const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const lcs = ref<LetterOfCredit[]>([]);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const formData = reactive({
  type: '',
  amount: '',
  validityPeriod: ''
});

const lcTypes = [
  { title: 'اعتبار اسنادی وارداتی', value: 'import' },
  { title: 'اعتبار اسنادی صادراتی', value: 'export' },
  { title: 'اعتبار اسنادی داخلی', value: 'domestic' }
];

const headers = [
  { title: 'نوع اعتبار اسنادی', key: 'type', width: '160px' },
  { title: 'مبلغ', key: 'amount', width: '120px' },
  { title: 'مدت اعتبار', key: 'validityPeriod', width: '140px' },
  { title: 'عملیات', key: 'actions', align: 'center', width: '100px' }
];

function openDialog() {
  isEditing.value = false;
  editingId.value = null;
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  resetForm();
}

function resetForm() {
  formData.type = '';
  formData.amount = '';
  formData.validityPeriod = '';
  form.value?.reset();
}

function editItem(item: LetterOfCredit) {
  isEditing.value = true;
  editingId.value = item.id;
  formData.type = item.type;
  formData.amount = item.amount;
  formData.validityPeriod = item.validityPeriod;
  dialog.value = true;
}

function saveLC() {
  if (!isFormValid.value) return;

  const lcData: LetterOfCredit = {
    id: editingId.value || Date.now(),
    ...formData
  };

  if (isEditing.value) {
    const index = lcs.value.findIndex(l => l.id === editingId.value);
    if (index !== -1) {
      lcs.value[index] = lcData;
      emit('edit', lcData);
    }
  } else {
    lcs.value.push(lcData);
    emit('save', lcData);
  }
  
  closeDialog();
}

function deleteItem(item: LetterOfCredit) {
  const index = lcs.value.findIndex(l => l.id === item.id);
  if (index !== -1) {
    lcs.value.splice(index, 1);
    emit('delete', item);
  }
}
</script>

<style lang="scss" scoped>
.lc-section {
  background-color: #fff;
  border-radius: 10px;
  padding: 25px 15px;
  margin-bottom: 10px;
  width: 100%;
  max-width: 100%;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #333;
    margin: 0;
  }

  .lc-table {
    width: 100%;
    max-width: 100%;
    border-radius: 10px;
    padding: 15px;

    :deep(.v-data-table-header) {
      background-color: var(--v-theme-secondary);
      color: #fff;
    }
    :deep(.v-data-table-header th) {
      background-color: var(--v-theme-secondary) !important;
      color: #fff;
    }
    :deep(.v-data-table-header tr) {
      background-color: var(--v-theme-secondary) !important;
      color: #fff;
    }
  }
}

.gap-2 {
  gap: 8px;
}

:deep(th) {
  background-color: #f5f5f5 !important;
  font-weight: 600;
}
</style> 