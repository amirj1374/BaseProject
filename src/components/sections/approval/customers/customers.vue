<script lang="ts" setup>
import { onMounted, ref, watch, defineAsyncComponent, computed } from 'vue';
import { api } from '@/services/api';
import { useDebounceFn } from '@vueuse/core';
//utils
import { nationalCodeRule } from '@/validators/nationalCodeRule';
//type
import type { CustomerDto, FetchCustomerPayload, Facility, Guarantee, Lc, GreenLicense } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
import { IconTrash } from '@tabler/icons-vue';
import { useCustomizerStore } from '@/stores/customizer';
import envConfig from '@/config/envConfig';
// Use dynamic imports for heavy components
const Facilities = defineAsyncComponent(() => import('./Facilities.vue'));
const LetterOfCredit = defineAsyncComponent(() => import('./LetterOfCredit.vue'));
const Guarantee = defineAsyncComponent(() => import('./Guarantee.vue'));
const GreenLicense = defineAsyncComponent(() => import('./GreenLicense.vue'));

type AllowedStatus = 'nationalCode' | 'cif';
const approvalStore = useApprovalStore();
const customizerStore = useCustomizerStore();

// Environment detection
const isLiveEnvironment = computed(() => {
  return envConfig.ENVIRONMENT === 'live';
});

// Tab Management
const activeTab = ref('facilities');

// Available tabs based on environment
const availableTabs = computed(() => {
  if (isLiveEnvironment.value) {
    return [{ value: 'facilities', label: 'تسهیلات' }];
  }
  return [
    { value: 'facilities', label: 'تسهیلات' },
    { value: 'guarantee', label: 'ضمانت‌نامه' },
    { value: 'lc', label: 'اعتبار اسنادی' },
    { value: 'greenLicense', label: 'تضامین جواز سبز' }
  ];
});

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
  { title: 'کد مشتری', key: 'cif', width: '200px', sortable: true },
  { title: 'کدملی / شناسه ملی', align: 'center' as const, key: 'nationalCode', width: '250px', sortable: true },
  { title: 'نام مشتری', key: 'customerName', width: '160px', sortable: true },
  { title: 'گروه مشتری', key: 'clientGroupName', width: '140px', sortable: true },
  { title: 'نام شعبه', key: 'branchName', width: '140px', sortable: true },
  { title: 'کدپستی', key: 'postalCode', width: '120px', sortable: true },
  { title: 'آدرس', key: 'address', width: '200px', sortable: true },
  { title: 'عملیات', key: 'actions', width: '100px', sortable: false }
]);

const dataTableRef = ref();
const facilitiesRef = ref();
const guaranteeRef = ref();
const lcRef = ref();
const greenLicenseRef = ref();

const lcData = ref<Lc[]>([]);
const greenLicenseData = ref<GreenLicense[]>([]);
const totalItems = computed(() => items.value.length);
const facilitiesData = ref<Facility[]>([]);
const guaranteeData = ref<Guarantee[]>([]);

onMounted(() => {
  // Check if customerInfo has any meaningful data (not just an empty object)
  const customerInfo = approvalStore.customerInfo;
  const hasCustomerData = customerInfo && 
    (customerInfo.cif || 
     customerInfo.nationalCode || 
     customerInfo.customerName || 
     customerInfo.clientgroupname || 
     customerInfo.branchName);
  
  if (hasCustomerData) {
    items.value = [customerInfo];
    isValid.value = true;
  } else {
    // Reset the approval store if customerInfo doesn't have meaningful data
    approvalStore.resetAll();
    items.value = [];
    isValid.value = false;
  }
});

// Add debounced search function
const debouncedSearch = useDebounceFn(async () => {
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

  customizerStore.loading = true;
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
  } catch (err) {
    error.value = 'خطا در دریافت اطلاعات';
    showError.value = true;
  } finally {
    customizerStore.loading = false;
  }
}, 500); // 500ms delay

// Replace the existing search function with the debounced version
async function search() {
  await debouncedSearch();
}

const changePattern = () => {
  formData.value.cif = '';
  formData.value.nationalCode = '';
  error.value = null;
  showError.value = false;
  isValid.value = false;
};

const changeCustomerType = () => {
  formData.value.nationalCode = '';
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
    // Store single objects (not arrays) for each section based on environment
    if (isLiveEnvironment.value) {
      // In live environment, only handle facilities data
      const facilitiesObj = facilitiesData.value && facilitiesData.value.length > 0 ? facilitiesData.value[0] : undefined

      approvalStore.setCustomerInfo({
        ...firstItem,
        facilities: facilitiesObj,
        guarantee: undefined,
        lc: undefined,
        greenLicense: undefined,
      });
    } else {
      // In other environments, handle all data types
      const lcObj = lcData.value && lcData.value.length > 0 ? lcData.value[0] : undefined
      const facilitiesObj = facilitiesData.value && facilitiesData.value.length > 0 ? facilitiesData.value[0] : undefined
      const guaranteeObj = guaranteeData.value && guaranteeData.value.length > 0 ? guaranteeData.value[0] : undefined
      const greenLicenseObj = greenLicenseData.value && greenLicenseData.value.length > 0 ? greenLicenseData.value[0] : undefined

      approvalStore.setCustomerInfo({
        ...firstItem,
        facilities: facilitiesObj,
        guarantee: guaranteeObj,
        lc: lcObj,
        greenLicense: greenLicenseObj,
      });
    }
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
      isValid.value = false;
    }
  },
  { immediate: true }
);

