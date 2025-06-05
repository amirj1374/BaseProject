<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { api } from '@/services/api';
//utils
import { nationalCodeRule } from '@/validators/nationalCodeRule';
//type
import type { CustomerDto, FetchCustomerPayload } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
import { IconTrash } from '@tabler/icons-vue';
import Facilities from './Facilities.vue';
import LetterOfCredit from './LetterOfCredit.vue';
import Guarantee from './Guarantee.vue';

type AllowedStatus = 'nationalCode' | 'cif';
const approvalStore = useApprovalStore();

// Tab Management
const activeTab = ref('search');

// Search Section State
const searchParam = ref<AllowedStatus>('cif');
const customerType = ref<'Real' | 'Legal'>('Real');
const searchString = ref('');
const customerTypes = ref<{ title: string; value: 'Real' | 'Legal' }[]>([
  { title: 'حقیقی', value: 'Real' },
  { title: 'حقوقی', value: 'Legal' }
]);
const searchTypes = ref<{ title: string; value: AllowedStatus }[]>([
  { title: 'شماره مشتری', value: 'cif' },
  { title: 'کدملی', value: 'nationalCode' }
]);
const errors = ref<{ nationalCode?: string[]; cif?: string[] }>({});
const loading = ref(false);
const error = ref<string | null>(null);
const showError = ref(false);
const items = ref<CustomerDto[]>([]);
const isValid = ref(false);

// Data Entry Section State
const formData = ref({
  cif: '',
  nationalCode: '',
  description: ''
});

const headers = ref([
  { title: 'شماره مشتری', key: 'cif', width: '200px' },
  { title: 'کدملی / شناسه ملی', align: 'center', key: 'nationalCode', width: '250px' },
  { title: 'نام مشتری', key: 'customerName', width: '160px' },
  { title: 'گروه مشتری', key: 'clientGroupName', width: '140px' },
  { title: 'نام شعبه', key: 'branchName', width: '140px' },
  { title: 'کدپستی', key: 'postalCode', width: '120px' },
  { title: 'آدرس', key: 'address', width: '200px' },
  { title: 'عملیات', key: 'actions', align: 'center', width: '100px' }
]);

const dataTableRef = ref();

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
      nationalCode: formData.value.nationalCode || null
    };

    const response = await api.approval.fetchCustomer(payload);

    if (response.status === 200 && response.data) {
      items.value = [response.data];
      isValid.value = true;
    } else {
      error.value = `خطا: ${response.statusText}`;
      showError.value = true;
    }
  } catch (err: any) {
    error.value = err.message || 'خطای سرور.';
    showError.value = true;
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
  if (!items.value.length || !items.value[0]) {
    error.value = 'هیچ مشتری‌ای یافت نشد. لطفاً جستجو کنید.';
    showError.value = true;
    return Promise.reject(error.value);
  }
  const firstItem = items.value[0];
  if (!firstItem.cif && !firstItem.nationalCode) {
    error.value = 'اطلاعات مشتری نامعتبر است';
    showError.value = true;
    return Promise.reject(error.value);
  }
  try {
    approvalStore.setCustomerInfo(firstItem);
    return Promise.resolve();
  } catch (err) {
    error.value = 'خطای ناشناخته در ثبت اطلاعات مشتری';
    showError.value = true;
    return Promise.reject(error.value);
  }
};

const deleteCustomer = () => {
  items.value = [];
  approvalStore.resetAll();
};

watch(
  () => approvalStore.customerInfo,
  (newVal) => {
    if (newVal && (newVal.cif || newVal.nationalCode)) {
      items.value = [newVal];
      isValid.value = true;
    } else {
      items.value = [];
      isValid.value = false;
    }
  },
  { immediate: true }
);

function handleSaveFacility(data: any) {
  // Handle saving facility data
  console.log('Saving facility:', data);
}

function handleDeleteFacility(item: any) {
  // Handle deleting facility
  console.log('Deleting facility:', item);
}

