<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { api } from '@/services/api';
//utils
import { DateConverter } from '@/utils/date-convertor';
import { nationalCodeRule } from '@/validators/nationalCodeRule';

//type
import type { CustomerDto, FetchCustomerPayload } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';

type AllowedStatus = 'nationalCode' | 'cif';
const approvalStore = useApprovalStore();
const searchParam = ref<AllowedStatus>('cif');
const customerType = ref<'Real' | 'Legal'>('Real');
const customerTypes = ref<{ title: string; value: 'Real' | 'Legal' }[]>([
  { title: 'حقیقی', value: 'Real' },
  { title: 'حقوقی', value: 'Legal' }
]);
const errors = ref<{ nationalCode?: string[] }>({});
const nationalCode = ref('');
const nationalCodeErrors = ref([]);
const loading = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const showError = ref(false);
const dataTableRef = ref();
const headers = ref([
  { title: 'شماره مشتری', key: 'cif', width: 150 },
  { title: 'کدملی / شناسه ملی', align: 'center', key: 'nationalCode', width: 150 },
  { title: 'نام مشتری', key: 'customerName', width: 150 },
  { title: 'گروه مشتری', key: 'clientgroupname', width: 200 },
  { title: 'نام شعبه', key: 'branchName', width: 150 },
  { title: 'کدپستی', key: 'postalCode', width: 120 },
  { title: 'آدرس', key: 'address', width: 200 }
]);
// initial data
const formData = ref({
  cif: '',
  nationalCode: ''
});

watch(
  () => approvalStore.loanRequestId,
  async (newLoanRequestId) => {
    if (newLoanRequestId) {
      await dataTableRef.value?.fetchData({ loanRequestId: newLoanRequestId });
    }
  }
);

onMounted(async () => {
  if (approvalStore.loanRequestId) {
    await dataTableRef.value?.fetchData({ loanRequestId: approvalStore.loanRequestId });
  }
});

// get customer
async function search() {
  errors.value = {}; // Clear previous errors
  if (searchParam.value === 'nationalCode') {
    const result = nationalCodeRule(formData.value.nationalCode, customerType.value);
    if (result !== false) {
      errors.value.nationalCode = [result];
      error.value = 'کد ملی نامعتبر است';
      showError.value = true;
      return;
    }
  }
  if (searchParam.value === 'cif' && !formData.value.cif) {
    error.value = 'شماره مشتری الزامی است';
    showError.value = true;
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const payload: FetchCustomerPayload = {
      cif: formData.value.cif || null,
      nationalCode: formData.value.nationalCode || null,
    };

    const response = await api.approval.fetchCustomer(payload);

    if (response.status === 200 && response.data) {
      const newLoanRequestId = response.data.id;
      approvalStore.SET_LOAN_REQUEST_ID(newLoanRequestId);
      canSubmit.value = true;
    } else {
      error.value = `خطا: ${response.statusText}`;
      showError.value = true;
    }
  } catch (err: any) {
    error.value = err.message || 'خطای سرور.';
    showError.value = true;
    canSubmit.value = false;
  } finally {
    loading.value = false;
  }
}

// check validation
const isFormValid = computed(() => {
  return formData.value.nationalCode?.length >= 10 || formData.value.cif !== null;
});
// change search pattern
const changePattern = async () => {
  try {
    formData.value.cif = '';
    formData.value.nationalCode = '';
    error.value = null;
    showError.value = false;
  } catch (err) {
    error.value = 'خطا در تغییر الگوی جستجو';
    showError.value = true;
  }
};
// submit form
const submitData = async () => {
  try {
    if (approvalStore.loanRequestId === '') {
      return Promise.reject('ابتدا مشتری مورد نظر را انتخاب کنید');
    }
    
    const tableData = dataTableRef.value?.items;
    if (!tableData || tableData.length === 0) {
      return Promise.reject('اطلاعات مشتری یافت نشد');
    }
    
    return Promise.resolve();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'خطای ناشناخته';
    showError.value = true;
    return Promise.reject(error.value);
  }
};

defineExpose({ submitData });
</script>

<template>
  <v-card variant="flat">
    <form @submit.prevent="submitData">
      <v-row class="mt-2">
        <v-col cols="12" md="12">
          <v-radio-group inline v-model="searchParam" class="radioBtnContainer" @change="changePattern">
            <v-radio label="شماره مشتری" value="cif"></v-radio>
            <v-radio label="کدملی" value="nationalCode"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-divider inset></v-divider>
      <v-row class="mt-2">
        <v-col cols="12" md="6">
          <v-select v-model="customerType" label="نوع مشتری" variant="outlined" density="comfortable" :items="customerTypes" />
        </v-col>
        <!-- Cif Code Input -->
        <v-col v-if="searchParam === 'cif'" cols="12" md="6">
          <v-text-field v-model="formData.cif" label="شماره مشتری" variant="outlined" density="comfortable" />
        </v-col>
        <!-- National Code Input -->
        <v-col v-if="searchParam === 'nationalCode'" cols="12" md="6">
          <v-text-field
            v-model="formData.nationalCode"
            label="کد ملی"
            variant="outlined"
            density="comfortable"
            :error-messages="nationalCodeErrors"
          />
        </v-col>
        <!-- Person Type Select -->
        <v-col cols="12" md="12" class="text-center">
          <v-btn color="secondary" @click="search" type="primary"> جستجو</v-btn>
        </v-col>

        <v-divider inset></v-divider>

        <v-col cols="12" md="12">
          <CustomDataTable
            ref="dataTableRef"
            :api-resource="'customer-info'"
            :headers="headers"
            :actions="['delete']"
            :query-params="{ loanRequestId: approvalStore.loanRequestId }"
            :show-pagination="false"
            :auto-fetch="false"
          />
        </v-col>
      </v-row>
      <v-snackbar v-model="showError" color="error" timeout="5500">
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
