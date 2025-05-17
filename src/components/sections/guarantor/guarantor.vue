<script lang="ts" setup>
import { computed, ref } from 'vue';
import { api } from '@/services/api';
import type {
  FetchGuarantorPayload,
  GuarantorDto,
  FetchInquiryPayload
} from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { BooleanEnumOptions } from '@/constants/enums/booleanEnum';

const approvalStore = useApprovalStore()
const loading = ref(false);
const dialog = ref(false);
const hideInput = ref(false);
const canSubmit = ref(false);
const isInquiry = ref(false);
const error = ref<string | null>(null);
const cif = ref<string | null>(null);
const trackingCode = ref<string | null>(null);
const nationalCode = ref<string | null>(null);
const GuarantorName = ref<string | null>(null);
const data = ref(<GuarantorDto[]>[]);
const selectedGuarantors = ref<GuarantorDto[]>([]);
const success = ref<string | null>(null);
const dataTableRef = ref();

const headers = ref([
  { title: 'نام ضامن', key: 'guarantorName', align: 'center' },
  { title: 'کدملی / شناسه ملی', key: 'nationalCode', align: 'left'},
  { title: 'وضعیت استعلام', key: 'sapInquiryStatus', translate: true, align: 'right', width: 50,
  options: BooleanEnumOptions,},
  { title: 'تاریخ استعلام', key: 'createdAt', isDate: true },
  { title: 'رتبه', key: 'label', },
  { title: 'امتیاز مشتری', key: 'value', },
]);

// initial data
const formData = ref({
  cif: cif,
  nationalCode: nationalCode,
  GuarantorName: GuarantorName
});

// get customer
async function search() {
  if (!isFormValid.value) {
    error.value = 'لطفا فرم های بالا رو کامل کنید';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const payload: FetchGuarantorPayload = {
      nationalCode: formData.value.nationalCode,
      cif: formData.value.cif,
      guarantorName: formData.value.GuarantorName,
      loanRequestId: approvalStore.loanRequestId
    };

    const response = await api.approval.fetchGuarantor(payload);

    if (response.status === 200 && response.data) {
      const raw = response.data;
      isInquiry = true
      const guarantorInfo = raw.guarantorInfo || {};
      success.value = 'اطلاعات ضامن با موفقیت دریافت شد';
      dialog.value = true;
      
      // Check if guarantor already exists in data
      const newGuarantor = {
        cif: guarantorInfo.cif ?? raw.cif ?? '-',
        nationalCode: raw.nationalCode ?? guarantorInfo.nationalCode ?? '-',
        guarantorName: raw.guarantorName ?? guarantorInfo.guarantorName ?? '-',
      };

      const isDuplicate = data.value.some(
        g => g.nationalCode === newGuarantor.nationalCode && g.nationalCode !== '-'
      );

      if (!isDuplicate) {
        data.value.push(newGuarantor);
        // Refetch data table after successful search
        await dataTableRef.value?.fetchData();
      } else {
        error.value = 'این ضامن با این کد ملی قبلاً اضافه شده است';
      }
      
      // Clear input fields after successful API call
      formData.value.nationalCode = null;
      formData.value.cif = null;
      formData.value.GuarantorName = null;
      hideInput.value = false;
      
      canSubmit.value = true;
    } else {
      error.value = `خطا: ${response.statusText}`;
    }
  } catch (err: any) {
    error.value = err.response.data.message || 'خطای سرور.';
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
  if (selectedGuarantors.value.length === 0) {
    return Promise.reject("ابتدا ضامن مورد نظر را انتخاب کنید");
  } else if (isInquiry.value === true){
    return Promise.reject("استعلام ضامن انجام نشده است");
  }
  return Promise.resolve(selectedGuarantors.value);
};

// Custom action for inquiry
const handleInquiry = async (item: any) => {
  try {
    const payload: FetchInquiryPayload = {
      guarantorInfoId: item.id,
      nationalCode: item.nationalCode,
      loanRequestId: approvalStore.loanRequestId
    };
    const response = await api.approval.getInquiry(payload);
    
    if (response.status === 200 && response.data) {
      const raw = response.data;
      const guarantorInfo = raw.guarantorInfo || {};
      await dataTableRef.value?.fetchData();
      
      // Update the item with new data
      item.cif = guarantorInfo.cif ?? raw.cif ?? '-';
      item.nationalCode = raw.nationalCode ?? guarantorInfo.nationalCode ?? '-';
      item.guarantorName = raw.guarantorName ?? guarantorInfo.guarantorName ?? '-';
      
      // Show success message
      success.value = 'اطلاعات ضامن با موفقیت دریافت شد';
      dialog.value = true;
    } else {
      error.value = `خطا: ${response.statusText}`;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'خطای سرور.';
  }
};

// Custom button action for inquiry
const customButtons = ref([
  {
    label: 'استعلام',
    color: 'primary',
    onClick: handleInquiry
  }
]);

defineExpose({ submitData });
</script>

<template>
  <v-card variant="flat">
    <form @submit.prevent="submitData">
      <v-row class="mt-2">
        <!-- National Code Input -->
        <v-col cols="12" md="4">
          <v-text-field v-model="formData.nationalCode" label="کد ملی" variant="outlined" density="comfortable" />
        </v-col>

        <v-col v-if="hideInput" cols="12" md="4">
          <v-text-field v-model="formData.GuarantorName" label="نام و نام خانوادگی" variant="outlined" density="comfortable" />
        </v-col>
      </v-row>
        <!-- Person Type Select -->
        <v-row>
          <v-col cols="12" md="12" class="text-center">
            <v-btn color="secondary" @click="search" type="primary"> جستجو</v-btn>
          </v-col>
        </v-row>

        <v-divider inset></v-divider>
      <!-- <v-dialog
        v-model="dialog"
        width="auto"
      >
        <v-card
          max-width="400"
          prepend-icon="mdi-update"
          title="پیام سیستم"
        >
          <v-card-text>
            <v-alert
              v-if="success"
              type="success"
              variant="tonal"
              class="my-4"
            >
              کد رهگیری  {{ trackingCode }} با موفقیت صادر شد
            </v-alert>
          </v-card-text>
        </v-card>
      </v-dialog> -->
        <v-col cols="12" md="12">
          <CustomDataTable
            ref="dataTableRef"
            :api-resource="'guarantor'"
            :headers="headers"
            :actions="['delete']"
            :query-params="{ loanRequestId: approvalStore.loanRequestId }"
            :show-pagination="false"
            :custom-buttons="customButtons"
          />
        </v-col>
      <v-snackbar v-if="error" v-model="error" color="error" timeout="5500">
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

.custom-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.custom-table th,
.custom-table td {
  padding: 12px;
  border: 1px solid #e0e0e0;
  text-align: center;
}

.custom-table th {
  background-color: #f5f5f5;
  font-weight: 500;
}

.custom-table tr:hover {
  background-color: #f8f8f8;
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
