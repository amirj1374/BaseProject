<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';
import { useApprovalStore } from '@/stores/approval';
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
  { title: 'عنوان هر سطر', key: 'title', sortable: true, editable: false },
  { title: 'مبلغ تصویبی حد سلانه', key: 'amountYear', sortable: true, editable: true },
  { title: 'مبلغ تصویبی  موردی', key: 'amountItem', sortable: true, editable: true },
  { title: 'مانده استفاده شده حد سالانه', key: 'remainYear', sortable: true, editable: true },
  { title: 'مانده استفاده شده  موردی', key: 'remainItem', sortable: true, editable: true },
  { title: 'اسناد رسیده تحویل شده', key: 'totalOfRecieved', sortable: true, editable: true },
  { title: 'اسناد رسیده تحویل نشده', key: 'totalOfUnreceived', sortable: true, editable: true },
  { title: 'بدهکاران بابت اعتبار اسنادی پرداخت شده', key: 'debtRemain', sortable: true, editable: true },
  { title: 'مبلغ وثیقه/ سپرده', key: 'depositAmount', sortable: true, editable: true },
  { title: 'مبلغ وثیقه/ غیر منقول', key: 'estateAmount', sortable: true, editable: true },
  { title: 'مبلغ وثیقه/ سایر', key: 'otherCollateralAmount', sortable: true, editable: true },
  { title: 'مبلغ وثیقه/ سفته', key: 'promissoryNoteAmount', sortable: true, editable: true },
]);
</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
سوابق اعتبار اسنادی
    <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
    <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <v-dialog max-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="سوابق اعتبار اسنادی">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <CustomDataTable
              :apiResource="`credit-info`"
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
