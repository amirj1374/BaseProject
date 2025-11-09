<template>
  <div class="approval-section">
    <div class="section-header">
      <h4 class="section-title">تسهیلات</h4>
      <v-btn
        v-if="!props.readonly"
        color="secondary"
        @click="openDialog"
        :disabled="customizerStore.loading || facilities.length >= 4"
      >
        افزودن تسهیلات
      </v-btn>
    </div>

    <v-data-table-virtual
      :headers="headers"
      :items="facilities"
      :loading="customizerStore.loading"
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
        <div v-if="Array.isArray(item.contractTypeAndFacilityList) && item.contractTypeAndFacilityList.length">
          <div v-for="(selection, index) in item.contractTypeAndFacilityList" :key="`facility-${item.id}-${index}`">
            {{ selection.facility?.facilityName || '-' }}
          </div>
        </div>
        <span v-else>
          {{ item.facility?.facilityName || '-' }}
        </span>
      </template>
      <template #item.contractType="{ item }">
        <div v-if="Array.isArray(item.contractTypeAndFacilityList) && item.contractTypeAndFacilityList.length">
          <div v-for="(selection, index) in item.contractTypeAndFacilityList" :key="`contract-${item.id}-${index}`">
            {{ selection.contractType?.longTitle || '-' }}
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
          <span class="text-h3">{{ isEditing ? 'ویرایش تسهیلات' : 'افزودن تسهیلات' }}</span>
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
                  v-model="formData.repaymentType"
                  label="نحوه بازپرداخت"
                  variant="outlined"
                  density="comfortable"
                  :items="RepaymentTypeOptions || []"
                  :rules="[required]"
                  :disabled="props.readonly"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-btn
                  color="primary"
                  variant="tonal"
                  :disabled="props.readonly || (!requiresFacilitySelection && contractTypeAndFacilityList.length >= 1)"
                  class="mb-4"
                  @click="showFacilityProductDialog = true"
                >
                  افزودن نوع عقد و محصول
                </v-btn>
              </v-col>
            </v-row>
            <v-data-table-virtual
              v-if="facilitySelectionTableItems.length > 0"
              :headers="[
                { title: 'نوع عقد', key: 'contractTypeTitle', width: '250px' },
                { title: 'نوع محصول', key: 'facilityTitle', width: '250px' },
                { title: 'عملیات', key: 'actions', align: 'center', width: '100px' }
              ]"
              :items="facilitySelectionTableItems"
              density="compact"
              class="elevation-1 mb-4"
              hide-default-footer
              no-data-text="هیچ محصولی اضافه نشده است."
            >
              <template #item.actions="{ index }">
                <v-tooltip location="top" text="حذف محصول">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      :disabled="props.readonly"
                      variant="text"
                      size="small"
                      color="error"
                      v-bind="tooltipProps"
                      @click="removeFacilitySelection(index)"
                    >
                      ❌
                    </v-btn>
                  </template>
                </v-tooltip>
              </template>
            </v-data-table-virtual>
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
                  v-model="formData.preferentialRate"
                  label="نرخ ترجیحی"
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
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.advancePayment"
                  label="پیش دریافت"
                  placeholder="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  suffix="%"
                  type="number"
                  min="1"
                  max="100"
                  :disabled="props.readonly"
                  :rules="[percentRule]"
                />
              </v-col>
              <v-col cols="12" md="6">
                  <v-checkbox
                    :model-value="Boolean(formData.considerPreviousDebt)"
                    @update:model-value="(value: any) => formData.considerPreviousDebt = Boolean(value)"
                    label="بدهی قبلی لحاظ شود؟"
                    density="comfortable"
                    :disabled="props.readonly"
                    v-if="formData.approvalType === 'ANNUAL_LIMIT'"
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
                    <v-btn :disabled="props.readonly" variant="text" size="small" color="error" v-bind="tooltipProps" @click="removeCollateralItem(index)"> ❌ </v-btn>
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
              @click="saveFacility"
              :loading="loading"
              :disabled="!isFormValid || !collateralRequired || !facilitySelectionValid"
            >
              {{ 'ذخیره' }}
            </v-btn>
            <v-btn v-if="!props.readonly" color="error" variant="text" @click="closeDialog"> انصراف</v-btn>
            <v-btn v-if="props.readonly" color="error" variant="text" @click="closeDialog"> بستن</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <FacilityProductDialog
      v-model="showFacilityProductDialog"
      :contract-types="contractTypes"
      :existing-selections="contractTypeAndFacilityList"
      @save="onFacilityProductDialogSave"
    />

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
import FacilityProductDialog from '@/components/approval/FacilityProductDialog.vue';
import MoneyInput from '@/components/shared/MoneyInput.vue';
import { ApprovalTypeOptions } from '@/constants/enums/approval';
import { RepaymentTypeOptions } from '@/constants/enums/repaymentType';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import { useBaseStore } from '@/stores/base';
import { useCustomizerStore } from '@/stores/customizer';
import type {
  CollateralDto,
  ContractType,
  FacilitiesRequest,
  FacilityDto,
  FacilitySelection
} from '@/types/approval/approvalType';
import { formatNumberWithCommas } from '@/utils/number-formatter';
import { IconPencil, IconTrash, IconX } from '@tabler/icons-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
const customizerStore = useCustomizerStore();
const baseStore = useBaseStore();
const approvalStore = useApprovalStore();
const dialog = ref(false);
const form = ref();
const isFormValid = ref(false);
const facilities = ref<FacilitiesRequest[]>([]);
const isInitializingForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const showCollateralInputDialog = ref(false);
const showFacilityProductDialog = ref(false);
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
const contractTypes = ref<ContractType[]>([]);
const contractTypeAndFacilityList = ref<FacilitySelection[]>([]);
const collateralTableItems = computed(() =>
  selectedCollaterals.value.map((item) => ({
    ...item,
    equivalentValue: (item.amount * item.percent) / 100
  }))
);
const percentRule = (v: string) =>  (Number(v) >= 0 && Number(v) <= 100) || 'درصد باید بین 1 تا 100 باشد';

