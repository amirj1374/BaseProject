<script lang="ts" setup>
import { computed, ref } from 'vue';
import { api } from '@/services/api';
import type {
  FetchGuarantorPayload,
  GuarantorDto
} from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';
const approvalStore = useApprovalStore()
const loading = ref(false);
const dialog = ref(false);
const hideInput = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const cif = ref<string | null>(null);
const trackingCode = ref<string | null>(null);
const nationalCode = ref<string | null>(null);
const GuarantorName = ref<string | null>(null);
const data = ref(<GuarantorDto[]>[]);
const success = ref<string | null>(null); // Added success message
const headers = ref([
  { title: 'نام ضامن', align: 'center', key: 'guarantorName', width: '150px' },
  { title: 'کدملی / شناسه ملی', align: 'center', key: 'nationalCode', width: '150px' },
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
      loanRequestId: approvalStore.getLoanRequestId
    };

    const response = await api.approval.fetchGuarantor(payload);
    console.log(response)

    if (response.status === 200 && response.data) {
      const raw = response.data;
      const guarantorInfo = raw.guarantorInfo || {};
      success.value = 'اطلاعات ضامن با موفقیت دریافت شد';
      trackingCode.value = raw.loanRequest.trackingCode;
      dialog.value = true;
      // generate data for data table
      data.value = [
        {
          cif: guarantorInfo.cif ?? raw.cif ?? '-',
          nationalCode: raw.nationalCode ?? guarantorInfo.nationalCode ?? '-',
          guarantorName: raw.guarantorName ?? guarantorInfo.guarantorName ?? '-',
        }
      ];
      canSubmit.value = true;
    } else {
      error.value = `خطا: ${response.statusText}`;
    }
  } catch (err: any) {
    error.value = err.response.data.message || 'خطای سرور.';
    hideInput.value = true
    canSubmit.value = false;

  } finally {
    loading.value = false;
  }
}

// check validation
const isFormValid = computed(() => {
  return formData.value.nationalCode?.length >= 10 || formData.value.cif !== null;
});
// submit form
const submitData = async () => {
  if (canSubmit.value === false) {
    return Promise.reject("ابتدا ضامن مورد نظر را انتخاب کنید");
  } else return Promise.resolve();
};

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
      <v-dialog
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
      </v-dialog>
        <v-col cols="12" md="12">
          <div class="table-scroll">
            <v-data-table :headers="headers" :items="data" hide-default-footer no-data-text="رکوردی وجود ندارد" sticky></v-data-table>
          </div>
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
