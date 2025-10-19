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
  { title: 'عنوان هر سطر', key: 'title', sortable: true, editable: false },
  { title: 'مبلغ تصویبی حد سلانه', key: 'annualAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ تصویبی  موردی', key: 'caseAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مانده استفاده شده حد سالانه', key: 'annualRemain', sortable: true, editable: true, type: 'money' },
  { title: 'مانده استفاده شده  موردی', key: 'caseRemain', sortable: true, editable: true, type: 'money' },
  { title: 'اسناد رسیده تحویل شده', key: 'totalOfReceived', sortable: true, editable: true, type: 'number' },
  { title: 'اسناد رسیده تحویل نشده', key: 'totalOfUnreceived', sortable: true, editable: true, type: 'number' },
  { title: 'بدهکاران بابت اعتبار اسنادی پرداخت شده', key: 'debtRemain', sortable: true, editable: true, type: 'number' },
  { title: 'مبلغ وثیقه/ سپرده', key: 'depositAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ وثیقه/ غیر منقول', key: 'estateAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ وثیقه/ سایر', key: 'otherCollateralAmount', sortable: true, editable: true, type: 'money' },
  { title: 'مبلغ وثیقه/ سفته', key: 'promissoryNoteAmount', sortable: true, editable: true, type: 'money' },
]);
</script>

<template>
  <v-btn size="large" @click="isDialogActive = true">
 سوابق اعتبار اسنادی
  </v-btn>
  <v-dialog max-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="سوابق اعتبار اسنادی">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <CustomDataTable
              :apiResource="`credit-info`"
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
