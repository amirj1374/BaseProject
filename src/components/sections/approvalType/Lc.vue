<script lang="ts" setup>
import type { CollateralDto, CurrenciesDto, FacilitiesDto } from '@/types/approval/approvalType';
import { ApprovalTypeOptions, type ApprovalType } from '@/constants/enums/approval';
import { ContractTypeOption, type ContractType } from '@/constants/enums/contractType';
import { RepaymentTypeOptions, type RepaymentType } from '@/constants/enums/repaymentType';
import { LcProductOption} from '@/constants/enums/lcProductType';
import { ref, watch, computed } from 'vue';
import { api } from '@/services/api';
import * as yup from 'yup';
import { useForm, useField } from 'vee-validate';
import CollateralInputDialog from '@/components/approval/CollateralInputDialog.vue';
import VPriceTextField from '@/components/shared/VPriceTextField.vue';
import { AlertCircleIcon, SquareRoundedCheckFilledIcon } from 'vue-tabler-icons';

const formSchema = yup.object({
  approvalType: yup.string().nullable().required('نوع مصوبه الزامی است'),
  currency: yup.string().nullable().required('نوع ارز الزامی است'),
  contractTypeId: yup.string().nullable().required('نوع عقد الزامی است'),
  repaymentType: yup.string().nullable().required('نحوه بازپرداخت الزامی است'),
  facilityId: yup.string().nullable().required('نوع محصول الزامی است'),
  amount: yup.string().nullable().required('مبلغ الزامی است'),
  intermediatePayment: yup.string().nullable(),
  advancePayment: yup.string().nullable(),
  durationDay: yup.number().nullable().required('محاسبه روز الزامی است'),
  year: yup.number().nullable(),
  month: yup.number().nullable(),
  day: yup.number().nullable(),
  other: yup.string().nullable(),
  selectedCollaterals: yup
    .array()
    .of(
      yup.object().shape({
        collateral: yup.object().required(),
        amount: yup.number().required().positive(),
        percent: yup.number().required().min(0).max(100)
      })
    )
    .nullable()
});

const collateralList = ref<CollateralDto[]>([]);
const LcProductList = ref<[]>([]);
const isDialogActive = ref(false);
const error = ref<string | null>(null);
const valid = ref<boolean | null>(false);
const showCollateralInputDialog = ref(false);

const emit = defineEmits<{
  (e: 'save', data: any): void;
}>();

interface LcFormValues {
  requestType?: string;
  approvalType: ApprovalType | null;
  currency: string | null;
  contractTypeId: string | null;
  repaymentType: RepaymentType | null;
  facilityId: string | null;
  amount: string | null;
  intermediatePayment: string | null;
  advancePayment: string | null;
  durationDay: number | null;
  year: number | null;
  month: number | null;
  day: number | null;
  other: string | null;
  selectedCollaterals: Array<{ collateral: CollateralDto; amount: number; percent: number }>;
}

const { handleSubmit, errors, setFieldValue } = useForm<LcFormValues>({
  validationSchema: formSchema,
  initialValues: {
    approvalType: null,
    currency: null,
    contractTypeId: null,
    repaymentType: null,
    facilityId: null,
    amount: null,
    intermediatePayment: null,
    advancePayment: null,
    durationDay: null,
    year: null,
    month: null,
    day: null,
    other: null,
    selectedCollaterals: []
  }
});

const { value: approvalType } = useField<ApprovalType | null>('approvalType');
const { value: currency } = useField<string | null>('currency');
const { value: requestType } = useField<string | "LetterOfCredit">('requestType');
const { value: contractTypeId } = useField<string>('contractTypeId');
const { value: repaymentType } = useField<RepaymentType | null>('repaymentType');
const { value: facilityId } = useField<string | null>('facilityId');
const { value: amount } = useField<string | null>('amount');
const { value: intermediatePayment } = useField<string | null>('intermediatePayment');
const { value: advancePayment } = useField<string | null>('advancePayment');
const { value: durationDay } = useField<number | null>('durationDay');
const { value: year } = useField<number | null>('year');
const { value: month } = useField<number | null>('month');
const { value: day } = useField<number | null>('day');
const { value: other } = useField<string | null>('other');
const { value: selectedCollaterals } = useField<Array<{ collateral: CollateralDto; amount: number; percent: number }>>('selectedCollaterals');

const handleSave = handleSubmit((values) => {
  console.log('Form values:', values);
  values.requestType = 'LetterOfCredit';
  
  const formattedCollaterals = values.selectedCollaterals?.map(sc => ({
    type: sc.collateral.collateralTypeCode,
    amount: sc.amount,
    percent: sc.percent
  })) || [];

  const submissionData = {
    ...values,
    facilityId: values.facilityId,
    collaterals: formattedCollaterals
  };
  
  console.log('Submission data:', submissionData);
  emit('save', submissionData);
  valid.value = true;
  isDialogActive.value = false;
});

const onCollateralDialogSave = (data: { collateral: CollateralDto | null; amount: string; percent: string }) => {
  if (!data.collateral) {
    return;
  }
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

const props = defineProps<{
  currencies: CurrenciesDto[];
}>();

const getLcCollateral = async () => {
  if (!isDialogActive.value) return;
  try {
    const res = await api.approval.getCollateral();
    collateralList.value = res.data;
  } catch (err: any) {
    console.error('Error fetching collaterals:', err);
    error.value = 'خطا در دریافت لیست وثایق';
  }
};

const getProduct = async (contractTypeId: string) => {
  if (!contractTypeId) return;
  const res = await api.approval.getLcProduct(contractTypeId);
  LcProductList.value = res.data;
};

watch(isDialogActive, (active) => {
  if (active) {
    getLcCollateral();
  }
});

watch(contractTypeId, (id) => {
  if (contractTypeId.value) {
    getProduct(contractTypeId.value);
  }
});

const dayCalculate = async () => {
  if (year.value === null && month.value === null && day.value === null) {
    error.value = 'لطفا مقادیر تاریخ را وارد کنید';
  }
  const res = await api.approval.getCalculatedDay(year.value, month.value, day.value);
  durationDay.value = res.data;
};
</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    اعتبار اسنادی
    <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
    <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <v-dialog max-width="1200" v-model="isDialogActive">
    <v-card title="اعتبار اسنادی">
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
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="contractTypeId"
              :items="ContractTypeOption"
              :error-messages="errors.contractTypeId"
              item-title="title"
              item-value="value"
              label="نوع عقد"
              variant="outlined"
              no-data-text="دیتا یافت نشد"
              clearable
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="8">
            <v-autocomplete
              :items="LcProductList"
              v-model="facilityId"
              :error-messages="errors.facilityId"
              item-title="title"
              item-value="value"
              no-data-text="یافت نشد"
              label="نوع محصول"
              variant="outlined"
              clearable
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="3">
            <VPriceTextField
              v-model="amount"
              label="مبلغ"
              :error-messages="errors.amount"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="3">
            <VPriceTextField
              v-model="intermediatePayment"
              label="میان دریافت"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="3">
            <VPriceTextField
              v-model="advancePayment"
              label="پیش دریافت"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="other"
              label="سایر"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
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
            ></v-text-field>
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
        <v-btn color="primary" variant="elevated" text="ذخیره اعتبار اسنادی" @click="handleSave" />
        <v-btn color="error" variant="elevated" text="انصراف" @click="isDialogActive = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <CollateralInputDialog v-model="showCollateralInputDialog" :collateral-options="collateralList" @save="onCollateralDialogSave" />

  <v-snackbar v-if="error" v-model="error" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
</template>
