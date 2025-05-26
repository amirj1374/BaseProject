<script lang="ts" setup>
import type { CollateralDto, ContractTypeDto, CurrenciesDto, FacilitiesDto } from '@/types/approval/approvalType';
import { ApprovalTypeOptions, type ApprovalType } from '@/constants/enums/approval';
import { RepaymentTypeOptions } from '@/constants/enums/repaymentType';
import type { RepaymentType } from '@/constants/enums/repaymentType';
import { onMounted, ref, watch, computed } from 'vue';
import { api } from '@/services/api';
import * as yup from 'yup';
import { useForm, useField } from 'vee-validate';
import CollateralInputDialog from '@/components/approval/CollateralInputDialog.vue';
import VPriceTextField from '@/components/shared/VPriceTextField.vue';

interface FacilityFormValues {
  requestType?: string;
  approvalType: ApprovalType | null;
  currency: string | null;
  contractTypeId: string | null;
  repaymentType: RepaymentType | null;
  facilityId: string | null; // Assuming facilityId is a string (facilityCode)
  amount: string | null;
  durationDay: number | null;
  year: number | null;
  month: number | null;
  day: number | null;
  other: string | null;
  advancePayment: string | null;
  selectedCollaterals: Array<{ collateral: CollateralDto; amount: number; percent: number }>;
}

const formSchema = yup.object({
  approvalType: yup.string().nullable().required('نوع مصوبه الزامی است'),
  currency: yup.string().nullable().required('نوع ارز الزامی است'),
  contractTypeId: yup.string().nullable().required('نوع عقد الزامی است'),
  repaymentType: yup.string().nullable().required('نحوه بازپرداخت الزامی است'),
  facilityId: yup.string().nullable().required('نوع محصول الزامی است'),
  amount: yup.string().nullable().required('مبلغ الزامی است'),
  durationDay: yup.number().nullable().required('محاسبه روز الزامی است'),
  other: yup.string().nullable(),
  advancePayment: yup.string().nullable(),
  year: yup.number().nullable(),
  month: yup.number().nullable(),
  day: yup.number().nullable(),
  selectedCollaterals: yup
    .array()
    .of(
      yup.object().shape({
        collateral: yup.object().required(),
        amount: yup.number().transform((value) => (isNaN(value) ? undefined : value)),
        percent: yup
          .number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .min(0, 'درصد باید بین 0 تا 100 باشد')
          .max(100, 'درصد باید بین 0 تا 100 باشد')
      })
    )
    .nullable()
});
const contractTypes = ref<ContractTypeDto[]>([]);
const allCollateralOptions = ref<CollateralDto[]>([]);
const facilities = ref<FacilitiesDto[]>([]);
const isDialogActive = ref(false);
const error = ref<string | null>(null);
const valid = ref<boolean | null>(false);

const emit = defineEmits<{
  (e: 'save', data: any): void;
}>();

const {
  handleSubmit,
  errors,
  setFieldValue,
  values: formValues
} = useForm<FacilityFormValues>({
  validationSchema: formSchema,
  initialValues: {
    approvalType: null,
    currency: null,
    contractTypeId: null,
    repaymentType: null,
    facilityId: null,
    amount: null,
    durationDay: null,
    other: null,
    advancePayment: null,
    year: null,
    month: null,
    day: null,
    selectedCollaterals: []
  }
});

const { value: approvalType } = useField<ApprovalType | null>('approvalType');
const { value: currency } = useField<string | null>('currency');
// requestType is not a user input field, set in handleSave
const { value: contractTypeId } = useField<string | null>('contractTypeId');
const { value: repaymentType } = useField<RepaymentType | null>('repaymentType');
const { value: facilityId } = useField<string | null>('facilityId');
const { value: formAmount, errorMessage: amountError } = useField<string | null>('amount');
const { value: other } = useField<string | null>('other');
const { value: advancePayment } = useField<string | null>('advancePayment');
const { value: durationDay, errorMessage: durationDayError } = useField<number | null>('durationDay');
const { value: year } = useField<number | null>('year');
const { value: month } = useField<number | null>('month');
const { value: day } = useField<number | null>('day');
const { value: selectedCollaterals, errorMessage: selectedCollateralsError } = useField<
  Array<{
    collateral: CollateralDto;
    amount: number;
    percent: number;
  }>
>('selectedCollaterals');

const showCollateralInputDialog = ref(false);

const handleSave = handleSubmit(
  (currentFormValues) => {
    console.log('handleSave function called');
    console.log('Form values before save:', currentFormValues);
    console.log('Available contract types:', contractTypes.value);

    const formattedCollaterals =
      currentFormValues.selectedCollaterals?.map((sc) => ({
        type: sc.collateral.collateralTypeCode,
        amount: sc.amount,
        percent: sc.percent
      })) || [];

    // Find the selected contract type object from the contractTypes array
    const selectedContractType = contractTypes.value.find((ct) => ct.id === parseInt(currentFormValues.contractTypeId || '0'));
    console.log('Selected contract type:', selectedContractType);

    const submissionData = {
      ...currentFormValues,
      requestType: 'ContractCode',
      contractType: selectedContractType, // Add the full contract type object
      collaterals: formattedCollaterals,
      amount: currentFormValues.amount
    };

    emit('save', submissionData);
    valid.value = true;
    isDialogActive.value = false;
  },
  (errors) => {
    console.log('Validation errors:', errors);
    error.value = 'لطفا تمام فیلدهای الزامی را پر کنید';
  }
);

const props = defineProps<{
  currencies: CurrenciesDto[];
}>();

