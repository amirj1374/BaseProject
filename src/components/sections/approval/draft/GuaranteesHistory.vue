<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref, computed } from 'vue';
import { useApprovalStore } from '@/stores/approval';

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
//   isDialogActive.value = false;
// });
const header = ref([
  { title: 'ضمانت نامه های ریالی / ارزی', key: 'bgContractTypeCodeTitle', sortable: true, editable: false ,width: 400},
  { title: 'مبلغ تصویبی / حد سالانه', key: 'annualLimitApprovalAmount', sortable: true, editable: true ,width: 250, type: 'number'},
  { title: 'مبلغ تصویبی / موردی', key: 'caseLimitApprovalAmount', sortable: true, editable: true ,width: 250, type: 'number'},
  { title: 'مانده استفاده شده / فعال حد سالانه', key: 'annualLimitAmountRemain', sortable: true, editable: true ,width: 250, type: 'number'},
  { title: 'مانده استفاده شده / فعال موردی', key: 'caseLimitAmountRemain', sortable: true, editable: true ,width: 250, type: 'number'},
  { title: 'ضمانت نامه پرداخت شده', key: 'bgAmount', sortable: true, editable: true ,width: 250, type: 'number'},
  { title: 'مبلغ وثایق / سفته', key: 'promissoryNoteAmount', sortable: true, editable: true ,width: 250, type: 'number'},
  { title: 'مبلغ وثایق / غیر منقول', key: 'estateAmount', sortable: true, editable: true ,width: 250, type: 'number'},
  { title: 'مبلغ وثایق / سپرده', key: 'depositAmount', sortable: true, editable: true ,width: 250, type: 'number'},
  { title: 'مبلغ وثایق / سایر', key: 'otherCollateralAmount', sortable: true, editable: true ,width: 250, type: 'number'},
]);
</script>

<template>
  <v-btn size="large" @click="isDialogActive = true">
    سوابق ضمانت نامه ریالی
  </v-btn>
  <v-dialog max-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="سوابق ضمانت نامه">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <CustomDataTable
              :apiResource="`bank-guarantee`"
              :headers="header"
              :actions="tableActions"
              :pagination="false"
              :queryParams="{ loanRequestId: approvalStore.loanRequestId }"
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
