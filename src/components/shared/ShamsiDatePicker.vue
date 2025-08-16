<template>
  <div class="shamsi-date-picker">
    <Vue3PersianDatetimePicker
      :label="label"
      v-model="selectedDate"
      :format="format"
      :display-format="displayFormat"
      :editable="false"
      :clearable="clearable"
      :disabled="disabled"
      :min="minDate"
      :max="maxDate"
      :placeholder="placeholder"
      :input-class="inputClass"
      :wrapper-class="wrapperClass"
      :range="isRangeMode"
      :color="color"
      @change="onDateChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: string | [string, string] | null; // Single date or range
  label?: string;
  placeholder?: string;
  variant?: 'outlined' | 'filled' | 'plain' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled';
  density?: 'default' | 'comfortable' | 'compact' | 'prominent';
  color?: string;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  rules?: any[];
  hideDetails?: boolean | 'auto';
  prependInnerIcon?: string;
  appendInnerIcon?: string;
  format?: string;
  displayFormat?: string;
  minDate?: string;
  maxDate?: string;
  mode?: 'single' | 'range'; // Single date or range picker
  icon?: string; // Custom calendar icon
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: 'تاریخ',
  placeholder: 'تاریخ را انتخاب کنید',
  variant: 'outlined',
  density: 'default',
  color: 'primary',
  disabled: false,
  readonly: false,
  clearable: true,
  rules: () => [],
  hideDetails: 'auto',
  prependInnerIcon: '',
  appendInnerIcon: '',
  format: 'YYYY-MM-DD',
  displayFormat: 'jYYYY/jMM/jDD',
  minDate: '',
  maxDate: '',
  mode: 'single',
  icon: ''
});

const emit = defineEmits<{
  'update:modelValue': [value: string | [string, string] | null];
}>();

const selectedDate = computed({
  get: () => {
    // Pass Gregorian date directly to the library, let it handle Shamsi display
    if (props.mode === 'range' && Array.isArray(props.modelValue)) {
      return props.modelValue;
    } else if (typeof props.modelValue === 'string' && props.modelValue) {
      console.log('Passing Gregorian date to picker:', props.modelValue);
      // Convert ISO string to local date to avoid timezone issues
      if (props.modelValue.includes('T')) {
        const date = new Date(props.modelValue);
        // Format as YYYY-MM-DD to avoid timezone confusion
        const localDate = date.getFullYear() + '-' + 
          String(date.getMonth() + 1).padStart(2, '0') + '-' + 
          String(date.getDate()).padStart(2, '0');
        console.log('Converted to local date:', localDate);
        return localDate;
      }
      // Otherwise, create a proper date string that the picker can handle
      return props.modelValue + 'T00:00:00.000Z';
    }
    return props.modelValue;
  },
  set: (value) => {
    console.log('selectedDate setter called with:', value);
    emit('update:modelValue', value);
  }
});

const onDateChange = (date: any) => {
  console.log('Date changed:', date);
  
  if (props.mode === 'range') {
    // Handle range mode
    if (Array.isArray(date) && date.length === 2) {
      const [startDate, endDate] = date;
      const gregorianStart = startDate && startDate._isAMomentObject ? 
        startDate.toISOString() : startDate;
      const gregorianEnd = endDate && endDate._isAMomentObject ? 
        endDate.toISOString() : endDate;
      
      console.log('Range - Start:', gregorianStart, 'End:', gregorianEnd);
      emit('update:modelValue', [gregorianStart, gregorianEnd]);
    } else {
      emit('update:modelValue', null);
    }
  } else {
    // Handle single date mode
    if (date && date._isAMomentObject && date.isValid()) {
      // Use Moment's toISOString method to get full ISO format with timezone
      const gregorianISO = date.toISOString();
      console.log('Single date - Gregorian for server:', gregorianISO);
      emit('update:modelValue', gregorianISO);
    } else if (typeof date === 'string') {
      // If it's a string, convert to ISO format
      const dateObj = new Date(date);
      const gregorianISO = dateObj.toISOString();
      console.log('String date converted to ISO:', gregorianISO);
      emit('update:modelValue', gregorianISO);
    } else {
      emit('update:modelValue', '');
    }
  }
};

// CSS classes for Vuetify-like styling
const inputClass = computed(() => {
  const classes = ['v-text-field', 'v-input', 'v-input--density-comfortable'];
  if (props.variant === 'outlined') {
    classes.push('v-text-field--variant-outlined');
  }
  return classes.join(' ');
});

const wrapperClass = computed(() => {
  return 'v-field v-field--variant-outlined v-field--density-comfortable';
});

// Check if range mode is enabled
const isRangeMode = computed(() => props.mode === 'range');
</script>

<style scoped>
.shamsi-date-picker {
  position: relative;
}

/* Style the Persian date picker input to look like Vuetify */
.shamsi-date-picker :deep(.vpd-input-group) {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  transition: border-color 0.2s ease;
  background: white;
  position: relative;
}

.shamsi-date-picker :deep(.vpd-input-group:hover) {
  border-color: rgba(0, 0, 0, 0.24);
}

.shamsi-date-picker :deep(.vpd-input-group input) {
  padding: 12px 16px;
  font-size: 16px;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  box-sizing: border-box;
}

.shamsi-date-picker :deep(.vpd-icon-btn) {
  padding: 8px;
  border-radius: 4px;
  margin: 4px;
  cursor: pointer;
  background-color: v-bind(color) !important;
  color: white !important;
}

/* Custom icon styling */
.shamsi-date-picker :deep(.vpd-icon-btn i) {
  font-size: 16px;
}

/* Range mode styling */
.shamsi-date-picker :deep(.vpd-range) {
  background-color: v-bind(color) !important;
  opacity: 0.3;
}
</style>
