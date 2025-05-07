<script lang="ts" setup>
import { computed, ref } from 'vue';
import { api } from '@/services/api';
//utils
import { DateConverter } from '@/utils/date-convertor';
import { nationalCodeRule } from '@/validators/nationalCodeRule';

//type
import type { CustomerDto, FetchCustomerPayload, SummaryDto } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';

type AllowedStatus = 'nationalCode' | 'cif';
const approvalStore = useApprovalStore();
const searchParam = ref<AllowedStatus>('cif');
const errors = ref<{ nationalCode?: string[] }>({});
const nationalCode = ref('');
const nationalCodeErrors = ref([]);
// const customers = ref<CustomerDto>([]);
const loading = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const data = ref(<CustomerDto[]>[]);
const headers = ref([
  { title: 'خلاصه درخواست', align: 'center', key: 'cif', width: '150px' },
  { title: 'نوع فعالیت', align: 'center', key: 'nationalCode', width: '150px' },
  { title: 'توضیحات', align: 'center', key: 'customerName', width: '150px' },
]);
// initial data
const formData = ref({
  summary: '',
  activityType: '',
  description: ''
});
// add request
async function addRequest() {
  errors.value = {}; // Clear previous errors
  loading.value = true;
  error.value = null;
  try {
    const payload: SummaryDto = {
      id: approvalStore.getLoanRequestId,
      summary: formData.value.summary,
      activityType: formData.value.activityType,
      description: formData.value.description
    };

    const response = await api.approval.fetchSummary(payload);

    if (response.status === 200 && response.data) {
      canSubmit.value = true;
    } else {
      error.value = `خطا: ${response.statusText}`;
    }
  } catch (err: any) {
    error.value = err.message || 'خطای سرور.';
    canSubmit.value = false;
  } finally {
    loading.value = false;
  }
}

// submit form
const submitData = async () => {
  await addRequest();
  if (canSubmit.value === false) {
    return Promise.reject('ابتدا مشتری مورد نظر را انتخاب کنید');
  } else return Promise.resolve();
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
