<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref, h } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import Reference from '@/components/sections/cartable/reference/Reference.vue';
import { useRoute } from 'vue-router';
import SelectSigner from '@/components/sections/cartable/changeSigner/selectSigner/SelectSigner.vue';
import { BooleanEnumOptions } from '@/types/enums/global';

const { id } = useRoute().params;
const breadcrumbs = ref([
  {
    title: 'درخواست ها',
    disabled: false,
    to: { name: 'Cartable' }
  },
  {
    title: 'تغییر امضاداران',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'تغییر امضاداران' });
const header = ref([
  {
    title: 'نام امضا دار',
    key: 'name',
    sortable: true,
    editable: true,
  },
  {
    title: 'توضیحات',
    key: 'comment',
    sortable: true,
    editable: true,
  },
  {
    title: 'نام اقدام',
    key: 'actionTypeName',
    sortable: true,
    editable: true,
  },
  {
    title: 'وضعیت اقدام',
    key: 'actionDone',
    sortable: true,
    editable: true,
    translate: true,
    options: BooleanEnumOptions
  },
]);

const tableRef = ref();

function handleChangeSignerSuccess() {
  tableRef.value?.fetchData();
}
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <!-- Custom Data Table Component -->
  <div class="upload-form">
    <CustomDataTable
      ref="tableRef"
      :apiResource="`cartable/${id}/signer`"
      :headers="header"
      :height="550"
      :auto-fetch="true"
      :show-pagination="true"
      :show-refresh-button="true"
      :custom-actions="[
        {
          title: '⚙️ تغییر امضا دار',
          component: (props) => h(SelectSigner, { ...props, id: id, onSuccess: handleChangeSignerSuccess }),
        },
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
