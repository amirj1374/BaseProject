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

const getInquiry = async () => {
  value.value = 0;
  isLoading.value = true;
  responseStatus.value = 'idle';
  chequeData.value = null;
  sapData.value = null;

  try {
    if (!approvalStore.loanRequestId) {
      throw new Error('شناسه درخواست نامعتبر است');
    }

    // Cheque inquiry request
    const chequeRes = await api.approval.getIndirectObligation(approvalStore.loanRequestId);
    
    // SAP inquiry request
    const sapRes = await api.approval.getSapInquiry({
      loanRequestId: approvalStore.loanRequestId,
      nationalCode: approvalStore.customerInfo.nationalCode
    });

    if (chequeRes.status === 200 && sapRes.status === 200) {
      chequeData.value = chequeRes.data;
      sapData.value = sapRes.data;
      responseStatus.value = 'success';
    } else {
      responseStatus.value = 'empty';
    }
  } catch (err) {
    responseStatus.value = 'error';
  }

  interval.value = setInterval(() => {
    if (value.value >= 100) {
      clearInterval(interval.value!);
      isLoading.value = false;
      canSubmit.value = true;
    } else {
      value.value += 10;
    }
  }, 100);
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
                  <div class="text-subtitle-1 mb-2">استعلام چک</div>
                  <pre class="text-body-2">{{ JSON.stringify(chequeData, null, 2) }}</pre>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card color="grey-lighten-4" class="pa-4 text-start" rounded="lg">
                  <div class="text-subtitle-1 mb-2">استعلام ساپ</div>
                  <pre class="text-body-2">{{ JSON.stringify(sapData, null, 2) }}</pre>
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
</style>
