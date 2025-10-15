<template>
  <div class="approval-section">
    <div class="section-header">
      <h4 class="section-title">اعتبار اسنادی</h4>
      <v-btn v-if="!props.readonly" color="secondary" @click="openDialog" :disabled="loading || lc.length >= 1"> افزودن اعتبار اسنادی</v-btn>
    </div>

    <v-data-table-virtual
      :headers="headers"
      :items="lc"
      :loading="loading"
      no-data-text="رکوردی یافت نشد"
      density="comfortable"
      hover
      hide-default-footer
      class="approval-table elevation-1"
    >
      <template #item.approvalType="{ item }">
        {{ ApprovalTypeOptions.find((opt) => opt.value === item.approvalType)?.title || '-' }}
      </template>
      <template #item.currency="{ item }">
        {{ baseStore.currency.find((cur) => cur.code === item.currency)?.description || '-' }}
      </template>
      <template #item.repaymentType="{ item }">
        {{ RepaymentTypeOptions.find((opt) => opt.value === item.repaymentType)?.title || '-' }}
      </template>
      <template #item.facility="{ item }">
        {{ item.facility?.facilityName || '-' }}
      </template>
      <template #item.contractType="{ item }">
        {{ item.contractType?.longTitle || '-' }}
      </template>
      <template #item.lcContractType="{ item }">
        {{ LcTypeOptions.find((opt) => opt.value === item.lcContractType)?.title || '-' }}
      </template>
      <template #item.creditType="{ item }">
        {{ CreditTypeOptions.find((opt) => opt.value === item.creditType)?.title || '-' }}
      </template>
      <template #item.amount="{ item }">
        {{ formatNumberWithCommas(item.amount) }}
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <v-btn size="small" variant="text" @click="editItem(item)">
            <IconPencil  color="blue" size="20" />
          </v-btn>
          <v-btn v-if="!props.readonly" size="small" variant="text" @click="deleteItem(item)">
            <IconTrash color="red" size="20" />
          </v-btn>
        </div>
      </template>
    </v-data-table-virtual>

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title class="d-flex align-center py-5 px-5">
          <span v-if="!props.readonly" class="text-h3">{{ isEditing ? 'ویرایش اعتبار اسنادی' : 'افزودن اعتبار اسنادی' }}</span>
          <v-spacer></v-spacer>
          <v-btn size="small" variant="text" @click="closeDialog">
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
                  :rules="[required]"
                  :disabled="props.readonly"
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
                  :rules="[required]"
                    :disabled="props.readonly"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.lcContractType"
                  label="نوع اعتبار اسنادی"
                  variant="outlined"
                  density="comfortable"
                  :items="LcTypeOptions || []"
                  :rules="[required]"
                    :disabled="props.readonly"
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
                  :disabled="props.readonly"
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
                  :disabled="props.readonly"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-btn size="x-large" :disabled="props.readonly" color="secondary" variant="outlined" @click="dayCalculate"> محاسبه</v-btn>
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
                  :rules="[required]"
                    :disabled="props.readonly"
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
               :suffix="dynamicSuffix"
                  :rules="[required]"
                    :disabled="props.readonly"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.advancePayment"
                  label="پیش دریافت"
                  placeholder="0"
                  variant="outlined"
                  density="comfortable"
                  suffix="%"
                  type="number"
                  min="1"
                  max="100"
                  :rules="[percentRule]"
                    :disabled="props.readonly"

                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.intermediatePayment"
                  label="میان دریافت"
                  placeholder="0"
                  variant="outlined"
                  density="comfortable"
                  suffix="%"
                  type="number"
                  min="1"
                  max="100"
                  :rules="[percentRule]"
                    :disabled="props.readonly"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="formData.creditType"
                  label="نوع اعتبار"
                  variant="outlined"
                  density="comfortable"
                  :items="CreditTypeOptions || []"
                  :rules="[required]"
                    :disabled="props.readonly"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-btn color="primary" variant="tonal" :disabled="props.readonly" @click="showCollateralInputDialog = true" class="mb-4"> افزودن وثیقه </v-btn>
              </v-col>
            </v-row>
            <v-data-table-virtual
              v-if="collateralTableItems.length > 0"
              :headers="[
                { title: 'نوع وثیقه', key: 'collateral.description', sortable: true, width: '250px' },
                { title: 'مبلغ وثیقه', key: 'amount', sortable: true, align: 'end', width: '200px' },
                { title: 'درصد ارزش گذاری', key: 'percent', sortable: true, align: 'end', width: '250px' },
                { title: 'ارزش معادل وثیقه', key: 'equivalentValue', sortable: true, align: 'end', width: '250' },
                { title: 'عملیات', key: 'actions', sortable: false, align: 'center', width: '100px' }
              ]"
              :items="collateralTableItems"
              density="compact"
              class="elevation-1 mb-4"
              hide-default-footer
              no-data-text="هیچ وثیقه ای اضافه نشده است."
            >
              <template v-slot:item.amount="{ item }">
                {{ formatNumberWithCommas(item.amount) }}
              </template>
              <template v-slot:item.percent="{ item }"> {{ item.percent }}%</template>
              <template v-slot:item.equivalentValue="{ item }">
                {{ item.equivalentValue.toLocaleString() }}
              </template>
              <template v-slot:item.actions="{ index }">
                <v-tooltip location="top" text="حذف وثیقه">
                  <template v-slot:activator="{ props: tooltipProps }">
                    <v-btn v-if="!props.readonly" variant="text" size="small" color="error" v-bind="tooltipProps" @click="removeCollateralItem(index)"> ❌ </v-btn>
                  </template>
                </v-tooltip>
              </template>
            </v-data-table-virtual>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div style="display: flex; justify-content: space-evenly; width: 100%">
            <v-btn v-if="!props.readonly" color="primary" @click="saveLc" :loading="loading" :disabled="!isFormValid || !collateralRequired">
              {{ 'ذخیره' }}
            </v-btn>
            <v-btn v-if="!props.readonly" color="error" variant="text" @click="closeDialog"> انصراف</v-btn>
            <v-btn v-if="props.readonly" color="error" variant="text" @click="closeDialog"> بستن</v-btn>

          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- CollateralInputDialog component -->
    <CollateralInputDialog v-model="showCollateralInputDialog" :collateral-options="baseStore.collateral" @save="onCollateralDialogSave" />

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title class="text-h5"> حذف وثیقه</v-card-title>
        <v-card-text> آیا از حذف این وثیقه اطمینان دارید؟</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="confirmDeleteCollateral"> حذف</v-btn>
          <v-btn color="primary" variant="text" @click="cancelDeleteCollateral"> انصراف</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ error }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { IconTrash, IconX, IconPencil } from '@tabler/icons-vue';
