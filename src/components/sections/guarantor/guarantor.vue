<script lang="ts" setup>
import { computed, ref } from 'vue';
import { api } from '@/services/api';
import type { FetchGuarantorPayload, GuarantorDto, FetchInquiryPayload } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { BooleanEnumOptions } from '@/constants/enums/booleanEnum';

const approvalStore = useApprovalStore();
const loading = ref(false);
const dialog = ref(false);
const hideInput = ref(false);
const canSubmit = ref(false);
const isInquiry = ref(false);
const isGuarantor = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const data = ref<GuarantorDto[]>([]);
const dataTableRef = ref();

const headers = ref([
  { title: 'نام ضامن', key: 'guarantorName', align: 'center' },
  { title: 'کدملی / شناسه ملی', key: 'nationalCode', align: 'left' },
  {
    title: 'وضعیت استعلام',
    key: 'sapInquiryStatus',
    translate: true,
    align: 'right',
    width: 50,
    options: BooleanEnumOptions
  },
  { title: 'تاریخ استعلام', key: 'createdAt', isDate: true },
  { title: 'رتبه', key: 'label' },
  { title: 'امتیاز مشتری', key: 'value' }
]);

// initial data
const formData = ref({
  cif: null as string | null,
  nationalCode: null as string | null,
  GuarantorName: null as string | null
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
      guarantorName: formData.value.GuarantorName
    };

    const response = await api.approval.fetchGuarantor(payload);

    if (response.status === 200 && response.data) {
      isGuarantor.value = true;
      const raw = response.data;
      const guarantorInfo = raw.guarantorInfo || {};
      success.value = 'اطلاعات ضامن با موفقیت دریافت شد';
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
        sapInquiryStatus: raw.sapInquiryStatus || false,
        loanRequestId: raw.loanRequestId || null
      };

      const isDuplicate = data.value.some((g: GuarantorDto) => g.nationalCode === newGuarantor.nationalCode && g.nationalCode !== '-');

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
    error.value = err.response?.data?.message || 'خطای سرور.';
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
  const tableData = dataTableRef.value?.items;
  if (!tableData || tableData.length === 0) {
    return Promise.reject('اطلاعات ضامن یافت نشد');
  }

  const allInquired = tableData.every((item: any) => item.sapInquiryStatus === true);
  if (!allInquired) {
    return Promise.reject('استعلام تمام ضامن‌ها انجام نشده است');
  }

  return Promise.resolve(data.value);
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
          <v-btn color="secondary" @click="search" type="primary"> جستجو</v-btn>
        </v-col>
      </v-row>

      <v-divider inset></v-divider>
      <v-dialog v-model="dialog" width="auto">
        <v-card max-width="400" prepend-icon="mdi-update" title="پیام سیستم">
          <v-card-text>
            <v-alert v-if="success" type="success" variant="tonal" class="my-4">
              {{ success }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-col cols="12" md="12">
        <v-data-table
          ref="dataTableRef"
          :headers="headers"
          :items="data"
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
