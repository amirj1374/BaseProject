// ===============================|| Blank Layout ||=============================== //
<template>
  <v-app>
    <v-locale-provider :rtl="true">
      <RouterView />
    </v-locale-provider>
  </v-app>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>
