<script lang="ts" setup>
import { ref } from 'vue';
import { api } from '@/services/api';
import type { ConsiderationPayload } from '@/types/approval/approvalType';

const isDialogActive = ref(false);
const loading = ref(false);
const valid = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
// initial data
const formData = ref({
  havePromissoryNote: false,
  signatory: null,
  beneficiaryCustomer: null,
  relatedName: null,
  unrelatedObligationsAmount: null,
  currentOffersAmount: null,
  approvalNumber: null,
  approvedFacilitiesAmount: null,
  approvalDate: null,
  creditLimitDate: null,
  loanRequestId: null,
  atBranchLevel: false,
  notUsed: false,
  previousLoanAppropriate: false
});

// get customer
async function save() {
  loading.value = true;
  error.value = null;

  try {
    const payload: ConsiderationPayload = {
      havePromissoryNote: formData.value.havePromissoryNote,
      signatory: formData.value.signatory,
      beneficiaryCustomer: formData.value.beneficiaryCustomer,
      relatedName: formData.value.relatedName,
      unrelatedObligationsAmount: formData.value.unrelatedObligationsAmount,
      currentOffersAmount: formData.value.currentOffersAmount,
      approvalNumber: formData.value.approvalNumber,
      approvedFacilitiesAmount: formData.value.approvedFacilitiesAmount,
      approvalDate: formData.value.approvalDate,
      creditLimitDate: formData.value.creditLimitDate,
      loanRequestId: formData.value.loanRequestId,
      atBranchLevel: formData.value.atBranchLevel,
      notUsed: formData.value.notUsed,
      previousLoanAppropriate: formData.value.previousLoanAppropriate
    };

    const response = await api.approval.saveConsideration(payload, '5253');

    if (response.status === 200 && response.data) {
      const raw = response.data;
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
          <v-col cols="12" md="3">
            <v-radio-group inline label="بازپرداخت تسهیلات دریافتی قبلی">
              <v-radio v-model="formData.previousLoanAppropriate" label="مناسب نبوده است" value="false"></v-radio>
              <v-radio v-model="formData.previousLoanAppropriate" label="مناسب بوده است" value="true"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="3">
            <v-radio-group inline label="سفته واخواستی">
              <v-radio v-model="formData.havePromissoryNote" label="ندارد" value="false"></v-radio>
              <v-radio v-model="formData.havePromissoryNote" label="دارد" value="true"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="3">
            <v-radio-group inline label="در حد شعبه">
              <v-radio v-model="formData.atBranchLevel" label="هست" value="true"></v-radio>
              <v-radio v-model="formData.atBranchLevel" label="نیست" value="false"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" md="3">
            <v-radio-group inline label="مورد استفاده مشتری">
              <v-radio v-model="formData.notUsed" label="قرار گرفته هست" value="true"></v-radio>
              <v-radio v-model="formData.notUsed" label="قرار نگرفته هست" value="false"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.approvedFacilitiesAmount"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="تسهیلات تصویبی به مبلغ"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.approvalNumber"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="شماره مصوبه"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.currentOffersAmount"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="پیشنهادات در جریان به مبلغ"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.unrelatedObligationsAmount"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="مشتری دارای تعهدات غیر مستقیم به میزان"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.relatedName"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="بابت تسهیلات خانم / آقا / شرکت"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="formData.beneficiaryCustomer"
              density="comfortable"
              hide-details="auto"
              variant="outlined"
              color="primary"
              label="مشتری ذینفع واحد خانم / آقا / شرکت"
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
