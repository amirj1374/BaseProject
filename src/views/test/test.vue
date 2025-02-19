<script setup lang="ts">
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { ref } from 'vue';

const header = ref([
  { title: 'شناسه', key: 'id', sortable: true, editable: true },
  { title: 'نام', key: 'firstName', sortable: true, editable: false },
  { title: 'نام خانوادگی', key: 'lastName', sortable: true, editable: false },
]);

const routes = {
  'جزییات بیشتر': '/base/person/{amountDue}/upload',
};
</script>

<template>
  <!-- Custom Data Table Component -->
  <CustomDataTable
    apiResource="person-requests"
    :headers="header"
    :actions="['create', 'edit', 'delete']"
    :routes="routes"
  />
</template>
