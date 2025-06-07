<script setup lang="ts">
import { computed, defineEmits, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
    validator: (value) => value === null || value === undefined || typeof value === 'string' || typeof value === 'number'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'outlined'
  },
  errorMessages: {
    type: [String, Array],
    default: () => []
  },
  min: {
    type: Number,
    default: undefined
  },
  max: {
    type: Number,
    default: undefined
  },
  suffix: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

// Memoization for better performance
const lastProcessedValue = ref<string | number | null | undefined>(null);
const lastFormattedValue = ref<string>('');

const displayValue = computed({
  get() {
    const val = props.modelValue ?? '';
    if (val === lastProcessedValue.value) return lastFormattedValue.value;

    const stringValue = val.toString().replace(/,/g, '');
    if (stringValue === '') return '';

    const formatted = stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    lastProcessedValue.value = val;
    lastFormattedValue.value = formatted;
    return formatted;
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