<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';

const approvalStore = useApprovalStore();
const value = ref(0);
// Remove global loading, add per-API loading
const isLoadingCheque = ref(false);
const isLoadingIndirect = ref(false);
const isLoadingDirect = ref(false);
const isLoadingSap = ref(false);
const responseStatus = ref<'idle' | 'success' | 'error' | 'empty'>('idle');
const chequeData = ref<any>(null);
const IndirectObligationData = ref<any>(null);
const DirectObligationData = ref<any>(null);
const sapData = ref<any>(null);
const canSubmit = ref(false);

const getInquiry = async () => {
  responseStatus.value = 'idle';
  chequeData.value = null;
  IndirectObligationData.value = null;
  DirectObligationData.value = null;
  sapData.value = null;
  canSubmit.value = false;

  // همه رو اول فعال کنیم
  isLoadingCheque.value = true;
  isLoadingIndirect.value = true;
  isLoadingDirect.value = true;
  isLoadingSap.value = true;

  let errorCount = 0;

  try {
    if (!approvalStore.loanRequestId) {
      throw new Error('شناسه درخواست نامعتبر است');
    }

    // --- 1. استعلام چک
    try {
      const res = await api.approval.getInquiryCheque(approvalStore.loanRequestId);
      chequeData.value = res.data;
    } catch {
      errorCount++;
    } finally {
      isLoadingCheque.value = false;
    }

    // --- 2. استعلام غیرمستقیم
    try {
      const res = await api.approval.getIndirectObligation(approvalStore.loanRequestId);
      IndirectObligationData.value = res.data;
    } catch {
      errorCount++;
    } finally {
      isLoadingIndirect.value = false;
    }

    // --- 3. استعلام مستقیم
    try {
      const res = await api.approval.getDirectObligation(approvalStore.loanRequestId);
      DirectObligationData.value = res.data;
    } catch {
      errorCount++;
    } finally {
      isLoadingDirect.value = false;
    }

    // --- 4. استعلام SAP
    try {
      const res = await api.approval.getSapInquiry({
        loanRequestId: approvalStore.loanRequestId,
        nationalCode: approvalStore.customerInfo.nationalCode
      });
      sapData.value = res.data;
    } catch {
      errorCount++;
    } finally {
      isLoadingSap.value = false;
    }

    // --- تعیین وضعیت نهایی
    if (errorCount === 4) {
      responseStatus.value = 'error';
    } else if (errorCount > 0) {
      responseStatus.value = 'empty';
    } else {
      responseStatus.value = 'success';
    }

    canSubmit.value = true;
  } catch (err) {
    responseStatus.value = 'error';
    isLoadingCheque.value = false;
    isLoadingIndirect.value = false;
    isLoadingDirect.value = false;
    isLoadingSap.value = false;
  }
};


onMounted(() => {
  getInquiry();
});

const submitData = async () => {
  if (canSubmit.value === false) {
    return Promise.reject('لطفا تا زمان دریافت استعلام منتطر بمانید');
  } else return Promise.resolve();
};

defineExpose({ submitData });
</script>

<template>
  <div class="approval-section">
    <h3 class="group-title">استعلام</h3>
    <v-row justify="center">
      <!-- تعهدات مستقیم -->
      <v-col cols="12" md="6">
        <v-card color="grey-lighten-4" class="pa-4 text-start" rounded="sm" variant="outlined">
          <h3 class="text-4 text-secondary text-center mb-2">استعلام تعهدات مستقیم</h3>
          <div class="inquiry-result-container">
            <div v-if="isLoadingDirect" class="text-center loading-container">
              <v-progress-circular indeterminate color="primary" />
              <div>در حال استعلام تعهدات مستقیم...</div>
            </div>
            <template v-else>
              <div><b>مبلغ کل : </b> {{ DirectObligationData?.totalAmount }}</div>
            </template>
          </div>
        </v-card>
      </v-col>

      <!-- تعهدات غیر مستقیم -->
      <v-col cols="12" md="6">
        <v-card color="grey-lighten-4" class="pa-4 text-start" rounded="sm" variant="outlined">
          <h3 class="text-4 text-secondary text-center mb-2">استعلام تعهدات غیر مستقیم</h3>
          <div class="inquiry-result-container">
            <div v-if="isLoadingIndirect" class="text-center loading-container">
              <v-progress-circular indeterminate color="primary" />
              <div>در حال استعلام تعهدات غیر مستقیم...</div>
            </div>
            <template v-else>
              <div><b>نام : </b> {{ IndirectObligationData?.allOfThem || 'نامشخص' }}</div>
              <div><b>مبلغ کل : </b> {{ IndirectObligationData?.totalAmount || 'نامشخص' }}</div>
            </template>
          </div>
        </v-card>
      </v-col>

      <!-- چک‌های برگشتی با انیمیشن چرخشی -->
      <v-col cols="12" md="6">
        <div class="inquiry-card-wrapper">
          <v-card color="grey-lighten-4" class="pa-4 text-start mb-4" rounded="sm" variant="outlined">
            <h3 class="text-4 text-secondary text-center mb-2">استعلام چک های برگشتی</h3>
            <div class="inquiry-result-container">
              <div v-if="isLoadingCheque" class="text-center loading-container">
                <v-progress-circular indeterminate color="primary" />
                <div>در حال استعلام چک های برگشتی...</div>
              </div>
              <template v-else>
                <div><b>چک برگشتی دارد؟ </b> {{ chequeData?.bouncedCheque || 'ندارد' }}</div>
                <div><b>تعداد : </b> {{ chequeData?.count || '0' }}</div>
                <div><b>مبلغ کل : </b> {{ chequeData?.amount || '0' }}</div>
              </template>
            </div>
          </v-card>
          <div v-if="isLoadingCheque" class="spinner-overlay" />
        </div>
      </v-col>

      <!-- ساپ -->
      <v-col cols="12" md="6">
        <v-card color="grey-lighten-4" class="pa-4 text-start" rounded="sm" variant="outlined">
          <h3 class="text-4 text-secondary text-center mb-2">استعلام ساپ</h3>
          <div class="inquiry-result-container">
            <div v-if="isLoadingSap" class="text-center loading-container">
              <v-progress-circular indeterminate color="primary" />
              <div>در حال استعلام ساپ...</div>
            </div>
            <template v-else>
              <div><b>برچسب : </b> {{ sapData?.label || 'نامشخص' }}</div>
              <div><b>وثیقه : </b> {{ sapData?.collateral || 'نامشخص' }}</div>
              <div><b>مبلغ : </b> {{ sapData?.value?.toLocaleString() || 'نامشخص' }}</div>
            </template>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>


<style scoped>
.inquiry-result-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.inquiry-card-wrapper {
  position: relative;
  border-radius: 12px;
}
.loading-container{
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
}
</style>

