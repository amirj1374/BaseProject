<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    حساب های سپرده
    <IconAlertCircle v-if="!valid" style="margin-right: 20px" size="20" />
    <IconCircleCheck v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <v-dialog v-model="isDialogActive" max-width="full" min-height="full">
    <v-card title="حساب های سپرده">
      <v-card-text>
        <CustomDataTable
          ref="dataTableRef"
          :headers="headers"
          :apiResource="tableActions"
          :queryParams="{ loanRequestId: approvalStore.loanRequestId }"
          :auto-fetch="true"
          :show-pagination="true"
          :height="550"
          :show-refresh-button="true"
          @selection-change="handleSelectionChange"
          @update:selected-items="handleSelectedItemsUpdate"
          :selectable="!isEditingDisabled"
          :multi-select="!isEditingDisabled"
          :selectedItems="selectedItems"
          unique-key="accountNo"
          default-selected="isSelected"
        />
      </v-card-text>
      <v-card-actions style="display: flex; justify-content: space-evenly">
        <v-btn v-if="!isEditingDisabled" color="success" variant="elevated" text="ثبت" @click="handleSave"></v-btn>
        <v-btn color="error" variant="elevated" text="بستن" @click="isDialogActive = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Success/Error Messages -->
  <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';
import { CustomDataTable } from '@amirjalili1374/ui-kit';
import { useApprovalStore } from '@/stores/approval';
import { api } from '@/services/api';
import type { DepositAccount } from '@/types/approval/approvalType';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-vue';

const approvalStore = useApprovalStore();
// Reactive data
const dataTableRef = ref();
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const error = ref<string | null>(null);
const snackbarColor = ref('success');
const isDialogActive = ref(false);
const valid = ref(false);

// Check if editing is disabled
const isEditingDisabled = computed(() => {
  return approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION';
});

// Conditionally set actions based on status
const tableActions = computed(() => {
  return isEditingDisabled.value ? 'back/api/v1/deposit-info' : ('back/api/v1/deposit-info/get-all-deposit' as const);
});

// Selected items state
const selectedItems = ref<DepositAccount[]>([]);

// Check if deposit data exists on mount
onMounted(async () => {
  try {
    const response = await (api.approval as any).getDepositInfo(approvalStore.loanRequestId);
    if (response.status === 200 && response.data && response.data.length > 0) {
      // Check if any deposit account is selected
      const hasSelectedAccounts = response.data.some((account: any) => account.isSelected === true);
      valid.value = hasSelectedAccounts;
    }
  } catch (err) {
    console.log('No existing deposit data found');
  }
});

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
  console.log('Selected accounts:', selectedItems.value);

  if (!selectedItems.value || selectedItems.value.length === 0) {
    error.value = 'لطفاً حداقل یک حساب را انتخاب کنید';
    snackbarMessage.value = error.value;
    snackbarColor.value = 'error';
    showSnackbar.value = true;
    return;
  }

  try {
    // Ensure we have a valid loanRequestId
    const loanRequestId = approvalStore.loanRequestId;
    if (!loanRequestId) {
      new Error('شناسه درخواست وام یافت نشد');
    }

    // The API expects an array of deposit accounts (type definition is incorrect in service)
    const res = await (api.approval as any).saveDeposit(loanRequestId as string, selectedItems.value);
    if (res.status === 200) {
      isDialogActive.value = false;
      valid.value = true;
      snackbarMessage.value = `${selectedItems.value.length} حساب با موفقیت ثبت شد`;
      snackbarColor.value = 'success';
      showSnackbar.value = true;

      // Clear selection after successful save
      selectedItems.value = [];
      dataTableRef.value?.clearSelection();
    }
  } catch (err: any) {
    console.error('API error:', err);
    error.value = err?.response?.data?.message || err?.message || 'خطا در ثبت حساب‌ها';
    snackbarMessage.value = error.value || 'خطا در ثبت حساب‌ها';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  }
};

// Expose validation state to parent
defineExpose({ valid });
// Headers configuration with custom JSON support
const headers = [
  {
    title: 'شماره حساب',
    key: 'accountNo',
    sortable: true
  },
  {
    title: 'عنوان حساب',
    key: 'accountTitle',
    sortable: true
  },
  {
    title: 'تاریخ افتتاح',
    key: 'openingDate',
    sortable: true,
    isDate: true
  },
  {
    title: 'نوع حساب',
    key: 'accountType',
    sortable: true
  },
  {
    title: 'شعبه',
    key: 'branch',
    sortable: true
  },
  {
    title: 'میانگین موجودی شش ماه گذشته',
    key: 'avgBalanceHalf',
    sortable: true,
    width: 150
  },
  {
    title: 'مبلغ گردش بستانکار',
    key: 'creditTurnoverHalf',
    sortable: true,
    width: 150
  },
  {
    title: 'تعداد گردش بستانکار',
    key: 'countCreditTurnoverHalf',
    sortable: true,
    width: 150
  },
  {
    title: 'تعداد گردش بدهکار',
    key: 'countDebitTurnoverHalf',
    sortable: true,
    width: 150
  },
  {
    title: 'مبلغ گردش بدهکار',
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
</script>