const props = defineProps<{
  loading?: boolean;
  readonly?: boolean;
}>();

// Computed property for disabled state
const isDisabled = computed(() => props.readonly || props.loading);
const emit = defineEmits<{
  (e: 'save', data: FacilitiesRequest): void;
  (e: 'delete', item: FacilitiesRequest): void;
  (e: 'edit', item: FacilitiesRequest): void;
  (e: 'update:facilities', facilities: FacilitiesRequest[]): void;
}>();
const collateralRequired = computed(() => selectedCollaterals.value.length > 0);
const facilitySelectionTableItems = computed(() =>
  contractTypeAndFacilityList.value.map((item) => ({
    contractTypeTitle: item.contractType.longTitle,
    facilityTitle: item.facility.facilityName
  }))
);
const formData = reactive({
  approvalType: '',
  currency: '',
  repaymentType: '',
  year: '',
  month: '',
  day: '',
  durationDay: '',
  amount: 0,
  collateral: true,
  preferentialRate: '',
  advancePayment: '',
  contractType: null as ContractType | null,
  facility: null as FacilityDto | null,
  considerPreviousDebt: false
});

const requiresFacilitySelection = computed(() => formData.approvalType === 'ANNUAL_LIMIT');
const facilitySelectionValid = computed(() => !requiresFacilitySelection.value || contractTypeAndFacilityList.value.length > 0);

