<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { api } from '@/services/api';
//utils
import { nationalCodeRule } from '@/validators/nationalCodeRule';
//type
import type { CustomerDto, FetchCustomerPayload } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';

type AllowedStatus = 'nationalCode' | 'cif';
const approvalStore = useApprovalStore();

const searchParam = ref<AllowedStatus>('cif');
const customerType = ref<'Real' | 'Legal'>('Real');
const searchString = ref('');
const customerTypes = ref<{ title: string; value: 'Real' | 'Legal' }[]>([
  { title: 'حقیقی', value: 'Real' },
  { title: 'حقوقی', value: 'Legal' }
]);
const errors = ref<{ nationalCode?: string[]; cif?: string[] }>({});
const loading = ref(false);
const error = ref<string | null>(null);
const showError = ref(false);
const items = ref<CustomerDto[]>([]);
const isValid = ref(false);

const headers = ref([
  { title: 'شماره مشتری', key: 'cif', width: 150 },
  { title: 'کدملی / شناسه ملی', align: 'center', key: 'nationalCode', width: 150 },
  { title: 'نام مشتری', key: 'customerName', width: 150 },
  { title: 'گروه مشتری', key: 'clientGroupName', width: 200 },
  { title: 'نام شعبه', key: 'branchName', width: 150 },
  { title: 'کدپستی', key: 'postalCode', width: 120 },
  { title: 'آدرس', key: 'address', width: 200 }
]);

const formData = ref({
  cif: '',
  nationalCode: ''
});

onMounted(() => {
  if (approvalStore.customerInfo) {
    items.value = [approvalStore.customerInfo];
    isValid.value = true;
  }
});

async function search() {
  approvalStore.resetAll();
  errors.value = {};
  isValid.value = false;
  
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
      items.value = [response.data];
      isValid.value = true;
    } else {
      error.value = `خطا: ${response.statusText}`;
      showError.value = true;
      isValid.value = false;
    }
  } catch (err: any) {
    error.value = err.message || 'خطای سرور.';
    showError.value = true;
    isValid.value = false;
  } finally {
    loading.value = false;
  }
}

const changePattern = () => {
  formData.value.cif = '';
  formData.value.nationalCode = '';
  error.value = null;
  showError.value = false;
  isValid.value = false;
  items.value = [];
};

const submitData = async () => {
  if (!isValid.value) {
    return Promise.reject('لطفاً ابتدا مشتری را جستجو کنید');
  }

  if (!items.value.length || !items.value[0]) {
    return Promise.reject('اطلاعات مشتری نامعتبر است');
  }

  const firstItem = items.value[0];
  if (!firstItem.cif && !firstItem.nationalCode) {
    return Promise.reject('اطلاعات مشتری نامعتبر است');
  }

  try {
    approvalStore.setCustomerInfo(firstItem);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err instanceof Error ? err.message : 'خطای ناشناخته');
  }
};

watch(
  () => approvalStore.customerInfo,
  (newVal) => {
    if (newVal) {
      items.value = [newVal];
      isValid.value = true;
    } else {
      items.value = [];
      isValid.value = false;
    }
  },
  { immediate: true }
);

defineExpose({ submitData });
</script>

<template>
  <v-card variant="flat" class="customer-section">
    <form @submit.prevent="submitData">
      <v-row class="mt-2">
        <v-col cols="12" md="12">
          <v-radio-group 
            inline 
            v-model="searchParam" 
            class="radioBtnContainer" 
            @change="changePattern"
            :disabled="loading"
          >
            <v-radio label="شماره مشتری" value="cif"></v-radio>
            <v-radio label="کدملی" value="nationalCode"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-divider inset></v-divider>
      <v-row class="mt-2">
        <v-col cols="12" md="3" v-if="searchParam === 'nationalCode'">
          <v-select 
            v-model="customerType" 
            label="نوع مشتری" 
            variant="outlined" 
            density="comfortable" 
            :items="customerTypes"
            :disabled="loading"
          />
        </v-col>
        <v-col v-if="searchParam === 'cif'" cols="12" md="3">
          <v-text-field 
            v-model="formData.cif" 
            label="شماره مشتری" 
            variant="outlined" 
            density="comfortable"
            :disabled="loading"
            :error-messages="errors.cif"
          />
        </v-col>
        <v-col v-if="searchParam === 'nationalCode'" cols="12" md="3">
          <v-text-field
            v-model="formData.nationalCode"
            :label="customerType === 'Real' ? 'کد ملی' : 'شناسه ملی'"
            variant="outlined"
            density="comfortable"
            type="number"
            v-digit-limit="11"
            :error-messages="errors.nationalCode"
            :disabled="loading"
          />
        </v-col>
        <v-col cols="12" md="12" class="text-center">
          <v-btn 
            color="secondary" 
            @click="search" 
            type="button"
            :loading="loading"
            :disabled="loading"
          >
            جستجو
          </v-btn>
        </v-col>

        <v-divider inset></v-divider>

        <v-col cols="12" md="12">
          <v-data-table-virtual
            v-model:search="searchString"
            :items="items"
            :headers="headers"
            no-data-text="رکوردی یافت نشد"
            :loading="loading"
            class="customer-table"
          ></v-data-table-virtual>
        </v-col>
      </v-row>
      <v-snackbar v-model="showError" color="error" timeout="5500">
        {{ error }}
      </v-snackbar>
    </form>
  </v-card>
</template>

<style lang="scss" scoped>
.customer-section {
  .radioBtnContainer {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .customer-table {
    margin-top: 1rem;
  }
}

@media (forced-colors: active) {
  .v-card {
    forced-color-adjust: none;
  }

  .v-btn {
    forced-color-adjust: none;
  }

  .v-text-field {
    forced-color-adjust: none;
  }
}
</style>
