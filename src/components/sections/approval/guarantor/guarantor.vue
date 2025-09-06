<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { api } from '@/services/api';
import type { FetchGuarantorPayload, GuarantorDto, SaveGeneralPayload, GuarantorInfoDTO } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
import { useCustomizerStore } from '@/stores/customizer';
import { IconRefresh } from '@tabler/icons-vue';
const customizerStore = useCustomizerStore();
const approvalStore = useApprovalStore();
const dialog = ref(false);
const hideInput = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const snackbar = ref(false);
const data = ref<GuarantorDto[]>([]);
const showError = ref(false);
const submitting = ref(false);
type AllowedStatus = 'nationalCode' | 'cif';
const searchParam = ref<AllowedStatus>('cif');
const searchTypes = ref<{ title: string; value: AllowedStatus }[]>([
  { title: 'شماره مشتری', value: 'cif' },
  { title: 'کدملی', value: 'nationalCode' }
]);
const headers = ref([
  { title: 'نام ضامن', key: 'guarantorName', align: 'center' },
  { title: 'کدملی / شناسه ملی', key: 'nationalCode', align: 'left' },
  { title: 'تاریخ', key: 'createdAt', isDate: true },
  { title: 'رتبه', key: 'label' },
  { title: 'امتیاز مشتری', key: 'value' },
  { title: 'وضعیت استعلام', key: 'sapInquiryStatus' },
  { title: 'عملیات', key: 'actions', align: 'center' }
]);

// initial data
const formData = ref({
  cif: null as string | null,
  nationalCode: null as string | null,
  GuarantorName: null as string | null
});

// Add initialization from store
onMounted(() => {
  // Initialize data from store if it exists
  if (approvalStore.guarantor && approvalStore.guarantor.length > 0) {
    data.value = approvalStore.guarantor;
    console.log('data', data.value);
    canSubmit.value = true;
  }
});

// get guarantor
async function addGuarantor() {
  if (!formData.value.nationalCode && !formData.value.cif) {
    showErrorMessage('کد ملی یا شماره مشتری را وارد کنید');
    return;
  }

  // Check if entered CIF or national code matches customer info
  if (formData.value.cif && formData.value.cif === approvalStore.customerInfo.cif) {
    showErrorMessage('مشتری نمیتواند ضامن باشد');
    return;
  }

  if (formData.value.nationalCode && formData.value.nationalCode === approvalStore.customerInfo.nationalCode) {
    showErrorMessage('مشتری نمیتواند ضامن باشد');
    return;
  }

  customizerStore.loading = true;
  error.value = null;
  showError.value = false;

  try {
    const payload: FetchGuarantorPayload = {
      nationalCode: formData.value.nationalCode || null,
      cif: formData.value.cif || null,
      guarantorName: formData.value.GuarantorName
    };

    // 2. Call API
    const response = await api.approval.fetchGuarantor(payload);

    if (response.status === 200 && response.data) {
      const raw = response.data;
      const guarantorInfo = raw.guarantorInfo || {};

      // 3. Build new Guarantor object
      const newGuarantor: GuarantorDto = {
        id: raw.id || null,
        cif: guarantorInfo.cif ?? raw.cif ?? '-',
        nationalCode: raw.nationalCode ?? guarantorInfo.nationalCode ?? '-',
        guarantorName: raw.guarantorName ?? guarantorInfo.guarantorName ?? '-',
        createdAt: raw.createdAt || new Date().toISOString(),
        customerType: raw.customerType || 'NATURAL',
        existCore: raw.existCore || false,
        label: raw.label || '-',
        value: raw.value || '0',
        sapInquiryStatus: true,
        loanRequestId: raw.loanRequestId || null
      };

      // Check if guarantor already exists in data
      const isDuplicate = data.value.some(
        (g: GuarantorDto) => g.nationalCode === newGuarantor.nationalCode && g.nationalCode !== '-' && g.nationalCode !== null
      );

      if (!isDuplicate) {
        data.value.push(newGuarantor);
        // Update store with new data
        approvalStore.setGuarantor(data.value);
        // Clear input fields after successful API call
        formData.value.nationalCode = null;
        formData.value.cif = null;
        formData.value.GuarantorName = null;
        hideInput.value = false;
        canSubmit.value = true;
      } else {
        error.value = 'این ضامن با این کد ملی قبلاً اضافه شده است';
        showError.value = true;
      }
    } else {
      error.value = `خطا: ${response.statusText}`;
      showError.value = true;
    }
  } catch (err: any) {
    showErrorMessage(err.response?.data?.message || 'خطای سرور.');
    hideInput.value = true;
    canSubmit.value = false;
  } finally {
    customizerStore.loading = false;
  }
}

// check validation
const isFormValid = computed(() => {
  return (formData.value.nationalCode && formData.value.nationalCode.length >= 10) || formData.value.cif !== null;
});

