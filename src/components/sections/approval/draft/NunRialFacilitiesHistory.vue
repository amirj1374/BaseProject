<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { useApprovalStore } from '@/stores/approval';
import { ref, computed } from 'vue';

// Define props
interface Props {
  currencies?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  currencies: () => []
});

const isDialogActive = ref(false);
const error = ref<string | null>(null);
const approvalStore = useApprovalStore()

// Check if editing is disabled
const isEditingDisabled = computed(() => {
  return approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION';
});

// Conditionally set actions based on status
const tableActions = computed(() => {
  return isEditingDisabled.value ? [] : ['edit' as const];
});

// const handleSave = handleSubmit((values) => {
//   emit('save', {
//     ...values
//   });
//   console.log(values);
//   valid.value = true;
//   isDialogActive.value = false;
// });
const header = ref([
  { title: 'نوع ارز', key: 'currencyCode', sortable: true, editable: false},
  { title: 'نوع تسهیلات', key: 'loanContractTypeTitle', sortable: true, editable: false},
  { title: 'مبلغ تصویبی حد سالانه', key: 'annualLimitApprovalAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ تصویبی سقف', key: 'maximumLimitApprovalAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ تصویبی موردی', key: 'caseLimitApprovalAmount', sortable: true, editable: true, type: 'money' },
  { title: ' اصل - مانده استفاده شدهی جاری حد سالانه', key: 'annualLimitCurrentPrincipalRemain', sortable: true, editable: true, type: 'money' },
  { title: 'سود - مانده استفاده شدهی جاری حد سالانه', key: 'annualLimitCurrentInterestRemain', sortable: true, editable: true, type: 'money' },
  { title: 'اصل - مانده استفاده شدهی جاری سقف', key: 'maximumLimitCurrentPrincipalRemain', sortable: true, editable: true, type: 'money' },
  { title: 'سود - مانده استفاده شدهی جاری سقف', key: 'maximumLimitCurrentInterestRemain', sortable: true, editable: true, type: 'money' },
  { title: '- اصل - مانده استفاده شدهی جاری موردی', key: 'caseLimitCurrentPrincipalRemain', sortable: true, editable: true, type: 'money' },
  { title: 'سود-مانده استفاده شدهی جاری موردی', key: 'caseLimitCurrentInterestRemain', sortable: true, editable: true, type: 'money' },
  { title: 'اصل / سررسید گذشته', key: 'overDuePrincipalRemain', sortable: true, editable: true, type: 'money' },
  { title: 'سود / سررسید گذشته', key: 'overDueInterestRemain', sortable: true, editable: true, type: 'money' },
  { title: 'وجه التزام / سررسید گذشته', key: 'penaltyAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبالغ سفته', key: 'promissoryNoteAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ سپرده', key: 'depositAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ غیر منقول', key: 'estateAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ سایر', key: 'otherCollateralAmount', sortable: true, editable: true, type: 'money' },
]);
</script>

<template>
  <v-btn size="large" @click="isDialogActive = true">
    سوابق تسهیلات غیر ریالی
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
              :actions="tableActions"
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
