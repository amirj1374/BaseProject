<template>
  <div>
    <v-card>
      <v-card-title>مدیریت نقش ها</v-card-title>
      <v-card-text>
        <p>این صفحه برای مدیریت نقش های کاربران است.</p>
        <!-- Your role management content here -->
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