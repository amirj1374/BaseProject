<template>
  <div>
    <v-card>
      <v-card-title>مدیریت دپارتمان ها</v-card-title>
      <v-card-text>
        <p>این صفحه برای مدیریت دپارتمان های سازمان است.</p>
        <!-- Your department management content here -->
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouteGuard } from '@/composables/useRouteGuard';

const { requirePermission } = useRouteGuard();

onMounted(() => {
  // Check if user has permission to access this page
  requirePermission('admin');
});
</script>