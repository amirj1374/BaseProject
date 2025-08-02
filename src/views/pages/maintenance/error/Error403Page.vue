<template>
  <div class="d-flex align-center justify-center" style="height: 100vh">
    <v-card class="mx-auto" max-width="400">
      <v-card-text class="text-center">
        <IconShieldCancel size="100" color="red"/>
        <h2 class="text-h4 mb-2">403 - دسترسی غیرمجاز</h2>
        <p class="text-body-1 mb-4">
          شما مجوز دسترسی به این صفحه را ندارید.
        </p>
        <v-btn
          color="primary"
          @click="$router.push('/')"
          class="mb-2"
        >
          بازگشت به صفحه اصلی
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { IconShieldCancel } from '@tabler/icons-vue';
// No additional logic needed
</script> 