<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import { IconAlertCircle } from '@tabler/icons-vue';

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

// Individual retry functions for each inquiry type
const retryChequeInquiry = async () => {
  isLoadingCheque.value = true;
  try {
    const res = await api.approval.getInquiryCheque(approvalStore.loanRequestId);
    chequeData.value = res.data;
  } catch (error) {
    console.error('Error retrying cheque inquiry:', error);
  } finally {
    isLoadingCheque.value = false;
  }
};

const retryIndirectInquiry = async () => {
  isLoadingIndirect.value = true;
  try {
    const res = await api.approval.getIndirectObligation(approvalStore.loanRequestId);
    IndirectObligationData.value = res.data;
  } catch (error) {
    console.error('Error retrying indirect inquiry:', error);
  } finally {
    isLoadingIndirect.value = false;
  }
};

const retryDirectInquiry = async () => {
  isLoadingDirect.value = true;
  try {
    const res = await api.approval.getDirectObligation(approvalStore.loanRequestId);
    DirectObligationData.value = res.data;
  } catch (error) {
    console.error('Error retrying direct inquiry:', error);
  } finally {
    isLoadingDirect.value = false;
  }
};

const retrySapInquiry = async () => {
  isLoadingSap.value = true;
  try {
    const res = await api.approval.getSapInquiry({
      loanRequestId: approvalStore.loanRequestId,
      nationalCode: approvalStore.customerInfo.nationalCode
    });
    sapData.value = res.data;
  } catch (error) {
    console.error('Error retrying SAP inquiry:', error);
  } finally {
    isLoadingSap.value = false;
  }
};

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
      new Error('شناسه درخواست نامعتبر است');
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
    <h4 class="group-title">استعلام</h4>
    
    <!-- Global retry button -->
    <div class="mb-4 text-center">
      <v-btn 
        color="secondary"
        variant="tonal" 
        @click="getInquiry"
        :loading="isLoadingCheque || isLoadingIndirect || isLoadingDirect || isLoadingSap"
        class="me-2"
      >
        🔄 استعلام مجدد همه
      </v-btn>
    </div>

    <v-row justify="center">
      <!-- تعهدات مستقیم -->
      <v-col cols="12" md="6">
        <v-card color="grey-lighten-4" class="pa-4 text-start" rounded="sm" variant="outlined">
          <div class="d-flex justify-space-between align-center mb-2">
            <h3 class="text-4 text-secondary text-center">استعلام تعهدات مستقیم</h3>
            <v-btn 
              v-if="!isLoadingDirect"
              color="secondary" 
              size="small" 
              variant="tonal"
              @click="retryDirectInquiry"
              :loading="isLoadingDirect"
            >
              🔄 تلاش مجدد
            </v-btn>
          </div>
          <div class="inquiry-result-container">
            <div v-if="isLoadingDirect" class="text-center loading-container">
              <v-progress-circular indeterminate color="secondary" />
              <div>در حال استعلام تعهدات مستقیم...</div>
            </div>
            <template v-else-if="DirectObligationData">
              <div><b>مبلغ کل : </b> {{ DirectObligationData?.totalAmount }}</div>
            </template>
            <template v-else>
              <div class="text-center text-error">
                <IconAlertCircle color="error" class="mb-2" size="24" />
                <div>خطا در دریافت اطلاعات</div>
              </div>
            </template>
          </div>
        </v-card>
      </v-col>

      <!-- تعهدات غیر مستقیم -->
      <v-col cols="12" md="6">
        <v-card color="grey-lighten-4" class="pa-4 text-start" rounded="sm" variant="outlined">
          <div class="d-flex justify-space-between align-center mb-2">
            <h3 class="text-4 text-secondary text-center">استعلام تعهدات غیر مستقیم</h3>
            <v-btn 
              v-if="!isLoadingIndirect"
              color="secondary" 
              size="small" 
              variant="tonal"
              @click="retryIndirectInquiry"
              :loading="isLoadingIndirect"
            >
              🔄 تلاش مجدد
            </v-btn>
          </div>
          <div class="inquiry-result-container">
            <div v-if="isLoadingIndirect" class="text-center loading-container">
              <v-progress-circular indeterminate color="secondary" />
              <div>در حال استعلام تعهدات غیر مستقیم...</div>
            </div>
            <template v-else-if="IndirectObligationData">
              <div><b>نام : </b> {{ IndirectObligationData?.allOfThem || 'نامشخص' }}</div>
              <div><b>مبلغ کل : </b> {{ IndirectObligationData?.totalAmount || 'نامشخص' }}</div>
            </template>
            <template v-else>
              <div class="text-center text-error">
                <IconAlertCircle color="error" class="mb-2" size="24" />
                <div>خطا در دریافت اطلاعات</div>
              </div>
            </template>
          </div>
        </v-card>
      </v-col>

      <!-- چک‌های برگشتی با انیمیشن چرخشی -->
      <v-col cols="12" md="6">
        <div class="inquiry-card-wrapper">
          <v-card color="grey-lighten-4" class="pa-4 text-start mb-4" rounded="sm" variant="outlined">
            <div class="d-flex justify-space-between align-center mb-2">
              <h3 class="text-4 text-secondary text-center">استعلام چک های برگشتی</h3>
              <v-btn 
                v-if="!isLoadingCheque"
                color="secondary" 
                size="small" 
                variant="tonal"
                @click="retryChequeInquiry"
                :loading="isLoadingCheque"
              >
                🔄 تلاش مجدد
              </v-btn>
            </div>
            <div class="inquiry-result-container">
              <div v-if="isLoadingCheque" class="text-center loading-container">
                <v-progress-circular indeterminate color="secondary" />
                <div>در حال استعلام چک های برگشتی...</div>
              </div>
              <template v-else-if="chequeData">
                <div><b>چک برگشتی دارد؟ </b> {{ chequeData?.bouncedCheque || 'ندارد' }}</div>
                <div><b>تعداد : </b> {{ chequeData?.count || '0' }}</div>
                <div><b>مبلغ کل : </b> {{ chequeData?.amount || '0' }}</div>
              </template>
              <template v-else>
                <div class="text-center text-error">
                  <IconAlertCircle color="error" class="mb-2" size="24" />
                  <div>خطا در دریافت اطلاعات</div>
                </div>
              </template>
            </div>
          </v-card>
          <div v-if="isLoadingCheque" class="spinner-overlay" />
        </div>
      </v-col>

      <!-- ساپ -->
      <v-col cols="12" md="6">
        <v-card color="grey-lighten-4" class="pa-4 text-start" rounded="sm" variant="outlined">
          <div class="d-flex justify-space-between align-center mb-2">
            <h3 class="text-4 text-secondary text-center">استعلام ساپ</h3>
            <v-btn 
              v-if="!isLoadingSap"
              color="secondary" 
              size="small" 
              variant="tonal"
              @click="retrySapInquiry"
              :loading="isLoadingSap"
            >
              🔄 تلاش مجدد
            </v-btn>
          </div>
          <div class="inquiry-result-container">
            <div v-if="isLoadingSap" class="text-center loading-container">
              <v-progress-circular indeterminate color="secondary" />
              <div>در حال استعلام ساپ...</div>
            </div>
            <template v-else-if="sapData">
              <div><b>برچسب : </b> {{ sapData?.label || 'نامشخص' }}</div>
              <div><b>وثیقه : </b> {{ sapData?.collateral || 'نامشخص' }}</div>
              <div><b>مبلغ : </b> {{ sapData?.value?.toLocaleString() || 'نامشخص' }}</div>
            </template>
            <template v-else>
              <div class="text-center text-error">
                <IconAlertCircle color="error" class="mb-2" size="24" />
                <div>خطا در دریافت اطلاعات</div>
              </div>
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

