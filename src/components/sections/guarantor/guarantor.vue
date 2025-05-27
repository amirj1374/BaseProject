<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { api } from '@/services/api';
import type { 
  FetchGuarantorPayload, 
  GuarantorDto, 
  SaveGeneralPayload,
  LoanRequestDTO,
  GuarantorInfoDTO,
  LoanRequestDetailDTO
} from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
import { BooleanEnumOptions } from '@/constants/enums/booleanEnum';

const approvalStore = useApprovalStore();
const loading = ref(false);
const dialog = ref(false);
const hideInput = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const data = ref<GuarantorDto[]>([]);
const showError = ref(false);
const submitting = ref(false);

const headers = ref([
  { title: 'نام ضامن', key: 'guarantorName', align: 'center' },
  { title: 'کدملی / شناسه ملی', key: 'nationalCode', align: 'left' },
  { title: 'تاریخ', key: 'createdAt', isDate: true },
  { title: 'رتبه', key: 'label' },
  { title: 'امتیاز مشتری', key: 'value' }
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
    canSubmit.value = true;
  }
});

// get customer
async function search() {
  if (!isFormValid.value) {
    error.value = 'لطفا فرم های بالا رو کامل کنید';
    showError.value = true;
    return;
  }

  loading.value = true;
  error.value = null;
  showError.value = false;

  try {
    const payload: FetchGuarantorPayload = {
      nationalCode: formData.value.nationalCode,
      cif: formData.value.cif,
      guarantorName: formData.value.GuarantorName
    };

    const response = await api.approval.fetchGuarantor(payload);

    if (response.status === 200 && response.data) {
      const raw = response.data;
      const guarantorInfo = raw.guarantorInfo || {};
      dialog.value = true;

      // Create new guarantor with default values for null fields
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
        sapInquiryStatus: false,
        loanRequestId: raw.loanRequestId || null
      };

      // Check if guarantor already exists in data
      const isDuplicate = data.value.some((g: GuarantorDto) => 
        g.nationalCode === newGuarantor.nationalCode && 
        g.nationalCode !== '-' && 
        g.nationalCode !== null
      );

      if (!isDuplicate) {
        data.value.push(newGuarantor);
        // Update store with new data
        approvalStore.setGuarantor(data.value);
      } else {
        error.value = 'این ضامن با این کد ملی قبلاً اضافه شده است';
        showError.value = true;
      }

      // Clear input fields after successful API call
      formData.value.nationalCode = null;
      formData.value.cif = null;
      formData.value.GuarantorName = null;
      hideInput.value = false;

      canSubmit.value = true;
    } else {
      error.value = `خطا: ${response.statusText}`;
      showError.value = true;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'خطای سرور.';
    showError.value = true;
    hideInput.value = true;
    canSubmit.value = false;
  } finally {
    loading.value = false;
  }
}

// check validation
const isFormValid = computed(() => {
  return (formData.value.nationalCode && formData.value.nationalCode.length >= 10) || formData.value.cif !== null;
});

// submit form
const submitData = async () => {
  if (!data.value || data.value.length === 0) {
    error.value = 'اطلاعات ضامن یافت نشد';
    showError.value = true;
    return Promise.reject(error.value);
  }

  submitting.value = true;
  error.value = null;
  showError.value = false;

  try {
    // First save to store
    approvalStore.setGuarantor(data.value);

    // Create guarantor info payload
    const guarantorInfoDTO: GuarantorInfoDTO[] = data.value
      .filter(guarantor => guarantor.nationalCode && guarantor.guarantorName)
      .map(guarantor => ({
        nationalCode: guarantor.nationalCode!,
        guarantorName: guarantor.guarantorName!
      }));

    // Get loan request details from store
    const loanRequestDetailList = approvalStore.loanRequestDetailList;

    // Create the complete payload
    const payload: SaveGeneralPayload = {
      loanRequestDTO: {
        cif: approvalStore.customerInfo.cif || '',
        summary: approvalStore.summaryRequest.summary || '',
        activityType: approvalStore.summaryRequest.activityType || null,
        description: approvalStore.summaryRequest.description || null
      },
      loanRequestDetailDTO: {
        loanRequestDetailList: loanRequestDetailList
      },
      guarantorInfoDTO: guarantorInfoDTO
    };

    // Call API to send data
    const response = await api.approval.saveGeneral(payload);

    if (response.status === 200) {
      success.value = response.data.guarantorInfoDTO[0].loanRequest.trackingCode;
      dialog.value = true;
      return Promise.resolve(data.value);
    } else {
      error.value = 'خطا در ثبت اطلاعات';
      showError.value = true;
      return Promise.reject(error.value);
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'خطای سرور در ثبت اطلاعات';
    showError.value = true;
    return Promise.reject(error.value);
  } finally {
    submitting.value = false;
  }
};

defineExpose({ submitData });
</script>

<template>
  <v-card variant="flat">
    <form @submit.prevent="submitData">
      <v-row class="mt-2">
        <!-- National Code Input -->
        <v-col cols="12" md="4">
          <v-text-field v-model="formData.nationalCode" label="کد ملی" variant="outlined" v-digit-limit="11" density="comfortable" />
        </v-col>

        <v-col v-if="hideInput" cols="12" md="4">
          <v-text-field v-model="formData.GuarantorName" label="نام و نام خانوادگی" variant="outlined" density="comfortable" />
        </v-col>
      </v-row>
      <!-- Person Type Select -->
      <v-row>
        <v-col cols="12" md="12" class="text-center">
          <v-btn color="secondary" @click="search" type="button" :loading="loading"> جستجو</v-btn>
        </v-col>
      </v-row>

      <v-divider inset></v-divider>
      <v-dialog v-model="dialog" max-width="400">
        <v-card prepend-icon="mdi-update" title="پیام سیستم">
          <v-card-text>
            <v-alert v-if="success" type="success" variant="tonal" class="my-4">
              کد رهگیری: {{ success }}
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="dialog = false">بستن</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-col cols="12" md="12">
        <v-data-table
          :headers="headers"
          :items="data"
          :loading="loading"
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
        </v-data-table>
      </v-col>

      <!-- Submit Button -->
      <v-row class="mt-4">
        <v-col cols="12" class="text-center">
          <v-btn
            color="primary"
            type="submit"
            :loading="submitting"
            :disabled="!canSubmit || data.length === 0"
          >
            ثبت ضامن‌ها
          </v-btn>
        </v-col>
      </v-row>
    </form>
  </v-card>
</template>

<style scoped>
.table-scroll {
  overflow-x: auto;
  max-width: 100%;
}

.v-data-table {
  width: 100%;
  border-radius: 8px;
}

.v-data-table :deep(th) {
  background-color: #f5f5f5 !important;
  font-weight: 600;
}

.v-data-table :deep(td) {
  padding: 12px 16px;
}

.v-data-table :deep(tr:hover) {
  background-color: #f8f8f8;
}
</style>
