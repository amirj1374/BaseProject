<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-vue';
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
const valid = ref<boolean | null>(false);
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
  { title: 'نوع ارز', key: 'currencyCode', width:250, sortable: true, editable: false},
  { title: 'نوع تسهیلات', key: 'loanContractTypeTitle', width:250, sortable: true, editable: false},
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
    سوابق تسهیلات غیر ریالی
    <IconAlertCircle v-if="!valid" style="margin-right: 20px" size="20" />
    <IconCircleCheck v-if="valid" style="margin-right: 20px" size="20" />
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
