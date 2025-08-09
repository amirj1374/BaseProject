<template>
  <div class="approval-section">
    <v-form ref="formRef" v-model="isValid" lazy-validation>
      <!-- Box: Summary / Key Metrics -->
      <v-row>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.employmentCount" type="number" :rules="[nonNegative]" label="تعداد اشتغال موجود" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.exportValue" type="number" :rules="[nonNegative]" label="صادرات" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.operatingRevenue" type="number" :rules="[nonNegative]" label="درآمدهای عملیاتی" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.operatingCosts" type="number" :rules="[nonNegative]" label="بهای تمام شده درآمدهای عملیاتی" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.goodsPurchased" type="number" :rules="[nonNegative]" label="خرید کالا" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.operatingProfit" type="number" label="سود عملیاتی" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.netProfit" type="number" label="سود (زیان) خالص" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.currentRatio" type="number" step="0.01" :rules="[ratio]" label="نسبت جاری" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.otherRatio" type="number" step="0.01" :rules="[ratio]" label="نسبت آتی" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.tradeReceivables" type="number" :rules="[nonNegative]" label="دریافتی های تجاری و غیرتجاری" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.inventoryValue" type="number" :rules="[nonNegative]" label="موجودی مواد و كالا" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.totalAssets" type="number" :rules="[nonNegative]" label="جمع کل دارایی‌ها" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.shareholdersEquity" type="number" :rules="[nonNegative]" label="جمع حقوق صاحبان سهام" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.retainedEarnings" type="number" label="سود (زیان) انباشته" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.debtRatio" type="number" step="0.01" :rules="[ratio]" label="نسبت بدهی" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3" class="d-flex align-center"><v-switch v-model="form.hasReturnedChecks" inset color="primary" hide-details class="me-2" /><span>چک برگشتی نزد سیستم بانکی</span></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.guaranteeOutstanding" type="number" :rules="[nonNegative]" label="مانده ضمانتنامه‌های صادره" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.creditOutstanding" type="number" :rules="[nonNegative]" label="مانده گشایش اعتبار اسنادی" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.debtOutstanding" type="number" :rules="[nonNegative]" label="مانده بدهی" variant="outlined" density="comfortable" /></v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Box: Attachments / Visit -->
      <v-row>
        <v-col cols="12" md="3"><v-text-field v-model="form.lastVisit" label="بازدید" variant="outlined" density="comfortable" placeholder="مثال: 1403/05/01" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model="form.finalApprovalReference" label="مرجع تصویب نهایی" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model="form.attachedByLetterNo" label="منضم به نامه شماره" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model="form.attachedByLetterNoDate" label="تاریخ" variant="outlined" density="comfortable" placeholder="مثال: 1403/05/01" /></v-col>
      </v-row>

      <v-row>
        <v-col cols="12"><v-textarea v-model="form.regionOrCorpBankingSuggestion" label="پیشنهاد سرپرستی منطقه/ مدیریت بانکداری شرکتی" variant="outlined" rows="3" auto-grow density="comfortable" /></v-col>
        <v-col cols="12"><v-textarea v-model="form.otherConditionsAndObservations" label="سایر شرایط و ملاحظات" variant="outlined" rows="3" auto-grow density="comfortable" /></v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Box: Applicant Request -->
      <v-row>
        <v-col cols="12" md="4"><v-text-field v-model="form.letterNo" label="شماره نامه" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.letterDate" label="تاریخ نامه" variant="outlined" density="comfortable" placeholder="مثال: 1403/05/01" /></v-col>
        <v-col cols="12" md="12"><v-textarea v-model="form.reqDescription" label="شرح درخواست" variant="outlined" rows="3" auto-grow density="comfortable" /></v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Box: Recent Approvals -->
      <v-row>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.creditApprovalNo" type="number" label="شماره مصوبه" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model="form.creditApprovalDate" label="تاریخ مصوبه" variant="outlined" density="comfortable" placeholder="مثال: 1403/05/01 12:00" /></v-col>
        <v-col cols="12" md="3">
          <v-select v-model="form.loanRequestType" :items="loanRequestTypeOptions" label="تسهیلات/تعهدات" variant="outlined" density="comfortable" clearable />
        </v-col>
        <v-col cols="12" md="3"><v-text-field v-model="form.cashDeposit" label="سپرده نقدی" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.approvalCollaterals" type="number" label="وثائق طبق مصوبه" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.usedVolume" type="number" label="حجم استفاده شده" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.activeRemainAmount" type="number" label="مانده فعال" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.depositAmount" type="number" step="0.01" label="وثیقه - سپرده/ضمانتنامه" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.estateAmount" type="number" step="0.01" label="وثیقه - غیر منقول" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.chequeAmount" type="number" step="0.01" label="وثیقه - چک" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.promissoryNoteAmount" type="number" step="0.01" label="وثیقه - سفته" variant="outlined" density="comfortable" /></v-col>
      </v-row>

      <v-divider class="my-4" />

      <!-- Box: Company Info -->
      <v-row>
        <v-col cols="12" md="3"><v-text-field v-model="form.companyType" label="نوع شرکت" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.registrationCode" type="number" label="شماره ثبت" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model="form.registrationDate" label="تاریخ ثبت" variant="outlined" density="comfortable" placeholder="مثال: 1403/05/01 12:00" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model="form.registrationLocation" label="محل ثبت" variant="outlined" density="comfortable" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.customerCode" type="number" label="شماره مشتری" variant="outlined" density="comfortable" /></v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';

