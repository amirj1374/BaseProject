<template>
  <div class="facilities-section">
    <div class="section-header">
      <h4 class="section-title">تسهیلات</h4>
      <v-btn
        color="primary"
        @click="openDialog"
        :disabled="loading"
      >
        افزودن تسهیلات
      </v-btn>
    </div>

    <v-data-table-virtual
      :headers="headers"
      :items="facilities"
      :loading="loading"
      no-data-text="رکوردی یافت نشد"
      density="comfortable"
      hover
      hide-default-footer
      class="facilities-table elevation-1"
    >
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <v-btn
            size="small"
            icon
            @click="editItem(item)"
          >
            <IconPencil size="20" />
          </v-btn>
          <v-btn
            size="small"
            icon
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
          <span class="text-h6">{{ isEditing ? 'ویرایش تسهیلات' : 'افزودن تسهیلات' }}</span>
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
                  label="مبلغ تسهیلات"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v: string) => !!v || 'مبلغ تسهیلات الزامی است']"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.type"
                  label="نوع تسهیلات"
                  variant="outlined"
                  density="comfortable"
                  :items="facilityTypes"
                  :rules="[(v: string) => !!v || 'نوع تسهیلات الزامی است']"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.repaymentType"
                  label="نحوه بازپرداخت"
                  variant="outlined"
                  density="comfortable"
                  :items="repaymentTypes"
                  :rules="[(v: string) => !!v || 'نحوه بازپرداخت الزامی است']"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="saveFacility"
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

interface Facility {
  id: number;
  type: string;
  amount: string;
  repaymentType: string;
}

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', data: Facility): void;
  (e: 'delete', item: Facility): void;
  (e: 'edit', item: Facility): void;
}>();

const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const facilities = ref<Facility[]>([]);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const formData = reactive({
  type: '',
  amount: '',
  repaymentType: ''
});

const facilityTypes = [
  { title: 'تسهیلات 1', value: 'facility1' },
  { title: 'تسهیلات 2', value: 'facility2' },
  { title: 'تسهیلات 3', value: 'facility3' }
];

const repaymentTypes = [
  { title: 'اقساط ماهانه', value: 'monthly' },
  { title: 'یکجا', value: 'lump' }
];

const headers = [
  { title: 'نوع تسهیلات', key: 'type', width: '160px' },
  { title: 'مبلغ', key: 'amount', width: '120px' },
  { title: 'نحوه بازپرداخت', key: 'repaymentType', width: '140px' },
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
  formData.repaymentType = '';
  form.value?.reset();
}

function editItem(item: Facility) {
  isEditing.value = true;
  editingId.value = item.id;
  formData.type = item.type;
  formData.amount = item.amount;
  formData.repaymentType = item.repaymentType;
  dialog.value = true;
}

function saveFacility() {
  if (!isFormValid.value) return;

  const facilityData: Facility = {
    id: editingId.value || Date.now(),
    ...formData
  };

  if (isEditing.value) {
    const index = facilities.value.findIndex(f => f.id === editingId.value);
    if (index !== -1) {
      facilities.value[index] = facilityData;
      emit('edit', facilityData);
    }
  } else {
    facilities.value.push(facilityData);
    emit('save', facilityData);
  }
  
  closeDialog();
}

function deleteItem(item: Facility) {
  const index = facilities.value.findIndex(f => f.id === item.id);
  if (index !== -1) {
    facilities.value.splice(index, 1);
    emit('delete', item);
  }
}
</script>

<style lang="scss" scoped>
.facilities-section {
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

  .facilities-table {
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