<script lang="ts" setup>
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import { ref, onMounted } from 'vue';

const approvalStore = useApprovalStore();
const value = ref(0);
const interval = ref<any | null>(null);
const isLoading = ref(false);
const responseStatus = ref<'idle' | 'success' | 'error' | 'empty'>('idle');
const chequeData = ref<any>(null);
const sapData = ref<any>(null);
const canSubmit = ref(false);
const chequeLoading = ref(false);
const chequeError = ref<string | null>(null);
const sapLoading = ref(false);
const sapError = ref<string | null>(null);

const getInquiry = async () => {
  chequeData.value = null;
  sapData.value = null;
  chequeError.value = null;
  sapError.value = null;
  chequeLoading.value = true;
  sapLoading.value = true;
  canSubmit.value = false;

  // SAP inquiry first
  try {
    const sapRes = await api.approval.getSapInquiry({
      loanRequestId: approvalStore.loanRequestId,
      nationalCode: approvalStore.customerInfo.nationalCode
    });
    if (sapRes.status === 200) {
      sapData.value = sapRes.data;
    } else {
      sapError.value = 'دریافت اطلاعات ساپ با خطا مواجه شد.';
    }
  } catch {
    sapError.value = 'دریافت اطلاعات ساپ با خطا مواجه شد.';
  } finally {
    sapLoading.value = false;
    // Always proceed to Cheque inquiry, even if SAP fails
    try {
      const chequeRes = await api.approval.getIndirectObligation(approvalStore.loanRequestId);
      if (chequeRes.status === 200) {
        chequeData.value = chequeRes.data;
      } else {
        chequeError.value = 'دریافت اطلاعات چک با خطا مواجه شد.';
      }
    } catch {
      chequeError.value = 'دریافت اطلاعات چک با خطا مواجه شد.';
    } finally {
      chequeLoading.value = false;
    }
  }

  canSubmit.value = !!chequeData.value || !!sapData.value;
};

onMounted(() => {
  getInquiry();
});

const submitData = async () => {
  if (canSubmit.value === false) {
    return Promise.reject("ابتدا استعلام های خود را انجام دهید");
  } else return Promise.resolve();
};

defineExpose({ submitData });
</script>

<template>
  <v-container class="py-10" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6" class="text-center">
        <v-card class="pa-6" elevation="2">
          <div v-if="isLoading">
            <v-progress-circular
              :model-value="value"
              :rotate="360"
              :size="100"
              :width="10"
              color="primary"
              class="mb-4"
            >
              {{ value }}%
            </v-progress-circular>
            <div>در حال استعلام اطلاعات...</div>
          </div>

          <div v-else-if="responseStatus === 'success'">
            <v-alert type="success" class="mb-4" border="start" variant="tonal">
              اطلاعات با موفقیت دریافت شد.
            </v-alert>

            <v-row>
              <v-col cols="12" md="6">
                <v-card color="grey-lighten-4" class="pa-4 text-start" rounded="lg">
                  <div class="text-subtitle-1 mb-4 font-weight-bold">استعلام چک</div>
                  <div v-if="chequeLoading">در حال دریافت اطلاعات چک...</div>
                  <div v-else-if="chequeError">
                    <v-alert type="error" class="my-2">{{ chequeError }}</v-alert>
                  </div>
                  <div v-else-if="chequeData">
                    <div class="inquiry-section">
                      <div class="inquiry-item">
                        <div class="inquiry-label">اطلاعات چک</div>
                        <div class="inquiry-value">{{ chequeData?.chequeInfo || 'نامشخص' }}</div>
                      </div>
                      <div class="inquiry-item">
                        <div class="inquiry-label">وضعیت</div>
                        <div class="inquiry-value">{{ chequeData?.status || 'نامشخص' }}</div>
                      </div>
                      <div class="inquiry-item">
                        <div class="inquiry-label">تاریخ</div>
                        <div class="inquiry-value">{{ chequeData?.date || 'نامشخص' }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <v-alert type="warning" class="my-2">داده‌ای برای چک یافت نشد.</v-alert>
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card color="grey-lighten-4" class="pa-4 text-start" rounded="lg">
                  <div class="text-subtitle-1 mb-4 font-weight-bold">استعلام ساپ</div>
                  <div v-if="sapLoading">در حال دریافت اطلاعات ساپ...</div>
                  <div v-else-if="sapError">
                    <v-alert type="error" class="my-2">{{ sapError }}</v-alert>
                  </div>
                  <div v-else-if="sapData">
                    <div class="inquiry-section">
                      <div class="inquiry-item">
                        <div class="inquiry-label">تاریخ تغییر</div>
                        <div class="inquiry-value">{{ sapData?.changeDate || 'نامشخص' }}</div>
                      </div>
                      <div class="inquiry-item">
                        <div class="inquiry-label">وثیقه</div>
                        <div class="inquiry-value">{{ sapData?.collateral || 'نامشخص' }}</div>
                      </div>
                      <div class="inquiry-item">
                        <div class="inquiry-label">تاریخ ایجاد</div>
                        <div class="inquiry-value">{{ sapData?.createdAt || 'نامشخص' }}</div>
                      </div>
                      <div class="inquiry-item">
                        <div class="inquiry-label">برچسب</div>
                        <div class="inquiry-value">{{ sapData?.label || 'نامشخص' }}</div>
                      </div>
                      <div class="inquiry-item">
                        <div class="inquiry-label">مبلغ</div>
                        <div class="inquiry-value">{{ sapData?.value?.toLocaleString() || 'نامشخص' }} ریال</div>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <v-alert type="warning" class="my-2">داده‌ای برای ساپ یافت نشد.</v-alert>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <div v-else-if="responseStatus === 'empty'">
            <v-alert type="warning" class="mt-4" variant="tonal">
              داده‌ای یافت نشد.
            </v-alert>
          </div>

          <div v-else-if="responseStatus === 'error'">
            <v-alert type="error" class="mt-4" border="start" variant="tonal">
              خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.
            </v-alert>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
}

.inquiry-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.inquiry-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.inquiry-label {
  color: #666;
  font-size: 0.875rem;
}

.inquiry-value {
  color: #333;
  font-weight: 500;
  font-size: 1rem;
}
</style>