// submit form
const submitData = async () => {
  // Always call API, but don't show success alert if we already have trackingCode
  const hasExistingTrackingCode = !!approvalStore.trackingCode;
  if (hasExistingTrackingCode) {
    console.log('Already have trackingCode:', approvalStore.trackingCode);
  }

  submitting.value = true;
  error.value = null;
  showError.value = false;

  try {
    // First save to store
    approvalStore.setGuarantor(data.value);
    customizerStore.loading = true;
    // Create guarantor info payload
    const guarantorInfoDTO: GuarantorInfoDTO[] = data.value
      .filter((guarantor) => guarantor.nationalCode && guarantor.guarantorName)
      .map((guarantor) => ({
        nationalCode: guarantor.nationalCode!,
        guarantorName: guarantor.guarantorName!,
        createdAt: guarantor.createdAt!,
        label: guarantor.label!,
        sapInquiryStatus: guarantor.sapInquiryStatus!,
        value: guarantor.value!
      }));

    // Get loan request details from store
    const loanRequestDetailList = approvalStore.loanRequestDetailList;

    // Create the complete payload
    const payload: SaveGeneralPayload = {
      customerInfoDTO: approvalStore.customerInfo,
      loanRequestDetailDTO: {
        loanRequestDetailList: loanRequestDetailList ? [loanRequestDetailList] : []
      },
      guarantorInfoDTO: guarantorInfoDTO,
      loanRequestId: approvalStore.loanRequestId,
      trackingCode: approvalStore.trackingCode
    };

    console.log('Calling saveGeneral API with payload:', payload);

    // Call API to send data
    const response = await api.approval.saveGeneral(payload);

    if (response.status === 200) {
      success.value = response.data.trackingCode;
      approvalStore.setLoanRequestId(response.data.loanRequestId);
      approvalStore.setTrackingCode(response.data.trackingCode);
      
      // Only show dialog if we didn't have a trackingCode before
      if (!hasExistingTrackingCode) {
        dialog.value = true;
      }
      
      // Return success without waiting for dialog to close
      return data.value;
    } else {
      error.value = 'خطا در ثبت اطلاعات';
      showError.value = true;
      return Promise.reject(error.value);
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'خطای سرور در ثبت اطلاعات';
    showError.value = true;
    customizerStore.loading = false;
    return Promise.reject(error.value);
  } finally {
    submitting.value = false;
    customizerStore.loading = false;
  }
};

function deleteGuarantor(item: GuarantorDto) {
  const index = data.value.findIndex((g) => g.nationalCode === item.nationalCode);
  if (index !== -1) {
    data.value.splice(index, 1);
    approvalStore.setGuarantor(data.value);
    canSubmit.value = data.value.length > 0;
  }
}

const changePattern = async () => {
  formData.value.cif = '';
  formData.value.nationalCode = '';
  error.value = null;
  showError.value = false;
};

// Update error handling function
const showErrorMessage = (message: string) => {
  error.value = message;
  snackbar.value = true;
  showError.value = true;
};

defineExpose({ submitData });
</script>

<template>
  <div class="approval-section">
    <h4 class="group-title">ضامن</h4>
    <form @submit.prevent="submitData">
      <v-row class="mt-2">
        <v-col cols="12" md="3">
          <v-select
            v-model="searchParam"
            :items="searchTypes"
            label="نوع جستجو"
            variant="outlined"
            density="comfortable"
            :disabled="customizerStore.loading || approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"
            @update:model-value="changePattern"
          />
        </v-col>
        <v-col v-if="searchParam === 'cif'" cols="12" md="3">
          <v-text-field v-model="formData.cif" label="شماره مشتری" variant="outlined" density="comfortable" :disabled="approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'" />
        </v-col>
        <v-col v-if="searchParam === 'nationalCode'" cols="12" md="3">
          <v-text-field
            v-model="formData.nationalCode"
            label="کد ملی"
            variant="outlined"
            density="comfortable"
            type="number"
            v-digit-limit="11"
            :disabled="approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"
          />
        </v-col>

        <v-col v-if="hideInput" cols="12" md="4">
          <v-text-field v-model="formData.GuarantorName" label="نام و نام خانوادگی" variant="outlined" density="comfortable" :disabled="approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'" />
        </v-col>
        <v-col cols="12" md="12" class="text-center">
          <v-btn color="secondary" @click="addGuarantor" type="button" :loading="customizerStore.loading" :disabled="approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"> جستجو</v-btn>
        </v-col>
        <v-col cols="12" md="12">
          <v-data-table
            :headers="headers"
            :items="data"
            :loading="customizerStore.loading"
            class="elevation-1"
            density="comfortable"
            hover
            hide-default-footer
            no-data-text="اطلاعاتی برای نمایش وجود ندارد"
          >
            <template v-slot:item.sapInquiryStatus="{ item }">
              <v-chip :color="item.sapInquiryStatus ? 'success' : 'error'" size="small">
                {{ item.sapInquiryStatus ? 'بله' : 'خیر' }}
              </v-chip>
            </template>
            <template v-slot:item.createdAt="{ item }">
              {{ new Date(item.createdAt).toLocaleDateString('fa-IR') }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn size="x-small" @click="deleteGuarantor(item)" :disabled="approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION'"> ❌حذف</v-btn>
            </template>
          </v-data-table>
        </v-col>
        <v-dialog v-model="dialog" max-width="400">
          <v-card title="پیام سیستم">
            <template #prepend>
              <IconRefresh size="24" />
            </template>
            <v-card-text>
              <v-alert v-if="success" type="success" variant="tonal" class="my-4" timeout="10000"> کد رهگیری: {{ success }}</v-alert>
            </v-card-text>

            <v-card-text>
              <v-alert v-if="error" type="error" variant="tonal" class="my-4">{{ error }}</v-alert>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="dialog = false">بستن</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
      <v-snackbar v-model="snackbar" :color="error ? 'error' : 'success'" :timeout="3000" location="top">
        {{ error }}
        <template v-slot:actions>
          <v-btn color="white" variant="text" @click="snackbar = false"> بستن </v-btn>
        </template>
      </v-snackbar>
    </form>
  </div>
</template>
<style lang="scss" scoped>
@import '@/scss/components/approval';

:deep(th) {
  background-color: rgb(var(--v-theme-containerBg)) !important;
  font-weight: 600;
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
</style>