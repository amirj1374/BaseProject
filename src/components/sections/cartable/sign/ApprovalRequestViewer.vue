<script lang="ts" setup>
import { onMounted, ref, watch, defineAsyncComponent, computed, nextTick } from 'vue';
import { api } from '@/services/api';
import type { FacilitiesRequest, GuaranteeRequest, LcRequest, GreenLicense } from '@/types/approval/approvalType';

// Use dynamic imports for heavy components
const Facilities = defineAsyncComponent(() => import('@/components/sections/approval/approvalType/Facilities.vue'));
const LetterOfCredit = defineAsyncComponent(() => import('@/components/sections/approval/approvalType/LetterOfCredit.vue'));
const Guarantee = defineAsyncComponent(() => import('@/components/sections/approval/approvalType/Guarantee.vue'));
const GreenLicenseComponent = defineAsyncComponent(() => import('@/components/sections/approval/approvalType/approvalGuaranteeLicense.vue'));

// Props
const props = defineProps<{
  loanRequestId: string;
}>();

// Tab Management
const activeTab = ref('facilities');

// State
const error = ref<string | null>(null);
const showError = ref(false);
const loading = ref(false);

// Refs for child components
const facilitiesRef = ref();
const guaranteeRef = ref();
const lcRef = ref();
const greenLicenseRef = ref();

// Data
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

