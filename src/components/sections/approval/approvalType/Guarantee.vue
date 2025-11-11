<template>
  <div class="approval-section">
    <div class="section-header">
      <h4 class="section-title">ضمانت‌نامه</h4>
      <v-btn
        v-if="!props.readonly"
        color="secondary"
        @click="openDialog"
        :disabled="loading || guarantee.length >= 4 || approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"
      >
        افزودن ضمانت‌نامه</v-btn
      >
    </div>

    <v-data-table-virtual
      :headers="headers"
      :items="guarantee"
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
        {{ RepaymentTypeOptions.find((opt) => opt.value === (item as any).repaymentType)?.title || '-' }}
      </template>
      <template #item.facility="{ item }">
        {{ item.facility?.facilityName || '-' }}
      </template>
      <template #item.contractType="{ item }">
        <div v-if="Array.isArray(item.contractTypeAndFacilityList) && item.contractTypeAndFacilityList.length">
          <div v-for="(entry, index) in item.contractTypeAndFacilityList" :key="`guarantee-contract-${item.id}-${index}`">
            {{ entry.contractType?.longTitle || '-' }}
          </div>
        </div>
        <span v-else>
          {{ item.contractType?.longTitle || '-' }}
        </span>
      </template>
      <template #item.amount="{ item }">
        {{ formatNumberWithCommas(item.amount) }}
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <v-btn size="small" variant="text" @click="editItem(item)">
            <IconPencil color="blue" size="20" />
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
          <span v-if="!props.readonly" class="text-h3">{{ isEditing ? 'ویرایش ضمانت نامه' : 'افزودن ضمانت نامه' }}</span>
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
                <v-text-field
                  v-model="formData.percentDeposit"
                  label="درصد سپرده نقدی"
                  placeholder="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  suffix="%"
                  type="number"
                  :rules="[percentRule]"
                  min="1"
                  max="100"
                  :disabled="props.readonly"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="12">
                <CustomAutocomplete
                  v-model="contractTypeModel"
                  :items="contractTypes"
                  label="نوع ضمانت نامه"
                  placeholder="انتخاب نوع ضمانت‌نامه..."
                  :multiple="isAnnualLimit"
                  :return-object="true"
                  clearable
                  density="comfortable"
                  :rules="[required]"
                  :disabled="props.readonly"
                  display-style="detailed"
                  :fields="{
                    title: 'longTitle',
                    value: 'coreId',
                    group: 'groupId',
                    isMainGroup: 'isMainGroup'
                  }"
                />
              </v-col>
              <!-- <v-col cols="12" md="8">
                <v-autocomplete
                  :items="facilityList"
                  v-model="formData.facility"
                  item-title="facilityName"
                  item-value="facilityCode"
                  no-data-text="لطفا ابتدا نوع عقد رو انتخاب کنید"
                  label="نوع محصول"
                  variant="outlined"
                  clearable
                  return-object
                  :rules="[required]"
                    :disabled="props.readonly"
                ></v-autocomplete>
              </v-col> -->
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
                  :disabled="props.readonly"
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
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-checkbox
                  :model-value="Boolean(formData.considerPreviousDebt)"
                  @update:model-value="(value: any) => (formData.considerPreviousDebt = Boolean(value))"
                  label="بدهی قبلی لحاظ شود؟"
                  density="comfortable"
                  :disabled="props.readonly"
                  v-if="formData.approvalType === 'ANNUAL_LIMIT'"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-btn color="primary" variant="tonal" :disabled="props.readonly" @click="showCollateralInputDialog = true" class="mb-4">
                  افزودن وثیقه
                </v-btn>
              </v-col>
            </v-row>
            <v-data-table-virtual
              v-if="collateralTableItems.length > 0"
              :headers="[
                { title: 'نوع وثیقه', key: 'collateral.description', sortable: true, width: '250px' },
                { title: 'مبلغ وثیقه', key: 'amount', sortable: true, align: 'end', width: '200px' },
                { title: 'درصد پوشش', key: 'percent', sortable: true, align: 'end', width: '250px' },
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
                    <v-btn
                      v-if="!props.readonly"
                      variant="text"
                      size="small"
                      color="error"
                      v-bind="tooltipProps"
                      @click="removeCollateralItem(index)"
                    >
                      ❌
                    </v-btn>
                  </template>
                </v-tooltip>
              </template>
            </v-data-table-virtual>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div style="display: flex; justify-content: space-evenly; width: 100%">
            <v-btn
              v-if="!props.readonly"
              color="primary"
              @click="saveGuarantee"
              :loading="loading"
              :disabled="!isFormValid || !collateralRequired"
            >
              {{ 'ذخیره' }}
            </v-btn>
            <v-btn v-if="!props.readonly" color="error" variant="text" @click="closeDialog"> انصراف</v-btn>
            <v-btn v-if="props.readonly" color="primary" variant="text" @click="closeDialog"> بستن</v-btn>
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
import CollateralInputDialog from '@/components/approval/CollateralInputDialog.vue';
import CustomAutocomplete from '@/components/shared/CustomAutocomplete.vue';
import MoneyInput from '@/components/shared/MoneyInput.vue';
import { ApprovalTypeOptions } from '@/constants/enums/approval';
import { RepaymentTypeOptions } from '@/constants/enums/repaymentType';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import { useBaseStore } from '@/stores/base';
import type { CollateralDto, ContractType, FacilityDto, GuaranteeRequest } from '@/types/approval/approvalType';
import { formatNumberWithCommas } from '@/utils/number-formatter';
import { IconPencil, IconTrash, IconX } from '@tabler/icons-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';

