<template>
  <component :is="icon" v-if="icon" class="icon" @click="handleClick"/>
</template>

<script lang="ts" setup>
import {defineProps} from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: false,
  },
  buttonClass: {
    type: String,
    default: '',
  },
  emitFunc: {
    type: Function,
    required: true,
  },
  rowData: Object,
});

function handleClick() {
  props.emitFunc(props.rowData); // Call the passed function with row data
}
</script>

