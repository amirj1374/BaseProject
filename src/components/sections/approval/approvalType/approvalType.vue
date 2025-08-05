<script lang="ts" setup>
import { onMounted, ref, watch, defineAsyncComponent, computed } from 'vue';
//utils
//type
import type { CustomerDto, FacilitiesRequest, Facility, GuaranteeRequest, LcRequest, GreenLicense } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
// Use dynamic imports for heavy components
const Facilities = defineAsyncComponent(() => import('./Facilities.vue'));
const LetterOfCredit = defineAsyncComponent(() => import('./LetterOfCredit.vue'));
const Guarantee = defineAsyncComponent(() => import('./Guarantee.vue'));
const GreenLicense = defineAsyncComponent(() => import('./approvalGuaranteeLicense.vue'));
const approvalStore = useApprovalStore();
// Tab Management
const activeTab = ref('facilities');

// Search Section State
const loading = ref(false);
const error = ref<string | null>(null);
const showError = ref(false);
const items = ref<CustomerDto[]>([]);
const isValid = ref(false);

// Data Entry Section State
const formData = ref({
  summary: '',
  activityType: '',
  description: ''
});

const facilitiesRef = ref();
const guaranteeRef = ref();
const lcRef = ref();
const greenLicenseRef = ref();

const facilitiesData = ref<FacilitiesRequest[]>([]);
const guaranteeData = ref<GuaranteeRequest[]>([]);
const lcData = ref<LcRequest[]>([]);
const greenLicenseData = ref<GreenLicense[]>([]);

// Computed property to check if any data exists
const hasAnyData = computed(() => {
  return facilitiesData.value.length > 0 || 
         guaranteeData.value.length > 0 || 
         lcData.value.length > 0 || 
         greenLicenseData.value.length > 0;
});

// Computed property for form validation
const isFormValid = computed(() => {
  return formData.value.summary.trim() !== '' && 
         formData.value.activityType.trim() !== '' && 
         formData.value.description.trim() !== '';
});

onMounted(() => {
  if (approvalStore.loanRequestDetailList) {
    isValid.value = true;
    if (approvalStore.loanRequestDetailList.summaryRequest) {
      formData.value = {
        summary: approvalStore.loanRequestDetailList.summaryRequest.summary,
        activityType: approvalStore.loanRequestDetailList.summaryRequest.activityType,
        description: approvalStore.loanRequestDetailList.summaryRequest.description
      };
    }
  }
});

const submitData = async () => {
  try {
    // Check if any approval data exists
    if (!hasAnyData.value) {
      const errorMsg = 'لطفا درخواست مصوبه را ثبت کنید';
      error.value = errorMsg;
      showError.value = true;
      return Promise.reject(errorMsg);
    }

    // Update store with all data
    approvalStore.setLoanRequestDetailList({
      summaryRequest: {
        summary: formData.value.summary,
        activityType: formData.value.activityType,
        description: formData.value.description
      },
      facilities: facilitiesData.value[0] || {} as FacilitiesRequest,
      guarantee: guaranteeData.value[0] || {} as GuaranteeRequest,
      lc: lcData.value[0] || {} as LcRequest,
      greenLicense: greenLicenseData.value[0] || {} as GreenLicense
    });

    return Promise.resolve();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'خطای ناشناخته در ثبت اطلاعات مشتری';
    error.value = errorMsg;
    showError.value = true;
    return Promise.reject(errorMsg);
  }
};

// Add watch to load data when editing for all data types
watch(() => approvalStore.loanRequestDetailList?.facilities, (newFacilities) => {
  if (newFacilities && !isObjectEmpty(newFacilities)) {
    facilitiesData.value = [newFacilities];
  }
  // Don't clear local data if store has empty object - this prevents data loss when navigating
}, { immediate: true });

watch(() => approvalStore.loanRequestDetailList?.guarantee, (newGuarantee) => {
  if (newGuarantee && !isObjectEmpty(newGuarantee)) {
    guaranteeData.value = [newGuarantee];
  }
  // Don't clear local data if store has empty object - this prevents data loss when navigating
}, { immediate: true });

watch(() => approvalStore.loanRequestDetailList?.lc, (newLc) => {
  if (newLc && !isObjectEmpty(newLc)) {
    lcData.value = [newLc];
  }
  // Don't clear local data if store has empty object - this prevents data loss when navigating
}, { immediate: true });

watch(() => approvalStore.loanRequestDetailList?.greenLicense, (newGreenLicense) => {
  if (newGreenLicense && !isObjectEmpty(newGreenLicense)) {
    greenLicenseData.value = [newGreenLicense];
  }
  // Don't clear local data if store has empty object - this prevents data loss when navigating
}, { immediate: true });

function isObjectEmpty(obj: any): boolean {
  if (!obj) return true;
  if (typeof obj !== 'object') return true;
  if (Array.isArray(obj)) return obj.length === 0;
  
  // Check if it's an empty object (no own properties)
  const keys = Object.keys(obj);
  if (keys.length === 0) return true;
  
  // Check if all values are empty/null/undefined
  return Object.values(obj).every((v) => {
    if (v === undefined || v === null || v === '') return true;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'object') return isObjectEmpty(v);
    return false;
  });
}

