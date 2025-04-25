<script lang="ts" setup>
import type { CollateralDto, CurrenciesDto, FacilitiesDto } from '@/types/approval/approvalType';
import { ApprovalTypeOptions, type ApprovalType } from '@/constants/enums/approval';
import { ContractTypeOption, type ContractType } from '@/constants/enums/contractType';
import { RepaymentTypeOptions, type RepaymentType } from '@/constants/enums/repaymentType';
import { LcProductOption} from '@/constants/enums/lcProductType';
import { ref, watch } from 'vue';
import { api } from '@/services/api';
import * as yup from 'yup';
import { useForm, useField } from 'vee-validate';

const formSchema = yup.object({
  approvalType: yup.string().nullable().required('نوع مصوبه الزامی است'),
  currency: yup.string().nullable().required('نوع ارز الزامی است'),
  lcContractType: yup.string().nullable().required('نوع عقد الزامی است'),
  repaymentType: yup.string().nullable().required('نحوه بازپرداخت الزامی است'),
  lcProductType: yup.string().nullable().required('نوع محصول الزامی است'),
  amount: yup.string().nullable().required('مبلغ الزامی است'),
  collateralsString: yup.array().nullable().required('انتخاب وثیقه الزامی است'),
  percentDeposit: yup
    .number()
    .nullable()
    .required('درصد سپرده نقدی الزامی است')
    .min(1, 'حداقل میزان مجار باید بالا تر از 1 باشد')
    .max(100, '"حداکثر میزان مجار 100 باشد'),
  durationDay: yup.number().nullable().required('محاسبه روز الزامی است')
});
const collateralList = ref<CollateralDto[]>([]);
const isDialogActive = ref(false);
const error = ref<string | null>(null);
// form data
const valid = ref<boolean | null>(false);
const emit = defineEmits<{
  (e: 'save', data: any): void;
}>();

const { handleSubmit, errors } = useForm({
  validationSchema: formSchema
});
const { value: approvalType } = useField<ApprovalType | null>('approvalType');
const { value: currency } = useField<string | null>('currency');
const { value: requestType } = useField<string | "LetterOfCredit">('requestType');
const { value: lcContractType } = useField<string | null>('lcContractType');
const { value: repaymentType } = useField<RepaymentType | null>('repaymentType');
const { value: lcProductType } = useField<[] | null>('lcProductType');
const { value: amount } = useField<string | null>('amount');
const { value: collateralsString } = useField<[] | null>('collateralsString');
const { value: percentDeposit } = useField<[] | null>('percentDeposit');
const { value: durationDay } = useField<number | null>('durationDay');
const { value: year } = useField<number | null>('year');
const { value: month } = useField<number | null>('month');
const { value: day } = useField<number | null>('day');

const handleSave = handleSubmit((values) => {
  values.requestType = 'LetterOfCredit';
  console.log(values);
  emit('save', {
    ...values
  });
  valid.value = true;
  isDialogActive.value = false;
});
// define props
const props = defineProps<{
  currencies: CurrenciesDto[];
}>();

const getLcCollateral = async () => {
  if (!isDialogActive) return;
  const lcCollateralRes = await api.approval.getLcCollateral();
  collateralList.value = lcCollateralRes.data;
};

watch(isDialogActive, (active) => {
  if (active) {
    getLcCollateral();
  }
});

const dayCalculate = async () => {
  if (year.value === null && month.value === null && day.value === null) {
    error.value = 'لطفا مقادیر تاریخ را وارد کنید';
  }
  const res = await api.approval.getCalculatedDay(year.value, month.value, day.value); // <- adjust this method name if needed
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
            <v-autocomplete
              v-model="lcContractType"
              :items="ContractTypeOption"
              :error-messages="errors.lcContractType"
              item-title="title"
              item-value="value"
              label="نوع عقد"
              variant="outlined"
              no-data-text="دیتا یافت نشد"
              clearable
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row> </v-row>
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
            <v-btn size="x-large" color="secondary" variant="text" @click="dayCalculate"> محاسبه</v-btn>
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
          <v-col cols="12" md="4">
            <v-text-field
              v-model="amount"
              :error-messages="errors.amount"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="مبلغ"
              type="number"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="percentDeposit"
              :error-messages="errors.percentDeposit"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="درصد سپرده نقدی"
              type="number"
              :min="1"
              :max="100"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4" sm="4">
            <v-autocomplete
              v-model="collateralsString"
              :error-messages="errors.collateralsString"
              :items="collateralList"
              item-title="description"
              item-value="collateralTypeCode"
              label="نوع وثیقه"
              variant="outlined"
              multiple
              clearable
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="lcProductType"
              :items="LcProductOption"
              :error-messages="errors.lcProductType"
              item-title="title"
              item-value="value"
              label="نوع عقد"
              variant="outlined"
              no-data-text="دیتا یافت نشد"
              clearable
            ></v-autocomplete>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions style="display: flex; justify-content: space-evenly; padding: 25px 10px">
        <v-btn color="error" variant="elevated" text="انصراف" @click="isDialogActive = false"></v-btn>
        <v-btn color="primary" variant="elevated" text="ذخیره" @click="handleSave" />
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-if="error" v-model="error" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
</template>