const getContractType = async () => {
  if (!isDialogActive.value || !api.approval) return;
  try {
    const res = await api.approval.getContractType('ContractCode');
    contractTypes.value = res.data.generalParameterList;
  } catch (err: any) {
    console.error('Error fetching contract types:', err);
  }
};
const getFacilities = async (id: any) => {
  if (!id || !api.approval) return;
  const res = await api.approval.getFacilities(id, 'ContractCode');
  facilities.value = res.data.facilityDtoList;
};

const getCollateralOptions = async () => {
  try {
    if (!api.approval) return;
    const res = await api.approval.getCollateral();
    allCollateralOptions.value = res.data;
  } catch (err) {
    console.error('Error fetching collateral options:', err);
    error.value = 'Could not load collateral options.';
  }
};

const dayCalculate = async () => {
  if (year.value === null && month.value === null && day.value === null) {
    error.value = 'لطفا مقادیر تاریخ را وارد کنید';
    return;
  }
  if (!api.approval) return;
  const res = await api.approval.getCalculatedDay(year.value, month.value, day.value);
  // durationDay.value = res.data; // This should be: setFieldValue('durationDay', res.data)
  setFieldValue('durationDay', res.data);
};

const onCollateralDialogSave = (data: { collateral: CollateralDto | null; amount: string; percent: string }) => {
  if (!data.collateral) {
    return;
  }

  const parsedAmount = parseFloat(data.amount.replace(/,/g, '')) || 0;
  const parsedPercent = parseFloat(data.percent) || 0;

  const newCollateralEntry = {
    collateral: data.collateral,
    amount: parsedAmount,
    percent: parsedPercent
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

const collateralTableHeaders = ref([
  { title: 'نوع وثیقه', key: 'collateral.description', sortable: false },
  { title: 'مبلغ وثیقه', key: 'amount', sortable: false, align: 'end' },
  { title: 'درصد ارزش گذاری', key: 'percent', sortable: false, align: 'end' },
  { title: 'ارزش معادل وثیقه', key: 'equivalentValue', sortable: false, align: 'end' },
  { title: 'عملیات', key: 'actions', sortable: false, align: 'center' }
]);

const processedSelectedCollaterals = computed(() => {
  return (
    selectedCollaterals.value?.map((item) => ({
      ...item,
      equivalentValue: (item.amount * item.percent) / 100
    })) || []
  );
});

onMounted(async () => {
  // await getCollateralOptions(); // Fetched on dialog open if needed
});

watch(isDialogActive, (active) => {
  if (active) {
    getContractType();
    if (allCollateralOptions.value.length === 0) {
      getCollateralOptions();
    }
  }
});

watch(contractTypeId, (id) => {
  if (id) {
    getFacilities(id);
  }
});
</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    تسهیلات
    <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
    <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>

  <v-dialog max-width="2500" v-model="isDialogActive" persistent>
    <v-card title="تسهیلات">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="approvalType"
              clearable
              label="نوع مصوبه"
              :items="ApprovalTypeOptions"
              :error-messages="errors.approvalType"
              variant="outlined"
              item-title="title"
              item-value="value"
              density="comfortable"
              hide-details="auto"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="currency"
              clearable
              label="نوع ارز"
              :items="props.currencies"
              :error-messages="errors.currency"
              variant="outlined"
              item-title="description"
              item-value="code"
              density="comfortable"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              :items="RepaymentTypeOptions"
              v-model="repaymentType"
              :error-messages="errors.repaymentType"
              item-title="title"
              item-value="value"
              no-data-text="یافت نشد"
              label="نحوه بازپرداخت"
              variant="outlined"
              clearable
              density="comfortable"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
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
          <v-col cols="12" md="8">
            <v-autocomplete
              v-model="facilityId"
              :items="facilities"
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
        <v-row>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="year"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="سال"
              type="number"
            />
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
            />
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
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn size="x-large" color="secondary" variant="outlined" @click="dayCalculate"> محاسبه</v-btn>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="durationDay"
              :error-messages="durationDayError || errors.durationDay"
              density="comfortable"
              variant="outlined"
              color="primary"
              label="مدت"
              readonly
              suffix="روز"
            />
          </v-col>
          <v-col cols="12" md="2">
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
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="other" label="سایر" variant="outlined" density="comfortable" hide-details="auto" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formAmount"
              :error-messages="amountError || errors.amount"
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
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-btn color="primary" variant="tonal" @click="showCollateralInputDialog = true" class="mb-4"> افزودن وثیقه </v-btn>
          </v-col>
        </v-row>

        <v-data-table
          v-if="processedSelectedCollaterals.length > 0"
          :headers="collateralTableHeaders"
          :items="processedSelectedCollaterals"
          density="compact"
          class="elevation-1 mb-4"
          hide-default-footer
          no-data-text="هیچ وثیقه ای اضافه نشده است."
        >
          <template v-slot:item.amount="{ item }">
            {{ item.amount.toLocaleString() }}
          </template>
          <template v-slot:item.percent="{ item }"> {{ item.percent }}%</template>
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
        <v-btn
          color="primary"
          variant="elevated"
          @click="
            () => {
              console.log('Save button clicked');
              handleSave();
            }
          "
        >
          ذخیره تسهیلات
        </v-btn>
        <v-btn color="error" variant="elevated" @click="isDialogActive = false">انصراف</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <CollateralInputDialog v-model="showCollateralInputDialog" :collateral-options="allCollateralOptions" @save="onCollateralDialogSave" />

  <v-snackbar v-if="error" v-model="error" color="error" timeout="3500" location="top right">
    {{ error }}
  </v-snackbar>
</template>
