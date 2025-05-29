<script lang="ts" setup>
import type { CollateralDto, ContractTypeDto, CurrenciesDto } from '@/types/approval/approvalType';
import { ApprovalTypeOptions, type ApprovalType } from '@/constants/enums/approval';
import { RepaymentTypeOptions, type RepaymentType } from '@/constants/enums/repaymentType';
import { ref, watch, computed, onMounted } from 'vue';
import { api } from '@/services/api';
import * as yup from 'yup';
import { useForm, useField } from 'vee-validate';
import CollateralInputDialog from '@/components/approval/CollateralInputDialog.vue';

const props = defineProps<{
  currencies: CurrenciesDto[];
  requestType: string;
  initialData?: any;
  showFields?: FieldConfig;
}>();

const emit = defineEmits<{
  (e: 'save', data: any): void;
  (e: 'cancel'): void;
}>();

// Form state
const isDialogActive = ref(false);
const error = ref<string | null>(null);
const valid = ref<boolean | null>(false);
const showCollateralInputDialog = ref(false);

// Add new ref for snackbar visibility
const showError = ref(false);

// Define the field config type
type FieldConfig = {
  approvalType: boolean;
  currency: boolean;
  contractType: boolean;
  repaymentType: boolean;
  facility: boolean;
  amount: boolean;
  formAmount: boolean;
  duration: boolean;
  other: boolean;
  collateral: boolean;
  intermediatePayment: boolean;
  advancePayment: boolean;
  percentDeposit: boolean;
};

// Set default field configuration based on request type
const defaultFieldConfig = computed<FieldConfig>(() => ({
  approvalType: true,
  currency: true,
  contractType: true,
  repaymentType: true,
  facility: true,
  amount: true,
  formAmount: false,
  duration: true,
  other: true,
  collateral: true,
  intermediatePayment: false,
  advancePayment: false,
  percentDeposit: false
}));

// Merge default config with provided config
const fieldConfig = computed<FieldConfig>(() => {
  // Start with default config
  const config = { ...defaultFieldConfig.value };
  
  // If showFields prop is provided, override the defaults
  if (props.showFields) {
    (Object.keys(props.showFields) as Array<keyof FieldConfig>).forEach(key => {
      if (props.showFields?.[key] !== undefined) {
        config[key] = props.showFields[key]!;
      }
    });
  }
  
  return config;
});

// Form schema
const formSchema = computed(() => {
  const baseSchema: any = {
    approvalType: fieldConfig.value.approvalType ? yup.string().nullable().required('نوع مصوبه الزامی است') : yup.string().nullable(),
    currency: fieldConfig.value.currency ? yup.string().nullable().required('نوع ارز الزامی است') : yup.string().nullable(),
    contractTypeId: fieldConfig.value.contractType ? yup.string().nullable().required('نوع عقد الزامی است') : yup.string().nullable(),
    repaymentType: fieldConfig.value.repaymentType ? yup.string().nullable().required('نحوه بازپرداخت الزامی است') : yup.string().nullable(),
    facilityId: fieldConfig.value.facility ? yup.string().nullable().required('نوع محصول الزامی است') : yup.string().nullable(),
    amount: fieldConfig.value.amount ? yup.string().nullable().required('مبلغ الزامی است') : yup.string().nullable(),
    formAmount: fieldConfig.value.formAmount ? yup.string().nullable().required('مبلغ الزامی است') : yup.string().nullable(),
    durationDay: fieldConfig.value.duration ? yup.number().nullable().required('محاسبه روز الزامی است') : yup.number().nullable(),
    year: yup.number().nullable(),
    month: yup.number().nullable(),
    day: yup.number().nullable(),
    other: yup.string().nullable(),
    intermediatePayment: fieldConfig.value.intermediatePayment ? yup.string().nullable() : yup.string().nullable(),
    advancePayment: fieldConfig.value.advancePayment ? yup.string().nullable() : yup.string().nullable(),
    percentDeposit: fieldConfig.value.percentDeposit ? yup.string().nullable() : yup.string().nullable(),
    selectedCollaterals: fieldConfig.value.collateral ? yup
      .array()
      .of(
        yup.object().shape({
          collateral: yup.object().required(),
          amount: yup.number().required().positive(),
          percent: yup.number().required().min(0).max(100)
        })
      )
      .nullable() : yup.array().nullable()
  };

  return yup.object(baseSchema);
});

