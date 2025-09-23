<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref, h } from 'vue';
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

const permissionsStore = usePermissionsStore();

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
    isDate: true,
    width: 250,
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
    width: 200
  },
  {
    title: 'وضعیت',
    key: 'status',
    sortable: true,
    translate: true,
    options: CartableStatusTypeOptions,
    width: 200
  },
  {
    title: 'نام مشتری',
    key: 'customerName',
    sortable: true,
    editable: true,
    width: 200
  },
  {
    title: 'کد مشتری',
    key: 'customerCode',
    sortable: true,
    editable: true,
    width: 200
  },
  {
    title: 'گروه مشتری',
    key: 'customerGroup',
    sortable: true,
    width: 200
  },
  {
    title: 'نوع مشتری',
    key: 'customerType',
    sortable: true,
    width: 200,
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
    width: 250
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
}

const regionPreApprovalReport = {
  'گزارش پیش مصوبه منطقه': 'regionPreApprovalReport/{id}'
}

const changeSigner = {
  'تغییر امضا داران': 'signer/{id}'
}

function handleReferenceSuccess() {
  tableRef.value?.fetchData();
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
      :height="550"
      :filter-component="FilterCartable"
      :auto-fetch="true"
      :show-pagination="true"
      :show-refresh-button="true"
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
          component: CartableHistory
        },
        {
          title: '📜 تاریخچه درخواست مصوبه',
          component: LoanRequestHistory
        },
      ]"

      :routes="{
        ...(permissionsStore.hasMenuPermission('preApprovalReport') ? preApprovalReport : {}),
        ...(permissionsStore.hasMenuPermission('directiveReport') ? directiveReport : {}),
        ...(permissionsStore.hasMenuPermission('regionPreApprovalReport') ? regionPreApprovalReport : {}),
        ...(permissionsStore.hasMenuPermission('') ? changeSigner : {}),

      }"
    />
  </div>
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
