<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref, h, computed } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import Reference from '@/components/sections/cartable/reference/Reference.vue';
import CartableHistory from '@/components/sections/cartable/cartableHistory/cartableHistory.vue';
import UploadList from '@/components/sections/cartable/uploadList/uploadList.vue';
import LoanRequestHistory from '@/components/sections/cartable/loanRequestHistory/loanRequestHistory.vue';
import FilterCartable from '@/components/sections/cartable/FilterCartable.vue';
import Sign from '@/components/sections/cartable/sign/Sign.vue';
import { CartableStatusTypeOptions, CustomerTypeOptions } from '@/types/enums/global';
import { usePermissionsStore } from '@/stores/permissions';
import SignList from '@/components/sections/cartable/signList/SignList.vue';
import ExpertReport from '@/components/sections/cartable/expertReport/ExpertReport.vue';
import { api } from '@/services/api';
import type { Cartable } from '@/types/cartable/cartableTypes';

const permissionsStore = usePermissionsStore();

// Snackbar for notifications
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

const showSnackbar = (message: string, color: 'success' | 'error' = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

const breadcrumbs = ref([
  {
    title: 'درخواست ها',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'کارتابل ها' });
const header = ref([
  {
    title: 'تاریخ ایجاد',
    key: 'requestDate',
    sortable: true,
    editable: true,
    isDate: true
  },
  {
    title: 'تاریخ ویرایش',
    key: 'updateDate',
    sortable: true,
    editable: true,
    width: 180,
    isDate: true,
    formatter: (value: any, item: any) => {
      if (item.updateDate && item.updateTime) {
        return `${item.updateTime} - ${item.updateDate}`;
      }
      return value;
    }
  },
  {
    title: 'کد رهگیری',
    key: 'trackingCode',
    sortable: true,
    width: 200,
  },
  {
    title: 'وضعیت',
    key: 'status',
    sortable: true,
    translate: true,
    width: 150,
    options: CartableStatusTypeOptions,
  },
  {
    title: 'نام مشتری',
    key: 'customerName',
    sortable: true,
    editable: true,
  },
  {
    title: 'کد مشتری',
    key: 'customerCode',
    sortable: true,
    editable: true,
  },
  {
    title: 'گروه مشتری',
    key: 'customerGroup',
    sortable: true,
  },
  {
    title: 'نوع مشتری',
    key: 'customerType',
    sortable: true,
    translate: true,
    options: CustomerTypeOptions
  },
  {
    title: 'شعبه ثبت کننده درخواست',
    key: 'branchName',
    sortable: true,
    editable: true,
    width: 200
  },
  {
    title: 'کد شعبه ثبت کننده درخواست',
    key: 'branchCode',
    sortable: true,
    editable: true,
  },
  {
    title: 'ایجاد شده توسط',
    key: 'createByName',
    sortable: true,
    editable: true,
    width: 200
  },
  {
    title: 'تاریخ مهلت اصلاح شعبه',
    key: 'correctionDeadline',
    sortable: true,
    editable: true,
    isDate: true,
    width: 200
  }
]);

const tableRef = ref();
const preApprovalReport = {
  'گزارش پیش مصوبه': 'preApprovalReport/{id}'
};
const directiveReport = {
  'گزارش ابلاغیه': 'directiveReport/{id}'
};

const regionPreApprovalReport = {
  'گزارش پیش مصوبه منطقه': 'regionPreApprovalReport/{id}'
};

const flowReport = {
  'گزارش عملیات ' : 'flowReportDetail/{id}'
}

function handleReferenceSuccess() {
  tableRef.value?.fetchData();
}

// Function for routes that can access item data
const getDynamicRoutes = (item: any) => {
  const baseRoutes: Record<string, string> = {
    ...(permissionsStore.hasMenuPermission('preApprovalReport') ? preApprovalReport : {}),
    ...(permissionsStore.hasMenuPermission('directiveReport') ? directiveReport : {}),
    ...(permissionsStore.hasMenuPermission('regionPreApprovalReport') ? regionPreApprovalReport : {}),
    ...(permissionsStore.hasMenuPermission('') ? flowReport : {})
  };

  // Add changeSigner route only if permission exists AND item allows it
  if (permissionsStore.hasMenuPermission('changeSigner') && item.canChangeSigner === true) {
    baseRoutes['تغییر امضا داران'] = 'signer/{id}';
  }

  return baseRoutes;
};
function getCustomButtons(cartable: Cartable) {
  const buttons = [];
  buttons.push({
    label: '🔄 بروزرسانی فرم 1016',
    color: 'white',
    onClick: async () => {
      try {
        const response = await api.cartable.regenerate1016(cartable.loanRequestId);
        console.log('Response:', response);
        showSnackbar('فرم 1016 با موفقیت بروزرسانی شد', 'success')
      } catch (error) {
        console.error('Error in regenerate1016:', error);
        showSnackbar('خطا در بروزرسانی فرم 1016', 'error')
      }
    },
    disabled: false
  });

  buttons.push({
    label: '🔄 بروزرسانی پیش مصوبه منطقه',
    color: 'white',
    onClick: async () => {
      try {
        const response = await api.cartable.regenerateReqionApprovalLetter(cartable.id);
        console.log('Response:', response);
        showSnackbar('گزارش پیش مصوبه منطقه با موفقیت بروزرسانی شد', 'success')
      } catch (error) {
        console.error('Error in regenerateReqionApprovalLetter:', error);
        showSnackbar('خطا در بروزرسانی گزارش پیش مصوبه منطقه', 'error')
      }
    },
    disabled: false
  });

  buttons.push({
    label: '🔄 بروزرسانی گزارش پیش نویس مصوبه',
    color: 'white',
    onClick: async () => {
      try {
        const response = await api.cartable.regenerateCreditApprovals(cartable.id);
        console.log('Response:', response);
        showSnackbar('گزارش پیش نویس مصوبه با موفقیت بروزرسانی شد', 'success')
      } catch (error) {
        console.error('Error in regenerateCreditApprovals:', error);
        showSnackbar('خطا در بروزرسانی گزارش پیش نویس مصوبه', 'error')
      }
    },
    disabled: false
  });

  buttons.push({
    label: '🔄 بروزرسانی گزارش ابلاغیه',
    color: 'white',
    onClick: async () => {
      try {
        const response = await api.cartable.regenerateCreditSuggestions(cartable.id);
        console.log('Response:', response);
        showSnackbar('گزارش ابلاغیه با موفقیت بروزرسانی شد', 'success')
      } catch (error) {
        console.error('Error in regenerateCreditSuggestions:', error);
        showSnackbar('خطا در بروزرسانی گزارش ابلاغیه', 'error')
      }
    },
    disabled: false
  });


  return buttons;
}
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <!-- Custom Data Table Component -->
  <div class="upload-form">
    <CustomDataTable
      ref="tableRef"
      :apiResource="`cartable`"
      :headers="header"
      :height="500"
      :filter-component="FilterCartable"
      :auto-fetch="true"
      :show-pagination="true"
      :show-refresh-button="true"
      :custom-buttons-fn="getCustomButtons"
      :selectable="true"
      :bulkMode="true"
      :custom-actions="[
        {
          title: '⚙️ عملیات',
          component: (props) => h(Reference, { ...props, onSuccess: handleReferenceSuccess }),
          condition: (item) => item.canSubmit === true
        },
        {
          title: '✍️امضا',
          component: (props) => h(Sign, { ...props, onSuccess: handleReferenceSuccess }),
          condition: (item) => item.hasSignPermission === true
        },
        {
          title: '📑 لیست مدارک',
          component: (props) =>
            h(UploadList, {
              ...props,
              cartableId: props.item.id,
              trackingCode: props.item.trackingCode,
              loanRequestId: props.item.loanRequestId
            })
        },
        {
          title: '💬 مشاهده نظرات',
          component: (props) =>
            h(SignList, {
              ...props,
              item: props.item,
              onSuccess: handleReferenceSuccess
            }),
          condition: (item) => item.mainAssignee === true && item.commiteInquiries !== null
        },
        {
          title: 'گزارش کارشناسی',
          component: (props) =>
            h(ExpertReport, {
              ...props,
              item: props.item,
              cartableId: props.item.id,
              onSuccess: handleReferenceSuccess
            }),
          condition: (item) => permissionsStore.hasMenuPermission('uploadExpertReport')
        },
        {
          title: '📜 تاریخچه کارتابل',
          component: CartableHistory,
          condition: (item) => permissionsStore.hasMenuPermission('cartable_history')
        },
        {
          title: '📜 تاریخچه درخواست مصوبه',
          component: LoanRequestHistory,
          condition: (item) => permissionsStore.hasMenuPermission('approval_history')
        }
      ]"
      :routes="getDynamicRoutes"
    />
  </div>

  <!-- Snackbar for notifications -->
  <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="top">
    {{ snackbarMessage }}
    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="snackbar = false">
        بستن
      </v-btn>
    </template>
  </v-snackbar>
</template>
<style scoped>
.upload-page {
  height: 100vh; /* or 100% if its parent is also 100% */
  display: flex;
  flex-direction: column;
}

.upload-form {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
</style>