interface FormValues {
  approvalType: ApprovalType | null;
  currency: string | null;
  contractTypeId: string | null;
  repaymentType: RepaymentType | null;
  facilityId: string | null;
  amount: string | null;
  formAmount: string | null;
  durationDay: number | null;
  year: number | null;
  month: number | null;
  day: number | null;
  other: string | null;
  intermediatePayment: string | null;
  advancePayment: string | null;
  percentDeposit: string | null;
  selectedCollaterals: Array<{ collateral: CollateralDto; amount: number; percent: number }>;
}

// Form setup
const { handleSubmit, errors, setFieldValue, resetForm } = useForm<FormValues>({
  validationSchema: formSchema,
  initialValues: {
    approvalType: null,
    currency: null,
    contractTypeId: null,
    repaymentType: null,
    facilityId: null,
    amount: null,
    formAmount: null,
    durationDay: null,
    year: null,
    month: null,
    day: null,
    other: null,
    intermediatePayment: null,
    advancePayment: null,
    percentDeposit: null,
    selectedCollaterals: []
  }
});

// Form fields
const { value: approvalType } = useField<ApprovalType | null>('approvalType');
const { value: currency } = useField<string | null>('currency');
const { value: contractTypeId } = useField<string | null>('contractTypeId');
const { value: repaymentType } = useField<RepaymentType | null>('repaymentType');
const { value: facilityId } = useField<string | null>('facilityId');
const { value: amount } = useField<string | null>('amount');
const { value: formAmount } = useField<string | null>('formAmount');
const { value: durationDay } = useField<number | null>('durationDay');
const { value: year } = useField<number | null>('year');
const { value: month } = useField<number | null>('month');
const { value: day } = useField<number | null>('day');
const { value: other } = useField<string | null>('other');
const { value: intermediatePayment } = useField<string | null>('intermediatePayment');
const { value: advancePayment } = useField<string | null>('advancePayment');
const { value: percentDeposit } = useField<string | null>('percentDeposit');
const { value: selectedCollaterals } = useField<
  Array<{
    collateral: CollateralDto;
    amount: number;
    percent: number;
  }>
>('selectedCollaterals');

const amountError = ref<string | null>(null);

// Initialize data arrays with empty arrays
const contractTypes = ref<ContractTypeDto[]>([]);
const facilities = ref<any[]>([]);
const collateralList = ref<CollateralDto[]>([]);

const getContractType = async () => {
  try {
    const res = await api.approval.getContractType(props.requestType);
    contractTypes.value = res.data.generalParameterList || [];
  } catch (err) {
    console.error('Error fetching contract types:', err);
    contractTypes.value = [];
  }
};

const getFacilities = async (id: string) => {
  if (!id) {
    facilities.value = [];
    return;
  }
  try {
    const res = await api.approval.getFacilities(parseInt(id), props.requestType);
    facilities.value = res.data.facilityDtoList || [];
  } catch (err) {
    console.error('Error fetching facilities:', err);
    facilities.value = [];
  }
};

const getCollateral = async () => {
  try {
    const res = await api.approval.getCollateral();
    collateralList.value = res.data || [];
  } catch (err) {
    console.error('Error fetching collaterals:', err);
    collateralList.value = [];
  }
};

const dayCalculate = async () => {
  if (year.value === null && month.value === null && day.value === null) {
    error.value = 'لطفا مقادیر تاریخ را وارد کنید';
    return;
  }
  try {
    const res = await api.approval.getCalculatedDay(year.value, month.value, day.value);
    setFieldValue('durationDay', res.data);
  } catch (err) {
    console.error('Error calculating days:', err);
  }
};

// Collateral handling
const onCollateralDialogSave = (data: { collateral: CollateralDto | null; amount: string; percent: string }) => {
  if (!data.collateral) return;
  const newCollateralEntry = {
    collateral: data.collateral,
    amount: parseFloat(data.amount) || 0,
    percent: parseFloat(data.percent) || 0
  };
  const currentArray = selectedCollaterals.value ? [...selectedCollaterals.value] : [];
  currentArray.push(newCollateralEntry);
  setFieldValue('selectedCollaterals', currentArray);
  showCollateralInputDialog.value = false;
};

const removeCollateralItem = (index: number) => {
  if (selectedCollaterals.value) {
    const currentArray = [...selectedCollaterals.value];
    currentArray.splice(index, 1);
    setFieldValue('selectedCollaterals', currentArray);
  }
};