function handleSaveLC(data: any) {
  // Handle saving LC data
  console.log('Saving LC:', data);
}

function handleDeleteLC(item: any) {
  // Handle deleting LC
  console.log('Deleting LC:', item);
}

function handleSaveGuarantee(data: any) {
  // Handle saving guarantee data
  console.log('Saving guarantee:', data);
}

function handleDeleteGuarantee(item: any) {
  // Handle deleting guarantee
  console.log('Deleting guarantee:', item);
}

defineExpose({ submitData });
</script>

<template>
  <div class="customer-section">
    <h3 class="group-title">انتخاب مشتری</h3>
    <!-- Search Section -->
    <form @submit.prevent="search" class="customer-form">
      <v-row class="mt-2">
        <v-col cols="12" md="3">
          <v-select
            v-model="searchParam"
            :items="searchTypes"
            label="نوع جستجو"
            variant="outlined"
            density="comfortable"
            :disabled="loading"
            @update:model-value="changePattern"
          />
        </v-col>
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
        <v-col cols="12" md="12" class="customer-search-btn">
          <v-btn color="secondary" @click="search" type="button" :loading="loading" :disabled="loading"> جستجو </v-btn>
        </v-col>
        <v-col cols="12" md="12">
          <v-data-table-virtual
            v-model:search="searchString"
            :items="items"
            :headers="headers"
            no-data-text="رکوردی یافت نشد"
            :loading="loading"
            density="comfortable"
            hover
            hide-default-footer
            class="customer-table elevation-1"
            ref="dataTableRef"
          >
            <template #item.actions>
              <v-btn variant="text" color="error" @click="deleteCustomer()">
                <IconTrash size="20" />
              </v-btn>
            </template>
          </v-data-table-virtual>
        </v-col>
      </v-row>
    </form>
  </div>

  <div class="customer-section">
    <h3 class="group-title">درخواست مشتری</h3>
    <Facilities
      :loading="loading"
      @save="handleSaveFacility"
      @delete="handleDeleteFacility"
    />
  </div>

  <div class="customer-section">
    <LetterOfCredit
      :loading="loading"
      @save="handleSaveLC"
      @delete="handleDeleteLC"
    />
  </div>

  <div class="customer-section">
    <Guarantee
      :loading="loading"
      @save="handleSaveGuarantee"
      @delete="handleDeleteGuarantee"
    />
  </div>

  <v-snackbar v-model="showError" color="error" timeout="5500">
    {{ error }}
  </v-snackbar>
</template>

<style lang="scss" scoped>
.customer-section {
  background-color: #fff;
  border-radius: 10px;
  padding: 25px 15px;
  margin-bottom: 10px;
  width: 100%;
  max-width: 100%;

  .group-title {
    font-size: 1.7rem;
    font-weight: 800;
    color: var(--v-theme-primary);
    border-right: 6px solid var(--v-theme-primary);
    padding-right: 18px;
    margin-bottom: 2.5rem;
    background: linear-gradient(90deg, #f5f7fa 0%, #E2EAEA 100%);
    border-radius: 8px;
    display: inline-block;
    line-height: 1.2;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .section-content {
    min-height: 300px;
  }

  .customer-table {
    width: 100%;
    max-width: 100%;
    border-radius: 10px;
    padding: 15px;

    // Set background color for the entire header row
    :deep(.v-data-table-header) {
      background-color: var(--v-theme-secondary);
      color: #fff;
    }
    :deep(.v-data-table-header th) {
      background-color: var(--v-theme-secondary) !important;
      color: #fff;
    }
    :deep(.v-data-table-header tr) {
      background-color: var(--v-theme-secondary) !important;
      color: #fff;
    }
  }
}

.customer-search-btn {
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (forced-colors: active) {
  .v-btn {
    forced-color-adjust: none;
  }

  .v-text-field {
    forced-color-adjust: none;
  }
}

.v-data-table :deep(th) {
  background-color: #f5f5f5 !important;
  font-weight: 600;
}
</style>
