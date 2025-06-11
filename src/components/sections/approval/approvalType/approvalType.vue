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
    if (facilitiesData.value.length || guaranteeData.value.length || lcData.value.length || greenLicenseData.value.length) {
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
    }
    else {
      return Promise.reject('لطفا درخواست مصوبه را ثبت کنید');
    }
    return Promise.resolve();
  } catch (err) {
    error.value = 'خطای ناشناخته در ثبت اطلاعات مشتری';
    showError.value = true;
    return Promise.reject(error.value);
  }
};

// Add watch to load data when editing
watch(() => approvalStore.loanRequestDetailList?.facilities, (newFacilities) => {
  if (newFacilities && !isObjectEmpty(newFacilities)) {
    facilitiesData.value = [newFacilities];
  }
}, { immediate: true });

function isObjectEmpty(obj: any): boolean {
  if (!obj) return true;
  return Object.values(obj).every((v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0));
}

function handleSaveFacility(data: FacilitiesRequest) {
  facilitiesData.value = [data];
  approvalStore.updateFacilities(data);
}

function handleDeleteFacility(item: FacilitiesRequest) {
  facilitiesData.value = [];
  approvalStore.updateFacilities({} as FacilitiesRequest);
}

function handleSaveLC(data: LcRequest) {
  lcData.value = [data];
  approvalStore.updateLc(data);
}

function handleDeleteLC(item: LcRequest) {
  lcData.value = [];
  approvalStore.updateLc({} as LcRequest);
}

function handleSaveGuarantee(data: GuaranteeRequest) {
  guaranteeData.value = [data];
  approvalStore.updateGuarantee(data);
}

function handleDeleteGuarantee(item: GuaranteeRequest) {
  guaranteeData.value = [];
  approvalStore.updateGuarantee({} as GuaranteeRequest);
}

function handleSaveGreenLicense(data: GreenLicense) {
  greenLicenseData.value = [data];
  approvalStore.updateGreenLicense(data);
}

function handleDeleteGreenLicense(item: GreenLicense) {
  greenLicenseData.value = [];
  approvalStore.updateGreenLicense({} as GreenLicense);
}

defineExpose({ submitData });
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
    <Facilities ref="facilitiesRef" v-show="activeTab === 'facilities'" :loading="loading" @save="handleSaveFacility" @delete="handleDeleteFacility" @update:facilities="facilitiesData = $event" />
    <Guarantee ref="guaranteeRef" :loading="loading" v-show="activeTab === 'guarantee'" @save="handleSaveGuarantee" @delete="handleDeleteGuarantee" @update:guarantee="guaranteeData = $event" />
    <LetterOfCredit ref="lcRef" :loading="loading" v-show="activeTab === 'lc'" @save="handleSaveLC" @delete="handleDeleteLC" @update:lc="lcData = $event" />
    <GreenLicense ref="greenLicenseRef" :loading="loading" v-show="activeTab === 'greenLicense'" @save="handleSaveGreenLicense" @delete="handleDeleteGreenLicense" @update:greenLicense="greenLicenseData = $event" />
  </div>
  <v-snackbar v-model="showError" color="error" timeout="5500">
    {{ error }}
  </v-snackbar>
</template>

<style lang="scss" scoped>
@import '@/scss/components/approval';
</style>