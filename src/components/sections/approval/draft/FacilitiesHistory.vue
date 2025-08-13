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
  { title: 'نوع ارز', key: 'currencyCode', width:250, sortable: true, editable: false, type: 'string' },
  { title: 'نوع تسهیلات', key: 'loanContractTypeTitle', width:250, sortable: true, editable: false , type: 'string' },
  { title: 'مبلغ تصویبی حد سالانه', key: 'annualLimitApprovalAmount', width:250, sortable: true, editable: true, type: 'number' },
  { title: 'مبلغ تصویبی سقف', key: 'maximumLimitApprovalAmount', width:250, sortable: true, editable: true, type: 'number' },
  { title: 'مبلغ تصویبی موردی', key: 'caseLimitApprovalAmount', width:250, sortable: true, editable: true, type: 'number' },
  { title: ' اصل - مانده استفاده شدهی جاری حد سالانه', key: 'annualLimitCurrentPrincipalRemain', width:250, sortable: true, editable: true, type: 'number' },
  { title: 'سود - مانده استفاده شدهی جاری حد سالانه', key: 'annualLimitCurrentInterestRemain', width:250, sortable: true, editable: true, type: 'number' },
  { title: 'اصل - مانده استفاده شدهی جاری سقف', key: 'maximumLimitCurrentPrincipalRemain', width:250, sortable: true, editable: true, type: 'number' },
  { title: 'سود - مانده استفاده شدهی جاری سقف', key: 'maximumLimitCurrentInterestRemain', width:250, sortable: true, editable: true, type: 'number' },
  { title: '- اصل - مانده استفاده شدهی جاری موردی', key: 'caseLimitCurrentPrincipalRemain', width:250, sortable: true, editable: true, type: 'number' },
  { title: 'سود-مانده استفاده شدهی جاری موردی', key: 'caseLimitCurrentInterestRemain', width:250, sortable: true, editable: true, type: 'number' },
  { title: 'اصل / سررسید گذشته', key: 'overDuePrincipalRemain', width:250, sortable: true, editable: true, type: 'number' },
  { title: 'سود / سررسید گذشته', key: 'overDueInterestRemain', width:250, sortable: true, editable: true, type: 'number' },
  { title: 'وجه التزام / سررسید گذشته', key: 'penaltyAmount', width:250, sortable: true, editable: true, type: 'number' },
  { title: 'مبالغ سفته', key: 'estateAmount', sortable: true, width:250, editable: true, type: 'number' },
]); 
</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    سوابق تسهیلات ریالی
    <v-icon v-if="!valid" color="error" style="margin-right: 20px" size="20">mdi-alert-circle</v-icon>
    <v-icon v-if="valid" color="success" style="margin-right: 20px" size="20">mdi-checkbox-marked-circle</v-icon>
  </v-btn>
  <v-dialog max-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="سوابق تسهیلات ریالی">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <CustomDataTable
              :apiResource="`loan-info`"
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
