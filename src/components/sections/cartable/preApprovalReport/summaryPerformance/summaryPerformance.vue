<template>
  <div class="approval-section">
    <v-form ref="formRef" v-model="isValid" lazy-validation>
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.employmentCount"
            label="تعداد اشتغال موجود"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.exportValue"
            label="صادرات"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.operatingRevenue"
            label="درآمدهای عملیاتی"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.operatingCosts"
            label="بهای تمام شده درآمدهای عملیاتی"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.goodsPurchased"
            label="خرید کالا"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.operatingProfit"
            label="سود عملیاتی"
            variant="outlined"
            type="number"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.netProfit"
            label="سود (زیان) خالص"
            variant="outlined"
            type="number"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.currentRatio"
            label="نسبت جاری"
            variant="outlined"
            type="number"
            step="0.01"
            :rules="[ratioRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.otherRatio"
            label="نسبت آتی"
            variant="outlined"
            type="number"
            step="0.01"
            :rules="[ratioRule]"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.tradeReceivables"
            label="دریافتی های تجاری و غیرتجاری"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.inventoryValue"
            label="موجودی مواد و كالا"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.totalAssets"
            label="جمع کل دارایی‌ها"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.shareholdersEquity"
            label="جمع حقوق صاحبان سهام"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.retainedEarnings"
            label="سود (زیان) انباشته"
            variant="outlined"
            type="number"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.debtRatio"
            label="نسبت بدهی"
            variant="outlined"
            type="number"
            step="0.01"
            :rules="[ratioRule]"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="3" class="d-flex align-center">
          <v-switch
            v-model="form.hasReturnedChecks"
            inset
            color="primary"
            hide-details
            class="me-2"
          />
          <span>چک برگشتی نزد سیستم بانکی</span>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.guaranteeOutstanding"
            label="مانده ضمانتنامه‌های صادره"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.creditOutstanding"
            label="مانده گشایش اعتبار اسنادی"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model.number="form.debtOutstanding"
            label="مانده بدهی"
            variant="outlined"
            type="number"
            :rules="[nonNegativeRule]"
            density="comfortable"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="form.lastVisit"
            label="بازدید"
            variant="outlined"
            density="comfortable"
            placeholder="مثال: 1403/05/01"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="form.finalApprovalReference"
            label="مرجع تصویب نهایی"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="form.attachedByLetterNo"
            label="منضم به نامه شماره"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="form.attachedByLetterNoDate"
            label="تاریخ"
            variant="outlined"
            density="comfortable"
            placeholder="مثال: 1403/05/01"
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="form.regionOrCorpBankingSuggestion"
            label="پیشنهاد سرپرستی منطقه/ مدیریت بانکداری شرکتی"
            variant="outlined"
            rows="3"
            auto-grow
            density="comfortable"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="form.otherConditionsAndObservations"
            label="سایر شرایط و ملاحظات"
            variant="outlined"
            rows="3"
            auto-grow
            density="comfortable"
          />
        </v-col>

        <v-divider class="my-4" />

        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.letterNo"
            label="شماره نامه"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="form.letterDate"
            label="تاریخ نامه"
            variant="outlined"
            density="comfortable"
            placeholder="مثال: 1403/05/01"
          />
        </v-col>
        <v-col cols="12" md="12">
          <v-textarea
            v-model="form.reqDescription"
            label="شرح درخواست"
            variant="outlined"
            rows="3"
            auto-grow
            density="comfortable"
          />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script lang="ts" setup>
import { api } from '@/services/api';
import { onMounted, ref } from 'vue';

// Define props for the component
const props = defineProps({
  loanRequestId: {
    type: String,
    required: true
  },
  cartableId: {
    type: String,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  }
});

const formRef = ref();
const isValid = ref(false);

const form = ref({
  employmentCount: null as number | null,
  exportValue: null as number | null,
  operatingRevenue: null as number | null,
  operatingCosts: null as number | null,
  goodsPurchased: null as number | null,
  operatingProfit: null as number | null,
  netProfit: null as number | null,
  currentRatio: null as number | null,
  otherRatio: null as number | null,
  tradeReceivables: null as number | null,
  inventoryValue: null as number | null,
  totalAssets: null as number | null,
  shareholdersEquity: null as number | null,
  retainedEarnings: null as number | null,
  debtRatio: null as number | null,
  hasReturnedChecks: false as boolean,
  guaranteeOutstanding: null as number | null,
  creditOutstanding: null as number | null,
  debtOutstanding: null as number | null,
  lastVisit: '' as string,
  finalApprovalReference: '' as string,
  attachedByLetterNo: '' as string,
  attachedByLetterNoDate: '' as string,
  regionOrCorpBankingSuggestion: '' as string,
  otherConditionsAndObservations: '' as string,
  letterNo: '' as string,
  letterDate: '' as string,
  reqDescription: '' as string,
});

// Basic validation rules
const nonNegativeRule = (v: any) => (v == null || v === '' || Number(v) >= 0) || 'باید بزرگ‌تر یا مساوی صفر باشد';
const ratioRule = (v: any) => (v == null || v === '' || (Number(v) >= 0 && Number(v) <= 9999)) || 'مقدار نامعتبر';

onMounted(async () => {
  const res = await api.cartable.getCreditApproval(props.cartableId);
  if (res.status === 200) {
    form.value = res.data;
  }
});

// Submit data method for stepper
const submitData = async () => {
  const result = await formRef.value?.validate();
  if (result?.valid === false) {
    return Promise.reject('لطفاً خطاهای فرم را برطرف کنید');
  }
  if (result?.valid === true) {
    const res = await api.cartable.saveCreditApproval(form.value);
    if (res.status === 200) {
      return Promise.resolve();
    }
    return Promise.reject('خطا در ثبت اطلاعات');
  }
  // You can send `form.value` to API here if needed
};

// Expose the submitData method for the stepper
defineExpose({ submitData });
</script>