// Form submission
const handleSave = handleSubmit(
  (values) => {
    const formattedCollaterals =
      values.selectedCollaterals?.map((sc) => ({
        type: sc.collateral.collateralTypeCode,
        amount: sc.amount,
        percent: sc.percent
      })) || [];

    const selectedContractType = contractTypes.value.find((ct) => ct.id === parseInt(values.contractTypeId || '0'));

    const submissionData = {
      ...values,
      requestType: props.requestType,
      contractType: selectedContractType,
      collaterals: formattedCollaterals
    };

    emit('save', submissionData);
    valid.value = true;
    isDialogActive.value = false;
  },
  (errors) => {
    error.value = 'لطفا تمام فیلدهای الزامی را پر کنید';
    showError.value = true;
  }
);

// Add reset function
const resetFormData = () => {
  resetForm({
    values: {
      approvalType: null,
      currency: null,
      contractTypeId: null,
      repaymentType: null,
      facilityId: null,
      amount: null,
      formAmount: null,
      durationDay: null,
      year: null,
      month: null,
      day: null,
      other: null,
      intermediatePayment: null,
      advancePayment: null,
      percentDeposit: null,
      selectedCollaterals: []
    }
  });
  valid.value = false;
  amountError.value = null;
};

// Watch contractTypeId changes to fetch facilities
watch(contractTypeId, (newValue, oldValue) => {
  // Only fetch facilities if the value actually changed and wasn't set by initial data
  if (newValue && newValue !== oldValue) {
    getFacilities(newValue);
  } else if (!newValue) {
    facilities.value = [];
  }
});

// Watch dialog state
watch(isDialogActive, async (newValue) => {
  if (!newValue) {
    // Only reset form and emit cancel if we're not saving
    if (!valid.value) {
      resetFormData();
      emit('cancel');
    }
  } else {
    // Load data when dialog opens
    try {
      // Load contract types and collaterals in parallel
      await Promise.all([
        getContractType(),
        getCollateral()
      ]);
      
      // If we have initial data, load facilities for the contract type
      if (props.initialData?.contractTypeId) {
        await getFacilities(props.initialData.contractTypeId);
      }
    } catch (err) {
      console.error('Error loading form data:', err);
      error.value = 'خطا در بارگذاری اطلاعات';
    }
  }
});

// Initialize form with initial data if provided
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      getContractType().then(() => {
        const contractType = contractTypes.value.find((ct) => ct.id === parseInt(newData.contractTypeId));
        
        const initialFormData = {
          ...newData,
          contractType: contractType
        };

        resetForm({ values: initialFormData });
        valid.value = true;
      });
    }
  },
  { immediate: true }
);

// Expose methods and state
defineExpose({
  isDialogActive,
  valid,
  error,
  showCollateralInputDialog,
  handleSave,
  dayCalculate,
  onCollateralDialogSave,
  removeCollateralItem,
  resetFormData
});
</script>

