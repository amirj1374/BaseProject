<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <div class="upload-form">
    <CustomDataTable
      ref="dataTableRef"
      :headers="headers"
      api-resource="back/api/v1/loan-requests/all"
      :auto-fetch="true"
      :show-pagination="true"
      :height="550"
      :show-refresh-button="true"
      :routes="routes"
      :filter-component="ApprovalEdit"
      :custom-buttons-fn="getCustomButtons"
    />
  </div>
  <!-- Success/Error Messages -->
  <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
    {{ snackbarMessage }}
  </v-snackbar>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h5">تأیید حذف</v-card-title>
      <v-card-text>
        <v-divider class="my-3"></v-divider>
        آیا از حذف درخواست {{ selectedApproval?.trackingCode }} اطمینان دارید؟
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <div class="d-flex w-ful">
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false"> انصراف </v-btn>
          <v-btn color="error" variant="text" @click="confirmDelete"> حذف </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import ApprovalEdit from '@/components/sections/approval/approvalEdit/approvalEdit.vue';
import { CustomDataTable,BaseBreadcrumb } from '@amirjalili1374/ui-kit';
import { useRouteGuard } from '@/composables/useRouteGuard';
import { api } from '@/services/api';
import type { ApprovalRequest } from '@/types/approval/approvalType';
import type { TableItem } from '@/types/componentTypes/DataTableTypes';
import { LoanRequestStatusOptions } from '@/types/enums/global';
import { onMounted, ref } from 'vue';

const routes = {
  'جزییات بیشتر⬅️': '/approval/{id}'
};
function getCustomButtons(item: TableItem) {
  const approval = item as unknown as ApprovalRequest;
  const buttons = [];
  if (approval.status === 'TEMPORARY_REGISTRATION') {
    // delete button when just with TEMPORARY_REGISTRATION status
    buttons.push({
      label: 'حذف ❌',
      color: 'white',
      onClick: () => handleDelete(approval),
      disabled: false
    });
  }
  return buttons;
}
const { requirePermission } = useRouteGuard();
const breadcrumbs = ref([]);
const page = ref({ title: 'ویرایش مصوبه ها' });
// Reactive data
const dataTableRef = ref();
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const showDeleteDialog = ref(false);
const selectedApproval = ref<ApprovalRequest | null>(null);

const handleDelete = (approval: ApprovalRequest) => {
  // Show confirmation dialog first
  selectedApproval.value = approval;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!selectedApproval.value) return;

  try {
    console.log('Deleting approval request:', selectedApproval.value.id);
    
    const res = await api.approval.deleteApprovalRequest(selectedApproval.value.id);
    
    if (res.status === 200) {
      // Show success message
      snackbarMessage.value = 'درخواست با موفقیت حذف شد';
      snackbarColor.value = 'success';
      showSnackbar.value = true;
      
      // Refresh the data table to reflect the changes
      if (dataTableRef.value) {
        dataTableRef.value.fetchData();
      }
      
    }
  } catch (error) {

    // Show error message
    snackbarMessage.value = 'خطا در حذف درخواست. لطفاً دوباره تلاش کنید';
    snackbarColor.value = 'error';
    showSnackbar.value = true;
  } finally {
    // Close dialog and reset selection
    showDeleteDialog.value = false;
    selectedApproval.value = null;
  }
};
// Headers configuration with custom JSON support
const headers = [
  {
    title: 'نام شعبه',
    key: 'branchName',
    sortable: true,
    width: 200
  },
  {
    title: 'نام مشتری',
    key: 'customerName',
    sortable: true,
    width: 200
  },
  {
    title: 'شماره مشتری',
    key: 'cif',
    sortable: true,
    width: 200
  },
  {
    title: 'کد ملی',
    key: 'nationalCode',
    sortable: true,
    width: 200
  },
  {
    title: 'کاربر ایجاد کننده',
    key: 'createdBy',
    sortable: true,
    width: 200
  },
  {
    title: 'کد رهگیری',
    key: 'trackingCode',
    sortable: true,
    width: 250
  },
  {
    title: 'تاریخ درخواست',
    key: 'requestDate',
    sortable: true,
    width: 200,
    isDate: true
  },
  {
    title: 'وضعیت',
    key: 'status',
    sortable: true,
    width: 200,
    options: LoanRequestStatusOptions,
    translate: true
  }
];
onMounted(() => {
  // Check if user has permission to access this page
  requirePermission('approval_edit');
});
</script>
