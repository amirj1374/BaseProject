<template>
  <div class="guarantee-section">
    <div class="section-header">
      <h4 class="section-title">ضمانت‌نامه‌ها</h4>
      <v-btn
        color="primary"
        @click="openDialog"
        :disabled="loading"
      >
        افزودن ضمانت‌نامه
      </v-btn>
    </div>

    <v-data-table-virtual
      :headers="headers"
      :items="guarantees"
      :loading="loading"
      no-data-text="رکوردی یافت نشد"
      density="comfortable"
      hover
      hide-default-footer
      class="guarantee-table elevation-1"
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
          <span class="text-h6">{{ isEditing ? 'ویرایش ضمانت‌نامه' : 'افزودن ضمانت‌نامه' }}</span>
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
                  label="مبلغ ضمانت‌نامه"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v: string) => !!v || 'مبلغ ضمانت‌نامه الزامی است']"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.type"
                  label="نوع ضمانت‌نامه"
                  variant="outlined"
                  density="comfortable"
                  :items="guaranteeTypes"
                  :rules="[(v: string) => !!v || 'نوع ضمانت‌نامه الزامی است']"
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
            @click="saveGuarantee"
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

interface Guarantee {
  id: number;
  type: string;
  amount: string;
  validityPeriod: string;
}

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', data: Guarantee): void;
  (e: 'delete', item: Guarantee): void;
  (e: 'edit', item: Guarantee): void;
}>();

const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const guarantees = ref<Guarantee[]>([]);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const formData = reactive({
  type: '',
  amount: '',
  validityPeriod: ''
});

const guaranteeTypes = [
  { title: 'ضمانت‌نامه شرکت در مناقصه', value: 'tender' },
  { title: 'ضمانت‌نامه حسن انجام کار', value: 'performance' },
  { title: 'ضمانت‌نامه پیش پرداخت', value: 'advance' }
];

const headers = [
  { title: 'نوع ضمانت‌نامه', key: 'type', width: '160px' },
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

function editItem(item: Guarantee) {
  isEditing.value = true;
  editingId.value = item.id;
  formData.type = item.type;
  formData.amount = item.amount;
  formData.validityPeriod = item.validityPeriod;
  dialog.value = true;
}

function saveGuarantee() {
  if (!isFormValid.value) return;

  const guaranteeData: Guarantee = {
    id: editingId.value || Date.now(),
    ...formData
  };

  if (isEditing.value) {
    const index = guarantees.value.findIndex(g => g.id === editingId.value);
    if (index !== -1) {
      guarantees.value[index] = guaranteeData;
      emit('edit', guaranteeData);
    }
  } else {
    guarantees.value.push(guaranteeData);
    emit('save', guaranteeData);
  }
  
  closeDialog();
}

function deleteItem(item: Guarantee) {
  const index = guarantees.value.findIndex(g => g.id === item.id);
  if (index !== -1) {
    guarantees.value.splice(index, 1);
    emit('delete', item);
  }
}
</script>

<style lang="scss" scoped>
.guarantee-section {
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

  .guarantee-table {
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