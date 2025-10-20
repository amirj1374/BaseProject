<script setup>
import { useCustomizerStore } from '@/stores/customizer';

const props = defineProps({ item: Object });
const customizer = useCustomizerStore();
</script>

<template>
  <v-list-subheader v-if="customizer.Sidebar_drawer" color="darkText" class="smallCap">{{ props.item.header }}</v-list-subheader>
</template>
