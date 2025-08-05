<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    حساب های سپرده
    <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
    <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <div class="approval-section">
    <v-dialog v-model="isDialogActive" max-width="full" min-height="full">
      <v-card title="حساب های سپرده">
        <v-card-text>
          <CustomDataTable
            ref="dataTableRef"
            :headers="headers"
            api-resource="deposit-info/get-all-deposit"
            :queryParams="{ loanRequestId: approvalStore.loanRequestId }"
            :auto-fetch="true"
            :show-pagination="true"
            :height="550"
            :show-refresh-button="true"
            @selection-change="handleSelectionChange"
            @update:selected-items="handleSelectedItemsUpdate"
            :selectable="true"
            :multi-select="true"
            :selectedItems="selectedItems"
          />
        </v-card-text>
        <v-card-actions style="display: flex; justify-content: space-evenly">
          <v-btn color="error" variant="elevated" text="بستن" @click="isDialogActive = false"></v-btn>
          <v-btn color="success" variant="elevated" text="ثبت" @click="handleSave"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Success/Error Messages -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRouteGuard } from '@/composables/useRouteGuard';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { useApprovalStore } from '@/stores/approval';
import { api } from '@/services/api';

const { requirePermission } = useRouteGuard();
const approvalStore = useApprovalStore();
// Reactive data
const dataTableRef = ref();
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const error = ref<string | null>(null);
const snackbarColor = ref('success');
const isDialogActive = ref(false);
const valid = ref(false);

// Selected items state
const selectedItems = ref<any[]>([]);

// handle selected changes
const handleSelectionChange = (items: any[]) => {
  console.log('Selection changed:', items);
  selectedItems.value = items;
};

// Handle selected items update (v-model)
const handleSelectedItemsUpdate = (items: any[]) => {
  console.log('Selected items updated:', items);
  selectedItems.value = items;
};

const handleSave = async () => {
  console.log(selectedItems.value);
  // if (!selectedItems.value) {
  //   error.value = "لطفاً یک حساب را انتخاب کنید";
  //   return;
  // }
  // try {
  //   const res = await api.approval.saveDeposit(approvalStore.loanRequestId, selectedItems);
  //   if (res.status === 200) {
  //     isDialogActive.value = false;
  //     valid.value = true;
  //   }
  // } catch (err) {
  //   console.error('API error:', err);
  // } finally {
  // }
};
// Headers configuration with custom JSON support
const headers = [
  {
    title: 'شماره حساب',
    key: 'accountNo',
    sortable: true,
    width: 200
  },
  {
    title: 'عنوان حساب',
    key: 'accountTitle',
    sortable: true,
    width: 200
  },
  {
    title: 'تاریخ افتتاح',
    key: 'openingDate',
    sortable: true,
    isDate: true,
    width: 200
  },
  {
    title: 'نوع حساب',
    key: 'accountType',
    sortable: true,
    width: 200
  },
  {
    title: 'شعبه',
    key: 'branch',
    sortable: true,
    width: 200
  },
  {
    title: 'میانگین موجودی شش ماه گذشته',
    key: 'avgBalanceHalf',
    sortable: true,
    width: 150,
    isDate: true
  },
  {
    title: 'مبلغ گردش بدهکار',
    key: 'creditTurnoverHalf',
    sortable: true,
    width: 150
  },
  {
    title: 'تعداد گردش بدهکار',
    key: 'countCreditTurnoverHalf',
    sortable: true,
    width: 150
  },
  {
    title: 'تعداد گردش بستانکار',
    key: 'countDebitTurnoverHalf',
    sortable: true,
    width: 150
  },
  {
    title: 'مبلغ گردش بستانکار',
    key: 'debitTurnoverHalf',
    sortable: true,
    width: 150
  },
  {
    title: 'مانده موجودی',
    key: 'finalBalance',
    sortable: true,
    width: 150
  }
];
onMounted(() => {
  // Check if user has permission to access this page
  requirePermission('admin');
});
</script>