const baseStore = useBaseStore();
const approvalStore = useApprovalStore();
const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
type GuaranteeSelection = { contractType: ContractType };
type GuaranteeRow = GuaranteeRequest & { contractTypeAndFacilityList?: GuaranteeSelection[] };

const guarantee = ref<GuaranteeRow[]>([]);
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
const required = (v: any) => {
  if (Array.isArray(v)) {
    return v.length > 0 || 'این فیلد الزامی است';
  }
  return (v !== null && v !== undefined && v !== '') || 'این فیلد الزامی است';
};
const contractTypes = ref<ContractType[]>([]);
const facilityList = ref<FacilityDto[]>([]);
const contractTypeList = ref<ContractType[]>([]);
const collateralTableItems = computed(() =>
  selectedCollaterals.value.map((item) => ({
    ...item,
    equivalentValue: (item.amount * item.percent) / 100
  }))
);
const percentRule = (v: string) => (!v && 'این فیلد الزامی است') || (Number(v) >= 1 && Number(v) <= 100) || 'درصد باید بین 1 تا 100 باشد';

const props = defineProps<{
  loading?: boolean;
  readonly?: boolean;
}>();
const emit = defineEmits<{
  (e: 'save', data: GuaranteeRequest): void;
  (e: 'delete', item: GuaranteeRequest): void;
  (e: 'edit', item: GuaranteeRequest): void;
  (e: 'update:guarantee', guarantee: GuaranteeRequest[]): void;
}>();
const collateralRequired = computed(() => selectedCollaterals.value.length > 0);
const isAnnualLimit = computed(() => formData.approvalType === 'ANNUAL_LIMIT');

const formData = reactive({
  approvalType: '',
  currency: '',
  year: '',
  month: '',
  day: '',
  durationDay: '',
  amount: 0,
  collateral: true,
  percentDeposit: '',
  contractType: null as ContractType | null,
  facility: null as FacilityDto | null,
  considerPreviousDebt: false
});

const contractTypeModel = computed({
  get: () => (isAnnualLimit.value ? contractTypeList.value : formData.contractType),
  set: (value: unknown) => {
    if (isAnnualLimit.value) {
      const list = Array.isArray(value) ? (value as ContractType[]) : value ? [value as ContractType] : [];
      contractTypeList.value = list;
      formData.contractType = list[0] ?? null;
      formData.facility = null;
      const lastSelected = list[list.length - 1] ?? null;
    } else {
      const single = Array.isArray(value) ? (value as ContractType[])[0] ?? null : (value as ContractType | null) ?? null;
      formData.contractType = single;
      contractTypeList.value = single ? [single] : [];
      formData.facility = null;
    }
  }
});

const mapToViewRow = (item: GuaranteeRequest): GuaranteeRow => {
  const existingList = item.contractTypeAndFacilityList;
  const selections =
    Array.isArray(existingList) && existingList.length
      ? existingList.map((entry) => entry.contractType)
      : item.contractType
        ? [item.contractType]
        : [];
  return {
    ...item,
    contractTypeAndFacilityList: selections.map((contract) => ({ contractType: contract }))
  };
};

const headers = [
  { title: 'نوع مصوبه', key: 'approvalType', width: '150px' },
  { title: 'نوع ارز', key: 'currency', width: '150px' },
  { title: 'نوع ضمانت نامه', key: 'contractType', width: '150px' },
  { title: 'درصد سپرده نقدی', key: 'percentDeposit', width: '200px' },
  { title: 'مدت (روز)', key: 'durationDay', width: '100px' },
  { title: 'مبلغ', key: 'amount', width: '150px' },
  { title: 'عملیات', key: 'actions', align: 'center' as const, width: '100px' }
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
  formData.contractType = null;
  formData.facility = null;
  contractTypeList.value = [];
  facilityList.value = [];
  selectedCollaterals.value = [];
  form.value?.reset();
}

