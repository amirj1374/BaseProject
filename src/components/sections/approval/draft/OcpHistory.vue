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
  { title: 'مبلغ تصویبی سالانه', key: 'ocpAnnualAmount', sortable: true, editable: false, width: 250 },
  { title: 'مبلغ تصویبی سقف', key: 'ocpMaxAmount', sortable: true, editable: true, width: 250 },
  { title: 'مبلغ تصویبی  موردی', key: 'ocpCaseAmount', sortable: true, editable: true, width : 250  },
  { title: 'مانده استفاده شده حد سالانه', key: 'ocpAnnualRemain', sortable: true, editable: true, width : 250},
  { title: 'مانده استفاده شده سقف', key: 'ocpMaxRemain', sortable: true, editable: true, width : 250  },
  { title: 'مانده استفاده شده موردی', key: 'ocpCaseRemain', sortable: true, editable: true, width : 250  },
  { title: 'جمع اسناد تحویل داده شده', key: 'ocpTotalOfReceived', sortable: true, editable: true, width : 250  },
  { title: 'جمع اسناد تحویل نشده', key: 'ocpTotalOfUnreceived', sortable: true, editable: true, width : 250  },
  { title: 'بدهکاران بابت اعتبارات اسنادی پرداخت شده', key: 'ocpTotalOfUnreceived', sortable: true, editable: true, width : 250  },
  { title: 'بدهکاران بابت اعتبارات اسنادی پرداخت شده', key: 'ocpDebtorsFor', sortable: true, editable: true, width : 250  },
  { title: 'مبلغ وثیقه سفته', key: 'promissoryNoteAmount', sortable: true, editable: true, width : 250  },
  { title: 'مبلغ وثیقه سپرده', key: 'depositAmount', sortable: true, editable: true, width : 250  },
  { title: 'مبلغ وثیقه غیر منقول', key: 'estateAmount', sortable: true, editable: true, width : 250  },
  { title: 'مبلغ وثیقه سایر', key: 'otherCollateralAmount', sortable: true, editable: true, width : 250  },
    { title: 'مبلغ وثیقه چک', key: 'chequeAmount', sortable: true, editable: true, width : 250  },
]);

</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    حواله های اسنادی
    <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
    <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <v-dialog max-width="full" min-height="full" v-model="isDialogActive">
    <v-card title="حواله های اسنادی">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="12">
            <CustomDataTable
              :apiResource="`ocp`"
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
