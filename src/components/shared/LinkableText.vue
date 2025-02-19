<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  emitFunc: {
    type: Function
  },
  rowData: Object
});


function handleClick() {
  props.emitFunc(props.rowData);
}
</script>

<template>
  <v-btn variant="text" @click="handleClick">
    {{ title }}
  </v-btn>
</template>


