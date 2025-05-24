<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { api } from '@/services/api';
//type
import type { CustomerDto, SummaryDto } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';

type AllowedStatus = 'nationalCode' | 'cif';
const approvalStore = useApprovalStore();
const errors = ref<{ nationalCode?: string[] }>({});
const loading = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
// initial data
const formData = ref({
  summary: '',
  activityType: '',
  description: ''
});
onMounted(async () => {
  formData.value = {
    summary: approvalStore.summaryRequest.summary || '',
    activityType: approvalStore.summaryRequest.activityType || '',
    description: approvalStore.summaryRequest.description || ''
  };
});

// submit form
const submitData = async () => {
  approvalStore.setSummaryRequest(formData.value);
  return Promise.resolve();
};

defineExpose({ submitData });
</script>

<template>
  <v-card variant="flat">
    <form @submit.prevent="submitData">
      <v-divider inset></v-divider>
      <v-row class="mt-2">
        <!-- Cif Code Input -->
        <v-col cols="12" md="6">
          <v-text-field 
          v-model="formData.summary" 
          label="خلاصه درخواست" 
          variant="outlined" 
          density="comfortable" />
        </v-col>
        <!-- National Code Input -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.activityType"
            label="نوع فعالیت"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="12">
          <v-textarea
            v-model="formData.description"
            label="توضیحات"
            variant="outlined"
            density="comfortable"
            rows="2"
          />
        </v-col>
        <v-divider inset></v-divider>
      </v-row>
      <v-snackbar v-if="error" v-model="error" color="error" timeout="5500">
        {{ error }}
      </v-snackbar>
    </form>
  </v-card>
</template>

<style scoped>
.table-scroll {
  overflow-x: auto;
  max-width: 100%;
}

.error {
  color: red;
  margin-top: 0.5em;
}

.radioBtnContainer {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
