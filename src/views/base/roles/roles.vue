<template>
  <div class="approval-section">
    <div class="section-header">
      <h3 class="group-title">مدیرست نقش ها</h3>
    </div>
    <form class="customer-form">
      <v-row class="mt-2">
        <v-col cols="12" md="4">
          <v-autocomplete
            :items="baseStore.regions"
            v-model="formData.region"
            item-value="code"
            item-title="name"
            variant="outlined"
            label="انتخاب منطقه"
            clearable
            return-object
          >
          </v-autocomplete>
        </v-col>
      </v-row>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import { useRouteGuard } from '@/composables/useRouteGuard';
import { useBaseStore } from '@/stores/base';
import type { RegionsDto } from '@/types/approval/approvalType';

const { requirePermission } = useRouteGuard();
const baseStore = useBaseStore();
const formData = reactive({
  approvalType: '',
  region: null as RegionsDto | null
});
onMounted(() => {
  // Check if user has permission to access this page
  requirePermission('admin');
});
</script>