<template>
  <v-dialog max-width="1200" v-model="isDialogActive">
    <v-card
      :title="props.requestType === 'ContractCode' ? 'تسهیلات' : props.requestType === 'GuaranteeType' ? 'ضمانت نامه' : 'اعتبار اسنادی'"
    >
      <v-card-text>
        <v-row>
          <v-col v-if="fieldConfig.approvalType" cols="12" md="4">
            <v-autocomplete
              v-model="approvalType"
              clearable
              label="نوع مصوبه"
              :items="ApprovalTypeOptions || []"
              :error-messages="errors.approvalType"
              variant="outlined"
              item-title="title"
              item-value="value"
            ></v-autocomplete>
          </v-col>
          <v-col v-if="fieldConfig.currency" cols="12" md="4">
            <v-autocomplete
              v-model="currency"
              clearable
              label="نوع ارز"
              :items="props.currencies || []"
              :error-messages="errors.currency"
              variant="outlined"
              item-title="description"
              item-value="code"
            ></v-autocomplete>
          </v-col>
          <v-col v-if="fieldConfig.repaymentType" cols="12" md="4">
            <v-select
              :items="RepaymentTypeOptions || []"
              v-model="repaymentType"
              :error-messages="errors.repaymentType"
              item-title="title"
              item-value="value"
              no-data-text="یافت نشد"
              label="نحوه بازپرداخت"
              variant="outlined"
              clearable
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-if="fieldConfig.contractType" cols="12" md="4">
            <v-autocomplete
              v-model="contractTypeId"
              :items="contractTypes"
              :error-messages="errors.contractTypeId"
              item-title="longTitle"
              item-value="id"
              label="نوع عقد"
              variant="outlined"
              no-data-text="دیتا یافت نشد"
              clearable
            ></v-autocomplete>
          </v-col>
          <v-col v-if="fieldConfig.facility" cols="12" md="8">
            <v-autocomplete
              :items="facilities"
              v-model="facilityId"
              :error-messages="errors.facilityId"
              item-title="facilityName"
              item-value="facilityCode"
              no-data-text="لطفا ابتدا نوع عقد رو انتخاب کنید"
              label="نوع محصول"
              variant="outlined"
              clearable
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row v-if="fieldConfig.duration">
          <v-col cols="12" md="2">
            <v-text-field
              v-model="year"
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
              v-model="month"
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
              v-model="day"
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
              v-model="durationDay"
              :error-messages="errors.durationDay"
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
          <v-col v-if="fieldConfig.amount" cols="12" md="4">
            <v-text-field
              v-model="amount"
              label="مبلغ"
              placeholder="0"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              suffix="میلیون ریال"
              v-money
              type="text"
            />
          </v-col>
          <v-col v-if="fieldConfig.formAmount" cols="12" md="3">
            <v-text-field
              v-model="formAmount"
              :error-messages="amountError || errors.formAmount"
              label="مبلغ تسهیلات"
              placeholder="0"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              suffix="میلیون ریال"
              v-money
              type="text"
            />
          </v-col>
          <v-col v-if="fieldConfig.percentDeposit" cols="12" md="3">
            <v-text-field
              v-model="percentDeposit"
              label="درصد سپرده نقدی"
              :error-messages="errors.percentDeposit"
              type="text"
              placeholder="0"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              v-money
              suffix="%"
            />
          </v-col>
          <v-col v-if="fieldConfig.intermediatePayment" cols="12" md="4">
            <v-text-field
              v-model="intermediatePayment"
              label="میان دریافت"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              type="text"
              v-money
            />
          </v-col>
          <v-col v-if="fieldConfig.advancePayment" cols="12" md="4">
            <v-text-field
              v-model="advancePayment"
              label="پیش دریافت"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              type="number"
            />
          </v-col>
        </v-row>
        <v-row v-if="fieldConfig.intermediatePayment || fieldConfig.advancePayment">
          <v-col v-if="fieldConfig.other" cols="12" md="12">
            <v-text-field v-model="other" label="سایر" variant="outlined" density="comfortable" hide-details="auto" />
          </v-col>
        </v-row>
        <v-row v-if="fieldConfig.collateral">
          <v-col cols="12">
            <v-btn color="primary" variant="tonal" @click="showCollateralInputDialog = true" class="mb-4"> افزودن وثیقه </v-btn>
          </v-col>
        </v-row>

        <v-data-table
          v-if="fieldConfig.collateral && selectedCollaterals?.length > 0"
          :headers="[
            { title: 'نوع وثیقه', key: 'collateral.description', sortable: false },
            { title: 'مبلغ وثیقه', key: 'amount', sortable: false, align: 'end' },
            { title: 'درصد ارزش گذاری', key: 'percent', sortable: false, align: 'end' },
            { title: 'ارزش معادل وثیقه', key: 'equivalentValue', sortable: false, align: 'end' },
            { title: 'عملیات', key: 'actions', sortable: false, align: 'center' }
          ]"
          :items="
            selectedCollaterals.map((item) => ({
              ...item,
              equivalentValue: (item.amount * item.percent) / 100
            }))
          "
          density="compact"
          class="elevation-1 mb-4"
          hide-default-footer
          no-data-text="هیچ وثیقه ای اضافه نشده است."
        >
          <template v-slot:item.amount="{ item }">
            {{ item.amount.toLocaleString() }}
          </template>
          <template v-slot:item.percent="{ item }"> {{ item.percent }}% </template>
          <template v-slot:item.equivalentValue="{ item }">
            {{ item.equivalentValue.toLocaleString() }}
          </template>
          <template v-slot:item.actions="{ index }">
            <v-tooltip location="top" text="حذف وثیقه">
              <template v-slot:activator="{ props: tooltipProps }">
                <v-btn icon variant="text" size="small" color="error" v-bind="tooltipProps" @click="removeCollateralItem(index)">
                  ❌
                </v-btn>
              </template>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions style="display: flex; justify-content: space-evenly; padding: 25px 10px">
        <v-btn color="primary" variant="elevated" @click="handleSave">
          {{
            props.requestType === 'ContractCode'
              ? 'ذخیره تسهیلات'
              : props.requestType === 'GuaranteeType'
                ? 'ذخیره ضمانت نامه'
                : 'ذخیره اعتبار اسنادی'
          }}
        </v-btn>
        <v-btn color="error" variant="elevated" @click="isDialogActive = false">انصراف</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <CollateralInputDialog v-model="showCollateralInputDialog" :collateral-options="collateralList" @save="onCollateralDialogSave" />

  <v-snackbar v-model="showError" color="error" timeout="3000">
    {{ error }}
  </v-snackbar>
</template>
