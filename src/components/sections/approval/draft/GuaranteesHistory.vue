<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-vue';
import { ref } from 'vue';
import { useApprovalStore } from '@/stores/approval';

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

// const handleSave = handleSubmit((values) => {
//   emit('save', {
//     ...values
//   });
//   console.log(values);
//   valid.value = true;
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
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    سوابق ضمانت نامه ریالی
    <IconAlertCircle v-if="!valid" style="margin-right: 20px" size="20" />
    <IconCircleCheck v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <v-dialog max-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="سوابق ضمانت نامه">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <CustomDataTable
              :apiResource="`bank-guarantee`"
              :headers="header"
              :actions="['edit']"
              :pagination="false"
              :queryParams="{ loanRequestId: approvalStore.loanRequestId }"
              :height="400"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions style="display: flex; justify-content: space-evenly">
        <v-btn color="error" variant="elevated" text="انصراف" @click="isDialogActive = false"></v-btn>
        <v-btn color="primary" variant="elevated" text="ذخیره" @click="isDialogActive = true" />
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-if="error" v-model="error" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
</template>
