<script lang="ts" setup>
import {h, ref} from 'vue';
import DataTable from '@/components/shared/DataTable.vue';
import LinkableText from "@/components/shared/LinkableText.vue";
import {useRouter} from "vue-router";

const router = useRouter();
const loading = ref(false);
const header = ref([
  {
    title: 'عنوان',
    align: 'center',
    sortable: true,
    key: 'title'
  },
  {
    title: 'نام کامل',
    align: 'center',
    sortable: true,
    key: 'name'
  },
  {
    title: 'کد',
    align: 'center',
    sortable: true,
    key: 'code'
  },
  {title: 'عملیات', value: 'actions', align: 'center'},
]);

const input = ref([
  {
    label: 'عنوان',
    key: 'title',
    value: '',
    editable: false
  },{
    label: 'نام کامل',
    key: 'name',
    value: '',
    editable: false
  },{
    label: 'کد',
    key: 'code',
    value: '',
    editable: false
  },
]);

const items = ref([
  {
    title: 'سهام عدالت',
    name:'سهام عدالت',
    code:'IR01EDALAT',
    id: 1
  },
  {
    title: 'خساپا',
    name:'خودروسازی سایپا',
    code:'IRO1SIPA0001',
    id: 2
  },
  {
    title: 'وبملت',
    name:'بانک ملت',
    code:'IRO1BMLT0001',
    id: 3
  },
  {
    title: 'شتران',
    name:'پالایش نفت تهران',
    code:'IRO1PTEH0001',
    id: 4
  },
  {
    title: 'غگیلا',
    name:'شیرپاستوریزه پگاه گیلان',
    code:'IRO3PEGZ0001',
    id: 5
  },
  {
    title: 'بکهنوج',
    name:'تولید برق ماهتاب کهنوج',
    code:'IRO3KAHZ0001',
    id: 6
  },
  {
    title: 'وپارس',
    name:'بانک پارسیان',
    code:'IRO1BPAR0001',
    id: 7
  }
]);

function updateList(_items: any) {
  items.value = _items;
}


const actionComponents = ref([
  (item: any) => h(LinkableText, {
    title: 'دوره(سال مالی)',
    emitFunc: onClickFinancialYear,
    rowData: item // Pass row data if needed
  }),
]);

function onClickFinancialYear(item: any) {
  router.push(`/base/stock/${item.rowData.title}/financial-year`);
}
</script>

<template>
  <DataTable :actionComponents="actionComponents" :headers="header" :items="items" :loading="loading" :table-input="input" :title="'سهام'"
             @update="updateList"/>
</template>