import { ApprovalTypeOptions } from '@/constants/enums/approval';
import { useBaseStore } from '@/stores/base';
import { RepaymentTypeOptions } from '@/constants/enums/repaymentType';
import { api } from '@/services/api';
import MoneyInput from '@/components/shared/MoneyInput.vue';
import { useApprovalStore } from '@/stores/approval';
import type { CollateralDto, ContractType, FacilitiesRequest, Facility, FacilityDto, LcRequest } from '@/types/approval/approvalType';
import CollateralInputDialog from '@/components/approval/CollateralInputDialog.vue';
import { formatNumberWithCommas } from '@/utils/number-formatter';
import { CreditTypeOptions, LcTypeOptions } from '@/types/enums/global';

const baseStore = useBaseStore();
const approvalStore = useApprovalStore();
const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const lc = ref<LcRequest[]>([]);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const showCollateralInputDialog = ref(false);
const showDeleteConfirm = ref(false);
const collateralToDelete = ref<number | null>(null);
const error = ref('');
const showError = ref(false);
const selectedCollaterals = ref<
  Array<{
    collateral: CollateralDto;
    amount: number;
    percent: number;
  }>
>([]);
const required = (v: any) => !!v || 'این فیلد الزامی است';
const percentRule = (v: string) => ((Number(v) >= 0 && Number(v) <= 100) || 'درصد باید بین 1 تا 100 باشد');
const contractTypes = ref<ContractType[]>([]);
const facilityList = ref<FacilityDto[]>([]);
const collateralTableItems = computed(() =>
  selectedCollaterals.value.map((item) => ({
    ...item,
    equivalentValue: (item.amount * item.percent) / 100
  }))
);

const props = defineProps<{
  loading?: boolean;
  readonly?: boolean;
}>();
const emit = defineEmits<{
  (e: 'save', data: LcRequest): void;
  (e: 'delete', item: LcRequest): void;
  (e: 'edit', item: LcRequest): void;
  (e: 'update:lc', lc: LcRequest[]): void;
}>();
const collateralRequired = computed(() => selectedCollaterals.value.length > 0);
const formData = reactive({
  approvalType: '',
  currency: '',
  year: '',
  month: '',
  day: '',
  durationDay: '',
  amount: 0,
  collateral: true,
  intermediatePayment: '',
  advancePayment: '',
  creditType: '',
  lcContractType : ''
});

const headers = [
  { title: 'نوع مصوبه', key: 'approvalType', width: '200px' },
  { title: 'نوع ارز', key: 'currency', width: '200px' },
  { title: 'مدت (روز)', key: 'durationDay', width: '200px' },
  { title: 'نوع اعتبار', key: 'creditType', width: '250px' },
  { title: 'نوع اعتبار اسنادی', key: 'lcContractType', width: '250px' },
  { title: 'میان دریافت', key: 'intermediatePayment', width: '200px' },
  { title: 'پیش دریافت', key: 'advancePayment', width: '200px' },
  { title: 'مبلغ', key: 'amount', width: '150px' },
  { title: 'عملیات', key: 'actions', align: 'center', width: '100px' }
];

