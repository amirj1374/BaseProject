<template>
  <div class="facilities-section">
    <div class="section-header">
      <h4 class="section-title">ضمانت نامه</h4>
      <v-btn color="secondary" @click="openDialog" :disabled="loading || facilities.length >= 1"> افزودن ضمانت نامه</v-btn>    </div>

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
    <template #item.approvalType="{ item }">
    {{ ApprovalTypeOptions.find(opt => opt.value === item.approvalType)?.title || '-' }}
  </template>
  <template #item.currency="{ item }">
    {{ baseStore.currency.find(cur => cur.code === item.currency)?.description || '-' }}
  </template>
  <template #item.repaymentType="{ item }">
    {{ RepaymentTypeOptions.find(opt => opt.value === item.repaymentType)?.title || '-' }}
  </template>
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <v-btn size="small" variant="text" @click="editItem(item)">
            <IconPencil color="blue" size="20" />
          </v-btn>
          <v-btn size="small" variant="text" @click="deleteItem(item)">
            <IconTrash color="red" size="20" />
          </v-btn>
        </div>
      </template>
    </v-data-table-virtual>

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title class="d-flex align-center py-5 px-5">
          <span class="text-h3">{{ isEditing ? 'ویرایش ضمانت نامه' : 'افزودن ضمانت نامه' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon size="small" variant="text" @click="closeDialog">
            <IconX color="red" size="20" />
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="isFormValid">
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.approvalType"
                  :items="ApprovalTypeOptions || []"
                  label="نوع مصوبه"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="formData.currency"
                  label="نوع ارز"
                  variant="outlined"
                  clearable
                  density="comfortable"
                  item-title="description"
                  item-value="code"
                  :items="baseStore.currency"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.repaymentType"
                  label="نحوه بازپرداخت"
                  variant="outlined"
                  density="comfortable"
                  :items="RepaymentTypeOptions || []"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="formData.year"
                  density="comfortable"
                  hide-details="auto"
                  variant="outlined"
                  color="primary"
                  label="سال"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="formData.month"
                  density="comfortable"
                  hide-details="auto"
                  variant="outlined"
                  color="primary"
                  label="ماه"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="formData.day"
                  density="comfortable"
                  hide-details="auto"
                  variant="outlined"
                  color="primary"
                  label="روز"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-btn size="x-large" color="secondary" variant="outlined" @click="dayCalculate"> محاسبه</v-btn>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.durationDay"
                  density="comfortable"
                  variant="outlined"
                  color="primary"
                  label="مدت"
                  readonly
                  suffix="روز"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <MoneyInput
                  v-model="formData.amount"
                  label="مبلغ"
                  placeholder="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  suffix="میلیون ریال"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="d-flex item-center gap-2 px-5 py-5">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="saveFacility" :loading="loading" :disabled="!isFormValid">
            {{ isEditing ? 'ویرایش' : 'ذخیره' }}
          </v-btn>
          <v-btn color="error" variant="text" @click="closeDialog"> انصراف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { IconTrash, IconX, IconPencil } from '@tabler/icons-vue';
import { ApprovalTypeOptions } from '@/constants/enums/approval';
import { useBaseStore } from '@/stores/base';
import { RepaymentTypeOptions } from '@/constants/enums/repaymentType';
import { api } from '@/services/api';
import MoneyInput from '@/components/shared/MoneyInput.vue';
import { useApprovalStore } from '@/stores/approval';

const baseStore = useBaseStore();
const approvalStore = useApprovalStore();

interface Facility {
  id: number;
  approvalType: string;
  currency: string;
  amount: string;
  repaymentType: string;
  year?: string;
  month?: string;
  day?: string;
  durationDay?: string;
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
const error = ref('');
const formData = reactive({
  approvalType: '',
  currency: '',
  repaymentType: '',
  year: '',
  month: '',
  day: '',
  durationDay: '',
  amount: ''
});

const headers = [
  { title: 'نوع مصوبه', key: 'approvalType', width: '100px' },
  { title: 'نوع ارز', key: 'currency', width: '100px' },
  { title: 'نحوه بازپرداخت', key: 'repaymentType', width: '100px' },
  { title: 'مدت', key: 'durationDay', width: '100px' },
  { title: 'مبلغ', key: 'amount', width: '150px' },
  { title: 'عملیات', key: 'actions', align: 'center', width: '100px' }
];
onMounted(() => {
  if (approvalStore.customerInfo?.facilities) {
    facilities.value = [...approvalStore.customerInfo.facilities];
  }
});
const dayCalculate = async () => {
  if (formData.year === null && formData.month === null && formData.day === null) {
    error.value = 'لطفا مقادیر تاریخ را وارد کنید';
    return;
  }
  try {
    const res = await api.approval.getCalculatedDay(Number(formData.year), Number(formData.month), Number(formData.day));
    formData.durationDay = res.data;
  } catch (err) {
    console.error('Error calculating days:', err);
  }
};

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
  formData.amount = '';
  formData.repaymentType = '';
  form.value?.reset();
}

function editItem(item: Facility) {
    isEditing.value = true;
  editingId.value = item.id;
  formData.approvalType = item.approvalType;
  formData.currency = item.currency;
  formData.amount = item.amount;
  formData.repaymentType = item.repaymentType;
  formData.year = item.year || '';
  formData.month = item.month || '';
  formData.day = item.day || '';
  formData.durationDay = item.durationDay || '';
  dialog.value = true;
}

function saveFacility() {
  if (!isFormValid.value) return;

  const facilityData: Facility = {
    id: editingId.value || Date.now(),
    ...formData
  };

  if (isEditing.value) {
    const index = facilities.value.findIndex((f) => f.id === editingId.value);
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
  const index = facilities.value.findIndex((f) => f.id === item.id);
  if (index !== -1) {
    facilities.value.splice(index, 1);
    emit('delete', item);
  }
}
// Expose facilities for parent access
defineExpose({ facilities });
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