function handleSaveFacility(data: FacilitiesRequest) {
  facilitiesData.value = [data];
  approvalStore.updateFacilities(data);
}

function handleDeleteFacility(item: FacilitiesRequest) {
  facilitiesData.value = [];
  // Don't update store with empty object, let it remain as is
  // This prevents the watch from clearing data when navigating back
}

function handleSaveLC(data: LcRequest) {
  lcData.value = [data];
  approvalStore.updateLc(data);
}

function handleDeleteLC(item: LcRequest) {
  lcData.value = [];
  // Don't update store with empty object, let it remain as is
  // This prevents the watch from clearing data when navigating back
}

function handleSaveGuarantee(data: GuaranteeRequest) {
  guaranteeData.value = [data];
  approvalStore.updateGuarantee(data);
}

function handleDeleteGuarantee(item: GuaranteeRequest) {
  guaranteeData.value = [];
  // Don't update store with empty object, let it remain as is
  // This prevents the watch from clearing data when navigating back
}

function handleSaveGreenLicense(data: GreenLicense) {
  greenLicenseData.value = [data];
  approvalStore.updateGreenLicense(data);
}

function handleDeleteGreenLicense(item: GreenLicense) {
  greenLicenseData.value = [];
  // Don't update store with empty object, let it remain as is
  // This prevents the watch from clearing data when navigating back
}

// Method to properly clear all data when needed (e.g., when starting a new request)
function clearAllData() {
  facilitiesData.value = [];
  guaranteeData.value = [];
  lcData.value = [];
  greenLicenseData.value = [];
  formData.value = {
    summary: '',
    activityType: '',
    description: ''
  };
  // Clear the store as well
  approvalStore.setLoanRequestDetailList({
    summaryRequest: {} as any,
    facilities: {} as FacilitiesRequest,
    guarantee: {} as GuaranteeRequest,
    lc: {} as LcRequest,
    greenLicense: {} as GreenLicense
  });
}

defineExpose({ submitData, clearAllData });
</script>

<template>
  <div class="approval-section">
    <h3 class="group-title">خلاصه درخواست مشتری</h3>
    <form class="customer-form">
      <v-row class="mt-2">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.summary"
            label="خلاصه درخواست"
            variant="outlined"
            density="comfortable"
            :rules="[(v: any) => !!v || 'این فیلد الزامی است']" />
        </v-col>
        <!-- National Code Input -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.activityType"
            label="نوع فعالیت"
            variant="outlined"
            density="comfortable"
            :rules="[(v: any) => !!v || 'این فیلد الزامی است']"
          />
        </v-col>
        <v-col cols="12" md="12">
          <v-textarea
            v-model="formData.description"
            label="توضیحات"
            variant="outlined"
            density="comfortable"
            rows="2"
            :rules="[(v: any) => !!v || 'این فیلد الزامی است']"
          />
        </v-col>
        <v-divider inset></v-divider>
      </v-row>
    </form>
  </div>
  <!-- Render only the active tab's component -->
  <div class="approval-section">
    <h3 class="group-title">درخواست مصوبه</h3>
    <v-tabs v-model="activeTab" class="mb-2">
      <v-tab value="facilities">تسهیلات</v-tab>
      <v-tab value="guarantee">ضمانت‌نامه</v-tab>
      <v-tab value="lc">اعتبار اسنادی</v-tab>
      <v-tab value="greenLicense">تضامین جواز سبز</v-tab>
    </v-tabs>
    
    <!-- Use v-if instead of v-show for better performance -->
    <Facilities 
      v-if="activeTab === 'facilities'" 
      ref="facilitiesRef" 
      :loading="loading" 
      @save="handleSaveFacility" 
      @delete="handleDeleteFacility" 
      @update:facilities="facilitiesData = $event" 
    />
    <Guarantee 
      v-if="activeTab === 'guarantee'" 
      ref="guaranteeRef" 
      :loading="loading" 
      @save="handleSaveGuarantee" 
      @delete="handleDeleteGuarantee" 
      @update:guarantee="guaranteeData = $event" 
    />
    <LetterOfCredit 
      v-if="activeTab === 'lc'" 
      ref="lcRef" 
      :loading="loading" 
      @save="handleSaveLC" 
      @delete="handleDeleteLC" 
      @update:lc="lcData = $event" 
    />
    <GreenLicense 
      v-if="activeTab === 'greenLicense'" 
      ref="greenLicenseRef" 
      :loading="loading" 
      @save="handleSaveGreenLicense" 
      @delete="handleDeleteGreenLicense" 
      @update:greenLicense="greenLicenseData = $event" 
    />
  </div>
  <v-snackbar v-model="showError" color="error" timeout="5500">
    {{ error }}
  </v-snackbar>
</template>

<style lang="scss" scoped>
@import '@/scss/components/approval';
</style>