// Fetch data from API
const fetchApprovalRequestData = async () => {
  try {
    loading.value = true;
    const response = await api.cartable.getLoanRequestDetail(props.loanRequestId);
    if (response.status === 200 && response.data) {
      const data = response.data;
      facilitiesData.value = data.facilities ? [data.facilities] : [];
      guaranteeData.value = data.guarantee ? [data.guarantee] : [];
      lcData.value = data.lc ? [data.lc] : [];
      greenLicenseData.value = data.greenLicense ? [data.greenLicense] : [];
    }
  } catch (err) {
    console.error('Error fetching approval request data:', err);
    const errorMsg = 'خطا در بارگذاری اطلاعات درخواست مصوبه';
    error.value = errorMsg;
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

// Event handlers (empty for read-only mode)
function handleSaveFacility(data: FacilitiesRequest) {
  facilitiesData.value = [data];
}

function handleDeleteFacility(item: FacilitiesRequest) {
  facilitiesData.value = [];
}

function handleSaveLC(data: LcRequest) {
  lcData.value = [data];
}

function handleDeleteLC(item: LcRequest) {
  lcData.value = [];
}

function handleSaveGuarantee(data: GuaranteeRequest) {
  guaranteeData.value = [data];
}

function handleDeleteGuarantee(item: GuaranteeRequest) {
  guaranteeData.value = [];
}

function handleSaveGreenLicense(data: GreenLicense) {
  greenLicenseData.value = [data];
}

function handleDeleteGreenLicense(item: GreenLicense) {
  greenLicenseData.value = [];
}

// Watch for active tab changes to set data in child components
watch(activeTab, async (newTab) => {
  await nextTick();
  if (newTab === 'facilities' && facilitiesData.value.length > 0 && facilitiesRef.value) {
    facilitiesRef.value.facilities = facilitiesData.value;
  }
  if (newTab === 'guarantee' && guaranteeData.value.length > 0 && guaranteeRef.value) {
    guaranteeRef.value.guarantee = guaranteeData.value;
  }
  if (newTab === 'lc' && lcData.value.length > 0 && lcRef.value) {
    lcRef.value.lc = lcData.value;
  }
  if (newTab === 'greenLicense' && greenLicenseData.value.length > 0 && greenLicenseRef.value) {
    greenLicenseRef.value.greenLicense = greenLicenseData.value;
  }
});

// Watch for data changes and set in child components when they become available
watch([facilitiesData, guaranteeData, lcData, greenLicenseData], async () => {
  await nextTick();
  if (facilitiesData.value.length > 0 && facilitiesRef.value) {
    facilitiesRef.value.facilities = facilitiesData.value;
  }
  if (guaranteeData.value.length > 0 && guaranteeRef.value) {
    guaranteeRef.value.guarantee = guaranteeData.value;
  }
  if (lcData.value.length > 0 && lcRef.value) {
    lcRef.value.lc = lcData.value;
  }
  if (greenLicenseData.value.length > 0 && greenLicenseRef.value) {
    greenLicenseRef.value.greenLicense = greenLicenseData.value;
  }
}, { deep: true });

// Watch for refs to be available and set data
watch([facilitiesRef, guaranteeRef, lcRef, greenLicenseRef], async () => {
  await nextTick();
  if (facilitiesData.value.length > 0 && facilitiesRef.value) {
    facilitiesRef.value.facilities = facilitiesData.value;
  }
  if (guaranteeData.value.length > 0 && guaranteeRef.value) {
    guaranteeRef.value.guarantee = guaranteeData.value;
  }
  if (lcData.value.length > 0 && lcRef.value) {
    lcRef.value.lc = lcData.value;
  }
  if (greenLicenseData.value.length > 0 && greenLicenseRef.value) {
    greenLicenseRef.value.greenLicense = greenLicenseData.value;
  }
}, { immediate: true });

onMounted(async () => {
  await fetchApprovalRequestData();
});
</script>

<template>
  <div class="approval-section">
    <!-- Loading state -->
    <div v-if="loading" class="d-flex flex-column align-center justify-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4 text-body-1">در حال بارگذاری اطلاعات درخواست مصوبه...</p>
    </div>
    
    <!-- Content when data is loaded -->
    <div v-else>
      <v-tabs v-model="activeTab" class="mb-2">
        <v-tab value="facilities" v-if="facilitiesData.length > 0">تسهیلات</v-tab>
        <v-tab value="guarantee" v-if="guaranteeData.length > 0">ضمانت‌نامه</v-tab>
        <v-tab value="lc" v-if="lcData.length > 0">اعتبار اسنادی</v-tab>
        <v-tab value="greenLicense" v-if="greenLicenseData.length > 0">تضامین جواز سبز</v-tab>
      </v-tabs>
      
      <!-- Use v-show to preserve component state when switching tabs -->
      <Facilities 
        v-show="activeTab === 'facilities'" 
        ref="facilitiesRef"
        :loading="false"
        :readonly="true"
        @save="handleSaveFacility" 
        @delete="handleDeleteFacility" 
        @update:facilities="facilitiesData = $event" 
      />
      <Guarantee 
        v-show="activeTab === 'guarantee'" 
        ref="guaranteeRef"
        :loading="false"
        :readonly="true"
        @save="handleSaveGuarantee" 
        @delete="handleDeleteGuarantee" 
        @update:guarantee="guaranteeData = $event" 
      />
      <LetterOfCredit 
        v-show="activeTab === 'lc'" 
        ref="lcRef"
        :loading="false"
        :readonly="true"
        @save="handleSaveLC" 
        @delete="handleDeleteLC" 
        @update:lc="lcData = $event" 
      />
      <GreenLicenseComponent 
        v-show="activeTab === 'greenLicense'" 
        ref="greenLicenseRef"
        :loading="false"
        :readonly="true"
        @save="handleSaveGreenLicense" 
        @delete="handleDeleteGreenLicense" 
        @update:greenLicense="greenLicenseData = $event" 
      />
      
      <v-alert v-if="!hasAnyData" 
               type="info" variant="tonal">
        هیچ درخواست مصوبه‌ای یافت نشد
      </v-alert>
    </div>
  </div>
  
  <v-snackbar v-model="showError" color="error" timeout="5500">
    {{ error }}
  </v-snackbar>
</template>

<style lang="scss" scoped>
@import '@/scss/components/approval';
</style>
