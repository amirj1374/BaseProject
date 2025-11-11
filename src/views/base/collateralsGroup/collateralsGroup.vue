<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <div class="upload-form">
    <CustomDataTable
      ref="dataTableRef"
      :headers="headers"
      api-resource="public-category/collateral-group"
      :auto-fetch="true"
      :show-pagination="false"
      :height="550"
      :actions="['create', 'edit', 'delete']"
    />
  </div>
  <!-- Success/Error Messages -->
  <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

const breadcrumbs = ref([
  {
    title: 'اطلاعات پایه',
    disabled: false,
    href: '#'
  },
  {
    title: 'مدیریت گروه وثایق',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'مدیریت گروه وثایق' });
// Reactive data
const dataTableRef = ref();
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');

// Headers configuration with custom JSON support
const headers = [
  {
    title: 'نام گروه',
    key: 'name',
    sortable: true,
    width: 200,
  },
];

</script>
