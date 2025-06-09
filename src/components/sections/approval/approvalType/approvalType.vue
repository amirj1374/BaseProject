<script lang="ts" setup>
import { onMounted, ref, watch, defineAsyncComponent, computed } from 'vue';
//utils
//type
import type { CustomerDto,FacilitiesRequest,Facility, Guarantee, Lc } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
// Use dynamic imports for heavy components
const Facilities = defineAsyncComponent(() => import('./Facilities.vue'));
const LetterOfCredit = defineAsyncComponent(() => import('./LetterOfCredit.vue'));
const Guarantee = defineAsyncComponent(() => import('./Guarantee.vue'));
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

const facilitiesData = ref<FacilitiesRequest[]>([]);
const guaranteeData = ref<Guarantee[]>([]);
const lcData = ref<Lc[]>([]);

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
  // if (!items.value.length || !items.value[0]) {
  //   error.value = 'هیچ مشتری‌ای یافت نشد. لطفاً جستجو کنید.';
  //   showError.value = true;
  //   return Promise.reject(error.value);
  // }
  // const firstItem = items.value[0];
  // if (!firstItem.cif && !firstItem.nationalCode) {
  //   error.value = 'اطلاعات مشتری نامعتبر است';
  //   showError.value = true;
  //   return Promise.reject(error.value);
  // }
  try {
    if (facilitiesData.value.length || guaranteeData.value.length || lcData.value.length) {
      approvalStore.setLoanRequestDetailList({
        summaryRequest: {
          summary: formData.value.summary,
          activityType: formData.value.activityType,
          description: formData.value.description
        },
        facilities: facilitiesData.value[0] || {} as FacilitiesRequest,
        guarantee: guaranteeData.value[0] || {} as Guarantee,
        lc: lcData.value[0] || {} as Lc
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

function handleSaveFacility(data: FacilitiesRequest) {
  facilitiesData.value = [data];
  approvalStore.updateFacilities(data);
}

function handleDeleteFacility(item: FacilitiesRequest) {
  facilitiesData.value = [];
  approvalStore.updateFacilities({} as FacilitiesRequest);
}

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
  <div class="customer-section">
    <h3 class="group-title">درخواست مصوبه</h3>
    <v-tabs v-model="activeTab" class="mb-2">
      <v-tab value="facilities">تسهیلات</v-tab>
      <v-tab value="guarantee">ضمانت‌نامه</v-tab>
      <v-tab value="lc">اعتبار اسنادی</v-tab>
    </v-tabs>
    <Facilities ref="facilitiesRef" v-show="activeTab === 'facilities'" :loading="loading" @save="handleSaveFacility" @delete="handleDeleteFacility" @update:facilities="facilitiesData = $event" />
    <Guarantee ref="guaranteeRef" :loading="loading" v-show="activeTab === 'guarantee'" @save="handleSaveGuarantee" @delete="handleDeleteGuarantee" @update:guarantee="guaranteeData = $event" />
    <LetterOfCredit ref="lcRef" :loading="loading" v-show="activeTab === 'lc'" @save="handleSaveLC" @delete="handleDeleteLC" @update:lc="lcData = $event" />
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
    background: linear-gradient(90deg, #f5f7fa 0%, #e2eaea 100%);
    border-radius: 8px;
    display: inline-block;
    line-height: 1.2;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
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

    :deep(.v-data-table-footer) {
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      padding: 8px 16px;
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
