<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';
const isDialogActive = ref(false);
const valid = ref<boolean | null>(false);
const error = ref<string | null>(null);

// const handleSave = handleSubmit((values) => {
//   emit('save', {
//     ...values
//   });
//   console.log(values);
//   valid.value = true;
//   isDialogActive.value = false;
// });
const header = ref([
  { title: 'نوع تسهیلات', key: 'loanContractTypeTitle', sortable: true, editable: false },
  { title: 'مبلغ تصویبی حد سالانه', key: 'annualLimitApprovalAmount', sortable: true, editable: true },
  { title: 'مبلغ تصویبی موردی', key: 'caseLimitApprovalAmount', sortable: true, editable: true },
  { title: ' اصل - مانده استفاده شدهی جاری حد سالانه', key: 'annualLimitCurrentPrincipalRemain', sortable: true, editable: true },
  { title: 'سود-مانده استفاده شدهی جاری حد سالانه', key: 'annualLimitCurrentInterestRemain', sortable: true, editable: true },
  { title: '- اصل - مانده استفاده شدهی جاری موردی', key: 'caseLimitCurrentPrincipalRemain', sortable: true, editable: true },
  { title: 'سود-مانده استفاده شدهی جاری موردی', key: 'caseLimitCurrentInterestRemain', sortable: true, editable: true },
  { title: 'اصل /سررسید گذشته', key: 'overDuePrincipalRemain', sortable: true, editable: true },
  { title: 'سود /سررسید گذشته', key: 'overDueInterestRemain', sortable: true, editable: true },
  { title: 'خسارت /سررسید گذشته', key: 'penaltyAmount', sortable: true, editable: true },
  { title: 'مبالغ سفته', key: 'estateAmount', sortable: true, editable: true },
]);
</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    سوابق تسهیلات
    <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
    <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <v-dialog max-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="سوابق تسهیلات">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <CustomDataTable
              :apiResource="`loan-info`"
              :headers="header"
              :actions="['edit']"
              :pagination="false"
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
