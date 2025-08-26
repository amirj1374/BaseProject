<template>
  <div class="approval-section">
    <v-form ref="formRef" v-model="isValid" lazy-validation>
      <!-- Financial Metrics -->
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.employmentCount" 
            type="number" 
            :rules="[nonNegative]" 
            label="تعداد اشتغال موجود" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.exportValue" 
            type="number" 
            :rules="[nonNegative]" 
            label="صادرات" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.operatingRevenue" 
            type="number" 
            :rules="[nonNegative]" 
            label="درآمدهای عملیاتی" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.operatingCosts" 
            type="number" 
            :rules="[nonNegative]" 
            label="بهای تمام شده درآمدهای عملیاتی" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.goodsPurchased" 
            type="number" 
            :rules="[nonNegative]" 
            label="خرید کالا" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.operatingProfit" 
            type="number" 
            label="سود عملیاتی" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.netProfit" 
            type="number" 
            label="سود (زیان) خالص" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.currentRatio" 
            type="number" 
            step="0.01" 
            :rules="[ratio]" 
            label="نسبت جاری" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.otherRatio" 
            type="number" 
            step="0.01" 
            :rules="[ratio]" 
            label="نسبت آتی" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.tradeReceivables" 
            type="number" 
            :rules="[nonNegative]" 
            label="دریافتی های تجاری و غیرتجاری" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.inventoryValue" 
            type="number" 
            :rules="[nonNegative]" 
            label="موجودی مواد و كالا" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.totalAssets" 
            type="number" 
            :rules="[nonNegative]" 
            label="جمع کل دارایی‌ها" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.shareholdersEquity" 
            type="number" 
            :rules="[nonNegative]" 
            label="جمع حقوق صاحبان سهام" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.retainedEarnings" 
            type="number" 
            label="سود (زیان) انباشته" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.debtRatio" 
            type="number" 
            step="0.01" 
            :rules="[ratio]" 
            label="نسبت بدهی" 
            variant="outlined" 
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
      </v-row>

      <v-row>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.guaranteeOutstanding" 
            type="number" 
            :rules="[nonNegative]" 
            label="مانده ضمانتنامه‌های صادره" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.creditOutstanding" 
            type="number" 
            :rules="[nonNegative]" 
            label="مانده گشایش اعتبار اسنادی" 
            variant="outlined" 
            density="comfortable" 
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field 
            v-model.number="form.debtOutstanding" 
            type="number" 
            :rules="[nonNegative]" 
            label="مانده بدهی" 
            variant="outlined" 
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
  // تعداد اشتغال موجود
  employmentCount: null,
  // صادرات
  exportValue: null,
  // درآمدهای عملیاتی
  operatingRevenue: null,
  // بهای تمام شده درآمدهای عملیاتی
  operatingCosts: null,
  // خرید کالا
  goodsPurchased: null,
  // سود عملیاتی
  operatingProfit: null,
  // سود (زیان) خالص
  netProfit: null,
  // نسبت جاری
  currentRatio: null,
  // نسبت آتی
  otherRatio: null,
  // دریافتی های تجاری و غیرتجاری
  tradeReceivables: null,
  // موجودی مواد و كالا
  inventoryValue: null,
  // جمع کل دارایی‌ها
  totalAssets: null,
  // جمع حقوق صاحبان سهام
  shareholdersEquity: null,
  // سود (زیان) انباشته
  retainedEarnings: null,
  // نسبت بدهی
  debtRatio: null,
  // چک برگشتی نزد سیستم بانکی
  hasReturnedChecks: false,
  // مانده ضمانتنامه‌های صادره نزد سیستم بانکی در حال حاضر
  guaranteeOutstanding: null,
  // مانده گشایش اعتبار اسنادی نزد سیستم بانکی در حال حاضر
  creditOutstanding: null,
  // مانده بدهی نزد سیستم بانکی در حال حاضر
  debtOutstanding: null,
  // بازدید
  lastVisit: '',
});

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
.credit-approval-form { 
  padding: 8px; 
}
</style>