function handleSaveFacility(data: any) {
  // Handle saving facility data
}

function handleDeleteFacility(item: any) {
  // Handle deleting facility
}

function handleSaveLC(data: any) {
  // Handle saving LC data
}

function handleDeleteLC(item: any) {
  // Handle deleting LC
}

function handleSaveGuarantee(data: any) {
  // Handle saving guarantee data
}

function handleDeleteGuarantee(item: any) {
  // Handle deleting guarantee
}

function handleSaveGreenLicense(data: any) {
  // Handle saving green license data
}

function handleDeleteGreenLicense(item: any) {
  // Handle deleting green license
}

defineExpose({ submitData });
</script>

<template>
  <div class="approval-section">
    <h4 class="group-title">انتخاب مشتری</h4>
    <!-- Search Section -->
    <form @submit.prevent="search" class="customer-form">
      <v-row class="mt-2">
        <v-col cols="12" md="3">
          <v-select
            v-model="searchParam"
            :items="searchTypes"
            label="نوع جستجو"
            density="comfortable"
            :disabled="customizerStore.loading || approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"
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
            :disabled="customizerStore.loading || approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"
            @update:model-value="changeCustomerType"
          />
        </v-col>
        <v-col v-if="searchParam === 'cif'" cols="12" md="3">
          <v-text-field
            v-model="formData.cif"
            label="شماره مشتری"
            density="comfortable"
            :disabled="customizerStore.loading || approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"
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
            :disabled="customizerStore.loading || approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"

          />
        </v-col>
        <v-col cols="12" md="12" class="customer-search-btn">
          <v-btn color="secondary" @click="search" type="button" :loading="customizerStore.loading" :disabled="customizerStore.loading || approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"> جستجو</v-btn>
        </v-col>
        <v-col cols="12" md="12">
          <v-data-table-virtual
            v-model:search="searchString"
            :items="items"
            :headers="headers"
            :loading="customizerStore.loading"
            :items-length="totalItems"
            no-data-text="رکوردی یافت نشد"
            density="comfortable"
            hover
            class="approval-table elevation-1"
            ref="dataTableRef"
          >
            <template #item.actions="{ item }">
              <v-btn v-if="item && Object.keys(item).length > 0" variant="text" color="error" @click="deleteCustomer()" :disabled="approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'">
                <IconTrash size="20" />
              </v-btn>
            </template>
          </v-data-table-virtual>
        </v-col>
      </v-row>
    </form>
  </div>
  <!-- Render only the active tab's component -->
  <div class="approval-section">
    <h4 class="group-title">درخواست مشتری</h4>
    <v-tabs v-model="activeTab" class="mb-2" v-if="!isLiveEnvironment">
      <v-tab 
        v-for="tab in availableTabs" 
        :key="tab.value" 
        :value="tab.value"
      >
        {{ tab.label }}
      </v-tab>
    </v-tabs>
    <Facilities ref="facilitiesRef" v-show="isLiveEnvironment || activeTab === 'facilities'" :loading="customizerStore.loading" @save="handleSaveFacility" @delete="handleDeleteFacility" @update:facilities="facilitiesData = $event" />
    <Guarantee ref="guaranteeRef" :loading="customizerStore.loading" v-show="!isLiveEnvironment && activeTab === 'guarantee'" @save="handleSaveGuarantee" @delete="handleDeleteGuarantee" @update:guarantee="guaranteeData = $event" />
    <LetterOfCredit ref="lcRef" :loading="customizerStore.loading" v-show="!isLiveEnvironment && activeTab === 'lc'" @save="handleSaveLC" @delete="handleDeleteLC" @update:lc="lcData = $event" />
    <GreenLicense ref="greenLicenseRef" :loading="customizerStore.loading" v-show="!isLiveEnvironment && activeTab === 'greenLicense'" @save="handleSaveGreenLicense" @delete="handleDeleteGreenLicense" @update:greenLicense="greenLicenseData = $event" />
  </div>
  <v-snackbar v-model="showError" color="error" timeout="5500">
    {{ error }}
  </v-snackbar>
</template>

<style lang="scss" scoped>
@import '@/scss/components/approval';

@media (forced-colors: active) {
  .v-btn {
    forced-color-adjust: none;
  }

  .v-text-field {
    forced-color-adjust: none;
  }
}
</style>
