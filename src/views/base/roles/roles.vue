<template>
    <div class="section-header">
      <h3 class="group-title"> مدیریت نقش ها</h3>
    </div>
    <form class="customer-form">
      <v-row class="mt-2">
        <v-col cols="12" md="12">
          <CustomDataTable
            ref="dataTableRef"
            :headers="headers"
            api-resource="/api/v1/department-role"
            :auto-fetch="true"
            :show-pagination="false"
            :height="500"
            :form-component="CreateRole"
            :filter-component="FilterRole"
          />
        </v-col>
      </v-row>
    </form>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouteGuard } from '@/composables/useRouteGuard';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import CreateRole from '@/components/sections/roles/create/CreateRole.vue';
import FilterRole from '@/components/sections/roles/filter/FilterRole.vue';

const { requirePermission } = useRouteGuard();
const headers = [
  { title: 'دپارتمان', key: 'departmentName' },
  { title: 'نقش لوتوسی', key: 'roleName' },
  { title: 'نقش سماپ', key: 'roleName' }
];
onMounted(() => {
  // Check if user has permission to access this page
  requirePermission('admin');
});
</script>