// Dynamic suffix based on currency code
const dynamicSuffix = computed(() => {
  return formData.currency === 'IRR' ? ' میلیون ریال' : '';
});

function editItem(item: GuaranteeRequest) {
  isEditing.value = true;
  editingId.value = item.id;
  formData.approvalType = item.approvalType || '';
  formData.currency = item.currency;
  formData.amount = item.amount;
  formData.year = item.year || '';
  formData.month = item.month || '';
  formData.day = item.day || '';
  formData.durationDay = item.durationDay || '';
  selectedCollaterals.value = item.collaterals ? item.collaterals : [];
  contractTypeList.value =
    Array.isArray(item.contractTypeAndFacilityList) && item.contractTypeAndFacilityList.length
      ? item.contractTypeAndFacilityList
          .map((entry) => entry.contractType)
          .filter((contract): contract is ContractType => Boolean(contract))
      : item.contractType
        ? [item.contractType]
        : [];
  formData.contractType = contractTypeList.value[0] || item.contractType || null;
  formData.facility = item.facility || null;
  formData.percentDeposit = item.percentDeposit;
  formData.considerPreviousDebt = item.considerPreviousDebt;
  dialog.value = true;
}

function saveGuarantee() {
  if (!isFormValid.value) return;

  const selectedContracts = isAnnualLimit.value ? [...contractTypeList.value] : formData.contractType ? [formData.contractType] : [];

  if (selectedContracts.length === 0) {
    error.value = 'لطفاً حداقل یک نوع ضمانت نامه انتخاب کنید.';
    showError.value = true;
    return;
  }

  const primaryContract = selectedContracts[0];
  formData.contractType = primaryContract || null;

  const contractSelections: GuaranteeSelection[] = selectedContracts.map((contract) => ({ contractType: contract }));

  const guaranteePayload: GuaranteeRequest = {
    id: editingId.value || Date.now(),
    ...formData,
    contractType: formData.contractType || ({} as ContractType),
    facility: formData.facility || ({} as FacilityDto),
    collaterals: selectedCollaterals.value,
    contractTypeAndFacilityList: contractSelections
  };

  const viewRow: GuaranteeRow = { ...guaranteePayload };

  if (isEditing.value) {
    const index = guarantee.value.findIndex((f) => f.id === editingId.value);
    if (index !== -1) {
      guarantee.value[index] = viewRow;
      emit('edit', guaranteePayload);
    }
  } else {
    guarantee.value = [...guarantee.value.filter((row) => row.id !== viewRow.id), viewRow];
    emit('save', guaranteePayload);
  }
  closeDialog();
}

function deleteItem(item: GuaranteeRow) {
  const index = guarantee.value.findIndex((f) => f.id === item.id);
  if (index !== -1) {
    const [removed] = guarantee.value.splice(index, 1);
    emit('delete', removed as GuaranteeRequest);
  }
}

watch(
  () => formData.approvalType,
  (newVal, oldVal) => {
    if (newVal === oldVal) {
      return;
    }

    if (newVal === 'ANNUAL_LIMIT') {
      contractTypeList.value = formData.contractType ? [formData.contractType] : [...contractTypeList.value];
    } else {
      const primary = contractTypeList.value[0] ?? formData.contractType ?? null;
      contractTypeList.value = primary ? [primary] : [];
      formData.contractType = primary;
      formData.facility = null;
    }
  }
);

function isObjectEmpty(obj: any): boolean {
  if (!obj) return true;
  return Object.values(obj).every((v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0));
}

onMounted(async () => {
  const res = await api.approval.getGuaranteeType();
  contractTypes.value = res.data.generalParameters || [];
  const storeGuarantee = approvalStore.loanRequestDetailList?.guarantee as GuaranteeRequest[] | undefined;
  if (Array.isArray(storeGuarantee) && storeGuarantee.length > 0) {
    guarantee.value = storeGuarantee.map(mapToViewRow);
  }
});

watch(
  () => approvalStore.loanRequestDetailList?.guarantee,
  (newVal: GuaranteeRequest[] | undefined) => {
    const arr = newVal as GuaranteeRequest[] | undefined;
    if (Array.isArray(arr)) {
      guarantee.value = arr.map(mapToViewRow);
    }
  },
  { immediate: false, deep: true }
);

watch(
  guarantee,
  (newVal: GuaranteeRow[]) => {
    emit('update:guarantee', newVal);
  },
  { deep: true }
);

defineExpose({ guarantee });
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
