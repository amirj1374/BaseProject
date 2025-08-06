<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { api } from '@/services/api';
import type { ConsiderationPayload } from '@/types/approval/approvalType';
import { useApprovalStore } from '@/stores/approval';

const isDialogActive = ref(false);
const loading = ref(false);
const valid = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const approvalStore = useApprovalStore()

// initial data
const formData = ref({
  loanRequestId: approvalStore.loanRequestId,
  previousLoanAppropriate: false,
  havePromissoryNote: false,
  signatory:'',
  currentOffersAmount: 0,
  creditLimitDate: null
});

onMounted(async () => {
  const response = await api.approval.getConsideration(approvalStore.loanRequestId);
  if (response.status === 200 && response.data) {
    formData.value = response.data;
  }
});

// get customer
async function save() {
  loading.value = true;
  error.value = null;

  try {
    const payload: ConsiderationPayload = {
      loanRequestId: approvalStore.loanRequestId,
      previousLoanAppropriate: formData.value.previousLoanAppropriate,
      havePromissoryNote: formData.value.havePromissoryNote,
      signatory: formData.value.signatory,
      currentOffersAmount: formData.value.currentOffersAmount,
      creditLimitDate: null,
    };

    const response = await api.approval.saveConsideration(payload);

    if (response.status === 200 && response.data) {
      const raw = response.data;
      isDialogActive.value = false;
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

// submit form
const submitData = async () => {
  await save()
};
</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    ملاحظات
    <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
    <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <v-dialog min-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="ملاحظات">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-radio-group inline label="بازپرداخت تسهیلات دریافتی قبلی" v-model="formData.previousLoanAppropriate">
              <v-radio label="مناسب نبوده است" :value=false></v-radio>
              <v-radio label="مناسب بوده است" :value=true></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="6">
            <v-radio-group inline label="سفته واخواستی" v-model="formData.havePromissoryNote">
              <v-radio label="ندارد" :value="false"></v-radio>
              <v-radio label="دارد"  :value="true"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="12">
            <v-text-field
              v-model="formData.currentOffersAmount"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="پیشنهادات در جریان به مبلغ"
              suffix="قبلا ارسال ولیکن هنوز مصوبه دریافت نشده است"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="12">
            <v-text-field
              v-model="formData.creditLimitDate"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="حد اعتباریه سالانه / سقف اعتباری مشتری در تاریخ"
              suffix="سر رسید میگردد"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions style="display: flex; justify-content: space-evenly; padding: 25px 10px">
        <v-btn color="primary" variant="elevated" text="ذخیره" @click="submitData" />
        <v-btn color="error" variant="elevated" text="انصراف" @click="isDialogActive = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
