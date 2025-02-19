<template>
  <v-locale-provider ltr>
    <v-stepper  :items="['Step 1', 'Step 2', 'Step 3']">
      <template v-slot:item.1>
        <v-card title="Step One" flat>...</v-card>
      </template>
      <template v-slot:item.2>
        <v-card title="Step Two" flat>...</v-card>
      </template>
      <template v-slot:item.3>
        <v-card title="Step Three" flat>...</v-card>
      </template>
    </v-stepper>
  </v-locale-provider>
</template>
<script setup lang="ts">

</script>