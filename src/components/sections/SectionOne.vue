<script lang="ts" setup>
import { computed, ref } from 'vue';
import { api } from '@/services/api';
//utils
import { DateConverter } from '@/utils/date-convertor';
//type
import type { CustomerDto, FetchCustomerPayload } from '@/types/approval/approvalType';
import approval from '@/services/modules/approval';
import { useApprovalStore } from '@/stores/approval';

type AllowedStatus = 'nationalCode' | 'cif';
const approvalStore = useApprovalStore();
const searchParam = ref<AllowedStatus>('cif');
// const customers = ref<CustomerDto>([]);
const loading = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const data = ref(<CustomerDto[]>[]);
const headers = ref([
  { title: 'شماره مشتری', align: 'center', key: 'cif', width: '150px' },
  { title: 'کدملی / شناسه ملی', align: 'center', key: 'nationalCode', width: '150px' },
  { title: 'نام مشتری', align: 'center', key: 'customerName', width: '150px' },
  { title: 'نام شعبه', align: 'center', key: 'branchName', width: '150px' },
  { title: 'کدپستی', align: 'center', key: 'postalCode', width: '120px' },
  { title: 'آدرس', align: 'center', key: 'address', width: '200px' },
  { title: 'گروه مشتری', align: 'center', key: 'clientgroupname', width: '200px' }
]);
// initial data
const formData = ref({
  cif: '',
  nationalCode: ''
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
    const payload: FetchCustomerPayload = {
      cif: formData.value.cif || null,
      nationalCode: formData.value.nationalCode || null,
      branchCode: '1001'
    };

    const response = await api.approval.fetchCustomer(payload);

    if (response.status === 200 && response.data) {
      const raw = response.data;
      const customerInfo = raw.customerInfo || {};
      // generate data for data table
      data.value = [
        {
          updatedAt: DateConverter.toShamsi(raw.updatedAt) ?? '-',
          createdBy: DateConverter.toShamsi(raw.createdBy) ?? '-',
          updatedBy: DateConverter.toShamsi(raw.updatedBy) ?? '-',
          id: raw.id,
          trackingCode: raw.trackingCode,
          status: raw.status,
          requestDate: DateConverter.toShamsi(raw.requestDate) ?? '-',
          cif: customerInfo.cif ?? raw.cif ?? '-',
          summery: raw.summery ?? '-',
          branchCode: raw.branchCode ?? customerInfo.branchCode ?? '-',
          nationalCode: raw.nationalCode ?? customerInfo.nationalCode ?? '-',
          customerName: customerInfo.customerName ?? '-',
          address: customerInfo.custaddress ?? '-',
          postalCode: customerInfo.postalCode ?? '-',
          phoneNo: customerInfo.phoneno ?? customerInfo.mobileno ?? '-',
          branchName: customerInfo.branchName ?? '-'
        }
      ];
      approvalStore.SET_LOAN_REQUEST_ID(raw.customerInfo.loanRequest.id);
      canSubmit.value = true;
    } else {
      error.value = `خطا: ${response.statusText}`;
    }
  } catch (err: any) {
    error.value = err.message || 'خطای سرور.';
    canSubmit.value = false;
  } finally {
    loading.value = false;
  }
}

// check validation
const isFormValid = computed(() => {
  return formData.value.nationalCode?.length >= 10 || formData.value.cif !== null;
});
// change search pattern
const changePattern = async () => {
  formData.value.cif = '';
  formData.value.nationalCode = '';
};
// submit form
const submitData = async () => {
  if (canSubmit.value === false) {
    return Promise.reject('ابتدا مشتری مورد نظر را انتخاب کنید');
  } else return Promise.resolve();
};

defineExpose({ submitData });
</script>

<template>
  <v-card variant="flat">
    <form @submit.prevent="submitData">
      <v-row class="mt-2">
        <v-col cols="12" md="12">
          <v-radio-group inline v-model="searchParam" class="radioBtnContainer" @change="changePattern">
            <v-radio label="شماره مشتری" value="cif"></v-radio>
            <v-radio label="کدملی" value="nationalCode"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-divider inset></v-divider>
      <v-row class="mt-2">
        <!-- Cif Code Input -->
        <v-col v-if="searchParam === 'cif'" cols="12" md="6">
          <v-text-field v-model="formData.cif" label="شماره مشتری" variant="outlined" density="comfortable" />
        </v-col>
        <!-- National Code Input -->
        <v-col v-if="searchParam === 'nationalCode'" cols="12" md="6">
          <v-text-field v-model="formData.nationalCode" label="کد ملی" variant="outlined" density="comfortable" />
        </v-col>
        <!-- Person Type Select -->
        <v-col cols="12" md="12" class="text-center">
          <v-btn color="secondary" @click="search" type="primary"> جستجو</v-btn>
        </v-col>

        <v-divider inset></v-divider>

        <v-col cols="12" md="12">
          <div class="table-scroll">
            <v-data-table :headers="headers" :items="data" hide-default-footer no-data-text="رکوردی وجود ندارد" sticky></v-data-table>
          </div>
        </v-col>
      </v-row>
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
