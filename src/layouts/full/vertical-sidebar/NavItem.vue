<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import IconSet from './IconSet.vue';
import { IconChevronUp, IconChevronDown } from '@tabler/icons-vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const route = useRoute();

const isActive = computed(() => {
  return route.path === props.item.to;
});

const IconComponent = computed(() => {
  return props.item.icon;
});
</script>

<template>
  <v-list-item
    :to="item.to"
    :href="item.href"
    :rounded="item.rounded"
    :class="[
      'leftPadding',
      {
        'v-list-item--active': isActive,
        'v-list-item--link': !item.to && !item.href
      }
    ]"
    :disabled="item.disabled"
    :target="item.target"
    :rel="item.target === '_blank' ? 'noopener noreferrer' : undefined"
  >
    <template v-if="item.icon" #prepend>
      <IconSet :item="item.icon" />
    </template>
    <v-list-item-title>{{ item.title }}</v-list-item-title>
    <template v-if="item.subItems" #append>
      <IconChevronUp v-if="isActive" :class="{ 'rotate-icon': isActive }" size="16" />
      <IconChevronDown v-else size="16" />
    </template>
  </v-list-item>
</template>

<style scoped>
.leftPadding {
  padding-left: 20px;
}
.rotate-icon {
  transform: rotate(180deg);
}
</style> 