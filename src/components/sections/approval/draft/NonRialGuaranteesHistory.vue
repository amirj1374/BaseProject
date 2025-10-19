<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref, computed, watch } from 'vue';
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
const showError = ref(false);
const approvalStore = useApprovalStore()

// Watch for error changes
watch(error, (newError) => {
  showError.value = !!newError;
});

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
  { title: 'ضمانت نامه های ریالی / ارزی', key: 'bgContractTypeCodeTitle', sortable: true, editable: false },
  { title: 'مبلغ تصویبی / حد سالانه', key: 'annualLimitApprovalAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ تصویبی / موردی', key: 'caseLimitApprovalAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مانده استفاده شده / فعال حد سالانه', key: 'annualLimitAmountRemain', sortable: true, editable: true, type: 'money' },
  { title: 'مانده استفاده شده / فعال موردی', key: 'caseLimitAmountRemain', sortable: true, editable: true, type: 'money' },
  { title: 'ضمانت نامه پرداخت شده', key: 'bgAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ وثایق / سفته', key: 'promissoryNoteAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ وثایق / غیر منقول', key: 'estateAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ وثایق / سپرده', key: 'depositAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ وثایق / سایر', key: 'otherCollateralAmount', sortable: true, editable: true, type: 'money' },
]);
</script>

<template>
  <v-btn size="large" @click="isDialogActive = true">
    سوابق ضمانت نامه غیر ریالی
  </v-btn>
  <v-dialog max-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="سوابق ضمانت نامه غیر ریالی">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <CustomDataTable
              :apiResource="`bank-guarantee-non-rial`"
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
  <v-snackbar v-if="error" v-model="showError" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
</template>
