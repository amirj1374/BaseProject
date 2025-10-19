<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
//type
import { useApprovalStore } from '@/stores/approval';

const approvalStore = useApprovalStore();
const error = ref<string | null>(null);
const showError = ref(false);

// Watch for error changes
watch(error, (newError) => {
  showError.value = !!newError;
});
// initial data
const formData = ref({
  summary: '',
  activityType: '',
  description: ''
});
onMounted(async () => {
  formData.value = {
    summary: approvalStore.loanRequestDetailList?.summaryRequest.summary || '',
    activityType: approvalStore.loanRequestDetailList?.summaryRequest.activityType || '',
    description: approvalStore.loanRequestDetailList?.summaryRequest.description || ''
  };
});

// submit form
const submitData = async () => {
  approvalStore.updateSummaryRequest({
    summary: formData.value.summary,
    activityType: formData.value.activityType,
    description: formData.value.description
  });
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
            rows="3"
          />
        </v-col>
        <v-divider inset></v-divider>
      </v-row>
      <v-snackbar v-if="error" v-model="showError" color="error" timeout="5500">
        {{ error }}
      </v-snackbar>
    </form>
  </v-card>
</template>