const headers = [
  { title: 'نوع مصوبه', key: 'approvalType', width: '200px' },
  { title: 'نوع ارز', key: 'currency', width: '200px' },
  { title: 'نوع عقد', key: 'contractType', width: '150px' },
  { title: 'نوع محصول', key: 'facility', width: '500px' },
  { title: 'نحوه بازپرداخت', key: 'repaymentType', width: '250px' },
  { title: 'نرخ ترجیحی', key: 'preferentialRate', width: '200px' },
  { title: 'پیش دریافت', key: 'advancePayment', width: '250px' },
  { title: 'مدت (روز)', key: 'durationDay', width: '200px' },
  { title: 'مبلغ', key: 'amount', width: '200px' },
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

const onFacilityProductDialogSave = (payload: FacilitySelection) => {
  if (requiresFacilitySelection.value) {
    contractTypeAndFacilityList.value = [...contractTypeAndFacilityList.value, payload];
  } else {
    contractTypeAndFacilityList.value = [payload];
  }

  if (!requiresFacilitySelection.value || contractTypeAndFacilityList.value.length === 1) {
    formData.contractType = payload.contractType;
    formData.facility = payload.facility;
  }

  showFacilityProductDialog.value = false;
};

const removeFacilitySelection = (index: number) => {
  contractTypeAndFacilityList.value = contractTypeAndFacilityList.value.filter((_, i) => i !== index);

  if (requiresFacilitySelection.value) {
    if (contractTypeAndFacilityList.value.length > 0) {
      const primary = contractTypeAndFacilityList.value[0];
      formData.contractType = primary.contractType;
      formData.facility = primary.facility;
    } else {
      formData.contractType = null;
      formData.facility = null;
    }
  } else if (contractTypeAndFacilityList.value.length === 0) {
    formData.contractType = null;
    formData.facility = null;
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
    showError.value = true;
    return;
  }
  try {
    const res = await api.approval.getCalculatedDay(Number(formData.year), Number(formData.month), Number(formData.day));
    formData.durationDay = res.data;
  } catch (err) {
    error.value = 'خطا در محاسبه روزها';
    showError.value = true;
    console.error('Error calculating days:', err);
  }
};

  // Dynamic suffix based on currency code
  const dynamicSuffix = computed(() => {
    return formData.currency === 'IRR' ? ' میلیون ریال' : '';
  });

watch(
  () => formData.approvalType,
  (newVal, oldVal) => {
    if (newVal === oldVal || isInitializingForm.value) {
      return;
    }

    if (newVal === 'ANNUAL_LIMIT') {
      return;
    } else {
      if (contractTypeAndFacilityList.value.length > 1) {
        contractTypeAndFacilityList.value = [contractTypeAndFacilityList.value[0]];
      }
      if (contractTypeAndFacilityList.value.length > 0) {
        formData.contractType = contractTypeAndFacilityList.value[0].contractType;
        formData.facility = contractTypeAndFacilityList.value[0].facility;
      } else {
        formData.contractType = null;
        formData.facility = null;
      }
    }
  }
);

async function openDialog() {
  if (facilities.value.length >= 4) {
    error.value = 'حداکثر ۴ تسهیلات قابل ثبت است.';
    showError.value = true;
    return;
  }
  isEditing.value = false;
  editingId.value = null;
  form.value?.resetValidation();
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  resetForm();
}

function resetForm() {
  isInitializingForm.value = true;
  formData.amount = 0;
  formData.repaymentType = '';
  formData.contractType = null;
  formData.facility = null;
  selectedCollaterals.value = [];
  contractTypeAndFacilityList.value = [];
  form.value?.reset();
  isInitializingForm.value = false;
}

function editItem(item: FacilitiesRequest) {
  isInitializingForm.value = true;
  isEditing.value = true;
  editingId.value = item.id;
  formData.approvalType = item.approvalType || '';
  formData.currency = item.currency;
  formData.amount = item.amount;
  formData.repaymentType = item.repaymentType;
  formData.year = item.year || '';
  formData.month = item.month || '';
  formData.day = item.day || '';
  formData.durationDay = item.durationDay || '';
  selectedCollaterals.value = item.collaterals ? item.collaterals : [];
  const existingSelections = Array.isArray(item.contractTypeAndFacilityList) && item.contractTypeAndFacilityList.length > 0
    ? item.contractTypeAndFacilityList
    : item.contractType && item.facility
      ? [{ contractType: item.contractType, facility: item.facility }]
      : [];

  contractTypeAndFacilityList.value = existingSelections.map((selection) => ({
    contractType: selection.contractType,
    facility: selection.facility
  }));

  const primarySelection = contractTypeAndFacilityList.value[0];

  if (item.approvalType === 'ANNUAL_LIMIT') {
    formData.contractType = primarySelection?.contractType || null;
    formData.facility = primarySelection?.facility || null;
  } else {
    formData.contractType = primarySelection?.contractType || item.contractType || null;
    formData.facility = primarySelection?.facility || item.facility || null;
    if (contractTypeAndFacilityList.value.length > 1) {
      contractTypeAndFacilityList.value = [contractTypeAndFacilityList.value[0]];
    }
  }
  formData.preferentialRate = item.preferentialRate;
  formData.advancePayment = item.advancePayment;
  formData.considerPreviousDebt = item.considerPreviousDebt;
  dialog.value = true;
  isInitializingForm.value = false;
}

function saveFacility() {
  if (!isFormValid.value) {
    return;
  }

  if (!facilitySelectionValid.value) {
    if (requiresFacilitySelection.value) {
      error.value = 'حداقل یک ترکیب عقد و محصول باید انتخاب شود.';
      showError.value = true;
    }
    return;
  }

  if (requiresFacilitySelection.value) {
    if (contractTypeAndFacilityList.value.length === 0) {
      error.value = 'حداقل یک ترکیب عقد و محصول باید انتخاب شود.';
      showError.value = true;
      return;
    }
    const primarySelection = contractTypeAndFacilityList.value[0];
    formData.contractType = primarySelection.contractType;
    formData.facility = primarySelection.facility;
  } else if (contractTypeAndFacilityList.value.length > 0) {
    const primarySelection = contractTypeAndFacilityList.value[0];
    formData.contractType = primarySelection.contractType;
    formData.facility = primarySelection.facility;
  }
  const base_id = editingId.value ?? Date.now();

  const facilityData: FacilitiesRequest = {
    id: base_id,
    ...formData,
    preferentialRate: formData.preferentialRate || '0',
    contractType: formData.contractType || ({} as ContractType),
    facility: formData.facility || ({} as FacilityDto),
    collaterals: selectedCollaterals.value,
    contractTypeAndFacilityList: contractTypeAndFacilityList.value.length
      ? contractTypeAndFacilityList.value.map((selection) => ({
          contractType: selection.contractType,
          facility: selection.facility
        }))
      : undefined
  };
  if (isEditing.value) {
    const index = facilities.value.findIndex((f) => f.id === editingId.value);
    if (index !== -1) {
      facilities.value[index] = facilityData;
      emit('edit', facilityData);
    }
  } else {
    emit('save', facilityData);
  }
  closeDialog();
}

function deleteItem(item: FacilitiesRequest) {
  const index = facilities.value.findIndex((f) => f.id === item.id);
  if (index !== -1) {
    facilities.value.splice(index, 1);
    emit('delete', item);
  }
}

function isObjectEmpty(obj: any): boolean {
  if (!obj) return true;
  return Object.values(obj).every((v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0));
}

onMounted(async () => {
  try {
    const res = await api.approval.getContractType('ContractCode');
    contractTypes.value = res.data.generalParameterList || [];
    const storeFacilities = approvalStore.loanRequestDetailList?.facilities as FacilitiesRequest[] | undefined;
    if (Array.isArray(storeFacilities) && storeFacilities.length > 0) {
      facilities.value = storeFacilities;
    }
  } catch (err) {
    error.value = 'خطا در دریافت انواع قرارداد';
    showError.value = true;
    console.error('Error fetching contract types:', err);
  }
});

watch(
  () => approvalStore.loanRequestDetailList?.facilities,
  (newVal) => {
    const arr = newVal as FacilitiesRequest[] | undefined;
    if (Array.isArray(arr)) {
      facilities.value = arr;
    }
  },
  { immediate: false, deep: true }
);

watch(
  facilities,
  (newVal) => {
    emit('update:facilities', newVal);
  },
  { deep: true }
);

defineExpose({ facilities });
</script>

<style lang="scss" scoped>
@import '@/scss/components/approval';

:deep(th) {
  background-color: rgb(var(--v-theme-containerBg)) !important;
  font-weight: 600;
}
</style>
