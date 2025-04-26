<script lang="ts" setup>
import { ref } from 'vue';
import { api } from '@/services/api';
import type { InquiryDto } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';

const approvalStore = useApprovalStore();
const value = ref(0);
const interval = ref<any | null>(null);
const isLoading = ref(false);
const responseStatus = ref<'idle' | 'success' | 'error' | 'empty'>('idle');
const data = ref<InquiryDto | null>(null);
const canSubmit = ref(false);

const getInquiry = async () => {
  value.value = 0;
  isLoading.value = true;
  responseStatus.value = 'idle';
  data.value = null;

  try {
    const res = await api.approval.getInquiry(approvalStore.getLoanRequestId);
    if (res.status === 200 && res.data) {
      data.value = res.data;
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
        <v-card class="pa-6" elevation="2" >
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

          <div v-else-if="responseStatus === 'idle'">
            <v-btn size="large" color="primary" @click="getInquiry">استعلام ساپ</v-btn>
          </div>

          <div v-else-if="responseStatus === 'success'">
            <v-alert type="success" class="mb-4" border="start" variant="tonal">
              اطلاعات با موفقیت دریافت شد.
            </v-alert>

            <v-card color="grey-lighten-4" class="pa-4 text-start" rounded="lg">
              <div class="mb-2">
                <strong>امتیاز مشتری:</strong> {{ data?.value }}
              </div>
              <div class="mb-2">
                <strong> رتبه:</strong> {{ data?.label }}
              </div>
              <div>
                <strong> وثایق مجاز:</strong> {{ data?.collateral }}
              </div>
            </v-card>
          </div>

          <div v-else-if="responseStatus === 'empty'">
            <v-alert type="warning" class="mt-4" border="start" variant="tonal">
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
