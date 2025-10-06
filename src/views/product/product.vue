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
    title: 'محصولات',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'محصول' });
const header = ref([
  {
    title: 'نام محصول',
    key: 'name',
    sortable: true,
    editable: true,
  },
  {
    title: 'توضیحات',
    key: 'description',
    sortable: true,
    editable: true,
  },
  {
    title: 'قیمت',
    key: 'price',
    type: 'money',
    sortable: true,
    editable: true,
  },
]);

const tableRef = ref();

function handleReferenceSuccess() {
  tableRef.value?.fetchData();
}
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
  'گزارش عملیات ' : 'flowReport/{id}'
}
function getCustomButtons(doc: Document) {
  
  const buttons = [];
  
  // Upload button (always enabled)
    buttons.push({
      label: 'آپلود',
      color: 'secondary',
      disabled: false,
      onClick: () => {
      },
    });
  
  // Edit button (disabled when condition is met)
    buttons.push({
      label: 'ویرایش',
      color: 'secondary',
      disabled: false,
      onClick: () => {
      },
    });
  
  // View image button
  buttons.push({
    label: 'مشاهده تصویر مدرک',
    color: 'primary',
    onClick: () => {
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
      :apiResource="`products`"
      :headers="header"
      :height="300"
      :actions="['create', 'edit', 'delete']"
      :auto-fetch="true"
      :show-pagination="true"
      :show-refresh-button="true"
      :bulk-mode="true"
      :selectable="true"
      :custom-buttons-fn="getCustomButtons"
      :custom-actions="[
        {
          title: '⚙️ عملیات',
          component: (props) => h(Reference, { ...props, onSuccess: handleReferenceSuccess }),
        },
        {
          title: '✍️امضا',
          component: (props) => h(Sign, { ...props, onSuccess: handleReferenceSuccess }),
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
        },
        {
          title: '📜 تاریخچه کارتابل',
          component: CartableHistory,
        },
        {
          title: '📜 تاریخچه درخواست مصوبه',
          component: LoanRequestHistory,
        }
      ]"
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
