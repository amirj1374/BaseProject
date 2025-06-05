<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: string | number | undefined | null;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  variant?: string;
  errorMessages?: string | string[];
  min?: number;
  max?: number;
  suffix?: string;
  prefix?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const displayValue = computed({
  get() {
    const val = props.modelValue ?? '';
    const stringValue = val.toString().replace(/,/g, '');
    if (stringValue === '') return '';
    return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  set(val: string | null | undefined) {
    const safeVal = (val ?? '').toString();
    const raw = safeVal.replace(/[^\d]/g, '');
    emit('update:modelValue', raw);
  }
});
</script>

<template>
  <v-text-field
    v-model="displayValue"
    :label="props.label"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :readonly="props.readonly"
    :clearable="props.clearable"
    :variant="props.variant"
    :error-messages="props.errorMessages"
    :suffix="props.suffix"
    :prefix="props.prefix"
    inputmode="numeric"
    pattern="[0-9,]*"
  >
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
  </v-text-field>
</template>