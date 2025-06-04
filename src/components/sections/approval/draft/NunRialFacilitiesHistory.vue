<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { useApprovalStore } from '@/stores/approval';
import { ref } from 'vue';
const isDialogActive = ref(false);
const valid = ref<boolean | null>(false);
const error = ref<string | null>(null);
const approvalStore = useApprovalStore()

// const handleSave = handleSubmit((values) => {
//   emit('save', {
//     ...values
//   });
//   console.log(values);
//   valid.value = true;
//   isDialogActive.value = false;
// });
const header = ref([
  { title: 'نوع ارز', key: 'currencyCode', width:250, sortable: true, editable: false },
  { title: 'نوع تسهیلات', key: 'loanContractTypeTitle', width:250, sortable: true, editable: false },
  { title: 'مبلغ تصویبی حد سالانه', key: 'annualLimitApprovalAmount', width:250, sortable: true, editable: true },
  { title: 'مبلغ تصویبی سقف', key: 'maximumLimitApprovalAmount', width:250, sortable: true, editable: true },
  { title: 'مبلغ تصویبی موردی', key: 'caseLimitApprovalAmount', width:250, sortable: true, editable: true },
  { title: ' اصل - مانده استفاده شدهی جاری حد سالانه', key: 'annualLimitCurrentPrincipalRemain', width:250, sortable: true, editable: true },
  { title: 'سود - مانده استفاده شدهی جاری حد سالانه', key: 'annualLimitCurrentInterestRemain', width:250, sortable: true, editable: true },
  { title: 'اصل - مانده استفاده شدهی جاری سقف', key: 'maximumLimitCurrentPrincipalRemain', width:250, sortable: true, editable: true },
  { title: 'سود - مانده استفاده شدهی جاری سقف', key: 'maximumLimitCurrentInterestRemain', width:250, sortable: true, editable: true },
  { title: '- اصل - مانده استفاده شدهی جاری موردی', key: 'caseLimitCurrentPrincipalRemain', width:250, sortable: true, editable: true },
  { title: 'سود-مانده استفاده شدهی جاری موردی', key: 'caseLimitCurrentInterestRemain', width:250, sortable: true, editable: true },
  { title: 'اصل / سررسید گذشته', key: 'overDuePrincipalRemain', width:250, sortable: true, editable: true },
  { title: 'سود / سررسید گذشته', key: 'overDueInterestRemain', width:250, sortable: true, editable: true },
  { title: 'وجه التزام / سررسید گذشته', key: 'penaltyAmount', width:250, sortable: true, editable: true },
  { title: 'مبالغ سفته', key: 'estateAmount', sortable: true, width:250, editable: true },
]);
</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    سوابق تسهیلات غیر ریالی
    <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
    <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <v-dialog max-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="سوابق تسهیلات غیر ریالی">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <CustomDataTable
              :apiResource="`loan-info-non-rial`"
              :queryParams="{ loanRequestId: approvalStore.loanRequestId }"
              :headers="header"
              :actions="['edit']"
              :pagination="false"
              :height="400"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions style="display: flex; justify-content: space-evenly">
        <v-btn color="error" variant="elevated" text="بستن" @click="isDialogActive = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-if="error" v-model="error" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
</template>