const props = defineProps<{ cartableId: string; loanRequestId: string; currentStep: number; totalSteps: number; loanRequestTypeOptions?: string[] }>();

const formRef = ref();
const isValid = ref(false);

const form = ref<any>({
  employmentCount: null,
  exportValue: null,
  operatingRevenue: null,
  operatingCosts: null,
  goodsPurchased: null,
  operatingProfit: null,
  netProfit: null,
  currentRatio: null,
  otherRatio: null,
  tradeReceivables: null,
  inventoryValue: null,
  totalAssets: null,
  shareholdersEquity: null,
  retainedEarnings: null,
  debtRatio: null,
  hasReturnedChecks: false,
  guaranteeOutstanding: null,
  creditOutstanding: null,
  debtOutstanding: null,
  lastVisit: '',
  finalApprovalReference: '',
  attachedByLetterNo: '',
  attachedByLetterNoDate: '',
  regionOrCorpBankingSuggestion: '',
  otherConditionsAndObservations: '',
  letterNo: '',
  letterDate: '',
  reqDescription: '',
  creditApprovalNo: null,
  creditApprovalDate: '',
  loanRequestType: undefined,
  cashDeposit: '',
  approvalCollaterals: null,
  usedVolume: null,
  activeRemainAmount: null,
  depositAmount: null,
  estateAmount: null,
  chequeAmount: null,
  promissoryNoteAmount: null,
  companyType: '',
  registrationCode: null,
  registrationDate: '',
  registrationLocation: '',
  customerCode: null,
});

const loanRequestTypeOptions = ref<string[]>(props.loanRequestTypeOptions || []);

const nonNegative = (v: any) => v == null || v === '' || Number(v) >= 0 || 'باید ≥ 0 باشد';
const ratio = (v: any) => v == null || v === '' || (Number(v) >= 0 && Number(v) <= 9999) || 'مقدار نامعتبر';

onMounted(async () => {
  try {
    const res = await api.cartable.getCreditApproval(props.cartableId);
    if (res?.status === 200 && res.data) {
      form.value = { ...form.value, ...res.data };
    }
  } catch (e) {
    // ignore load failure silently
  }
});

const submitData = async () => {
  const result = await formRef.value?.validate();
  if (result?.valid === false) return Promise.reject('لطفاً خطاهای فرم را برطرف کنید');
  try {
    // If backend expects cartableId, attach it
    const payload = { ...form.value, cartableId: props.cartableId };
    // If save API exists
    // @ts-ignore
    if (api.cartable.saveCreditApproval) {
      // @ts-ignore
      const res = await api.cartable.saveCreditApproval(payload);
      if (res?.status === 200) return Promise.resolve();
      return Promise.reject('خطا در ثبت اطلاعات');
    }
    // Fallback: resolve without saving if API not available
    return Promise.resolve();
  } catch (e) {
    return Promise.reject('خطا در ثبت اطلاعات');
  }
};

defineExpose({ submitData });
</script>

<style scoped>
.credit-approval-form { padding: 8px; }
</style>