const onCollateralDialogSave = (data: { collateral: CollateralDto | null; amount: string; percent: string }) => {
  if (!data.collateral) {
    error.value = 'نوع وثیقه الزامی است';
    showError.value = true;
    return;
  }
  try {
    const amountValue = parseFloat(data.amount.replace(/,/g, ''));
    const percentValue = parseFloat(data.percent);
    if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) throw new Error('درصد ارزش گذاری باید بین 0 تا 100 باشد');
    const newCollateralEntry = { collateral: data.collateral, amount: amountValue, percent: percentValue };
    selectedCollaterals.value = [...selectedCollaterals.value, newCollateralEntry];
    showCollateralInputDialog.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'خطا در افزودن وثیقه';
    showError.value = true;
  }
};

const removeCollateralItem = (index: number) => {
  collateralToDelete.value = index;
  showDeleteConfirm.value = true;
};

const confirmDeleteCollateral = () => {
  if (collateralToDelete.value === null) return;
  try {
    const deletedCollateral = selectedCollaterals.value[collateralToDelete.value];
    selectedCollaterals.value = selectedCollaterals.value.filter((_, i) => i !== collateralToDelete.value);
    error.value = `وثیقه ${deletedCollateral.collateral.description} با موفقیت حذف شد`;
    showError.value = true;
  } catch (err) {
    error.value = 'خطا در حذف وثیقه';
    showError.value = true;
  } finally {
    collateralToDelete.value = null;
    showDeleteConfirm.value = false;
  }
};

const cancelDeleteCollateral = () => {
  collateralToDelete.value = null;
  showDeleteConfirm.value = false;
};

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

async function openDialog() {
  isEditing.value = false;
  editingId.value = null;
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  resetForm();
}

function resetForm() {
  formData.amount = 0;
  selectedCollaterals.value = [];
  form.value?.reset();
}

function editItem(item: LcRequest) {
  isEditing.value = true;
  editingId.value = item.id;
  formData.approvalType = item.approvalType;
  formData.currency = item.currency;
  formData.amount = item.amount;
  formData.year = item.year || '';
  formData.month = item.month || '';
  formData.day = item.day || '';
  formData.durationDay = item.durationDay || '';
  selectedCollaterals.value = item.collaterals ? item.collaterals : [];
  formData.intermediatePayment = item.intermediatePayment;
  formData.advancePayment = item.advancePayment;
  formData.creditType = item.creditType;
  formData.lcContractType  = item.lcContractType;
  dialog.value = true;
}

  // Dynamic suffix based on currency code
  const dynamicSuffix = computed(() => {
    return formData.currency === 'IRR' ? ' میلیون ریال' : '';
  });
  
function saveLc() {
  if (!isFormValid.value) return;
  const facilityData: LcRequest = {
    id: editingId.value || Date.now(),
    ...formData,
    collaterals: selectedCollaterals.value
  };
  if (isEditing.value) {
    const index = lc.value.findIndex((f) => f.id === editingId.value);
    if (index !== -1) {
      lc.value[index] = facilityData;
      emit('edit', facilityData);
    }
  } else {
    lc.value.push(facilityData);
    emit('save', facilityData);
  }
  closeDialog();
}

function deleteItem(item: LcRequest) {
  const index = lc.value.findIndex((f) => f.id === item.id);
  if (index !== -1) {
    lc.value.splice(index, 1);
    emit('delete', item);
  }
}

async function fetchFacilities(newContractType: ContractType | null) {
  if (!newContractType) return;
  const res = await api.approval.getFacilities(newContractType.coreId, 'LetterOfCredit');
  facilityList.value = res.data.facilityDtoList || [];
}

function isObjectEmpty(obj: any): boolean {
  if (!obj) return true;
  return Object.values(obj).every((v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0));
}

onMounted(async () => {
  const res = await api.approval.getContractType('LetterOfCredit');
  contractTypes.value = res.data.generalParameterList || [];
  if (approvalStore.loanRequestDetailList?.lc && !isObjectEmpty(approvalStore.loanRequestDetailList.lc)) {
    lc.value = [approvalStore.loanRequestDetailList.lc];
  }
});

watch(
  lc,
  (newVal) => {
    emit('update:lc', newVal);
  },
  { deep: true }
);

defineExpose({ lc });
</script>

<style lang="scss" scoped>
@import '@/scss/components/approval';

.gap-2 {
  gap: 8px;
}

:deep(th) {
  background-color: rgb(var(--v-theme-containerBg)) !important;
  font-weight: 600;
}
</style>
