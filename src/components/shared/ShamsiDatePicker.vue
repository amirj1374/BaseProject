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
  emitWithTimezone?: boolean; // If true, emit YYYY-MM-DD with timezone offset
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
  icon: '',
  emitWithTimezone: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | [string, string] | null];
}>();

const selectedDate = computed({
  get: () => {
    // Expect/return YYYY-MM-DD (Gregorian) or a tuple in range mode
    if (props.mode === 'range' && Array.isArray(props.modelValue)) {
      return props.modelValue;
    }
    if (typeof props.modelValue === 'string' && props.modelValue) {
      // If an ISO string was passed, normalize to YYYY-MM-DD to avoid timezone shifts
      if (props.modelValue.includes('T')) {
        const d = new Date(props.modelValue);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
      // Already in YYYY-MM-DD
      return props.modelValue;
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
  const toIsoWithOffset = (ymd: string) => {
    // Build a local-time Date at midnight and format with the local offset
    const [y, m, d] = ymd.split('-').map(Number);
    const local = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
    const offsetMin = -local.getTimezoneOffset(); // minutes east of UTC
    const sign = offsetMin >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMin);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    const mm2 = String(m).padStart(2, '0');
    const dd2 = String(d).padStart(2, '0');
    return `${y}-${mm2}-${dd2}T00:00:00${sign}${hh}:${mm}`;
  };
  
  if (props.mode === 'range') {
    // Emit as [YYYY-MM-DD, YYYY-MM-DD]
    if (Array.isArray(date) && date.length === 2) {
      const [startDate, endDate] = date;
      const normalize = (d: any) => {
        if (d && d._isAMomentObject && d.isValid()) return d.format('YYYY-MM-DD');
        if (typeof d === 'string') return d.includes('T') ? d.split('T')[0] : d;
        return '';
      };
      const start = normalize(startDate);
      const end = normalize(endDate);
      console.log('Range - Start:', start, 'End:', end);
      if (start && end) {
        if (props.emitWithTimezone) {
          emit('update:modelValue', [toIsoWithOffset(start), toIsoWithOffset(end)] as any);
        } else {
          emit('update:modelValue', [start, end] as any);
        }
      } else {
        emit('update:modelValue', null);
      }
    } else {
      emit('update:modelValue', null);
    }
  } else {
    // Emit single date as YYYY-MM-DD (Gregorian, date-only)
    if (date && date._isAMomentObject && date.isValid()) {
      const gregorian = date.format('YYYY-MM-DD');
      console.log('Single date (YYYY-MM-DD):', gregorian);
      emit('update:modelValue', props.emitWithTimezone ? toIsoWithOffset(gregorian) : gregorian);
    } else if (typeof date === 'string') {
      const normalized = date.includes('T') ? date.split('T')[0] : date;
      console.log('String date normalized to YYYY-MM-DD:', normalized);
      emit('update:modelValue', props.emitWithTimezone ? toIsoWithOffset(normalized) : normalized);
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
  border: 1px solid rgb(var(--v-theme-borderLight));
  border-radius: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: rgb(var(--v-theme-surface));
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.shamsi-date-picker :deep(.vpd-input-group:hover) {
  border-color: rgb(var(--v-theme-secondary));
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.shamsi-date-picker :deep(.vpd-input-group:focus-within) {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.1);
}

.shamsi-date-picker :deep(.vpd-input-group input) {
  padding: 12px 16px;
  font-size: 16px;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  box-sizing: border-box;
  color: rgb(var(--v-theme-onSurface));
}

.shamsi-date-picker :deep(.vpd-input-group input::placeholder) {
  color: rgb(var(--v-theme-onSurfaceVariant));
  opacity: 0.7;
}

.shamsi-date-picker :deep(.vpd-icon-btn) {
  padding: 8px;
  border-radius: 6px;
  margin: 4px;
  cursor: pointer;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%) !important;
  color: white !important;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shamsi-date-picker :deep(.vpd-icon-btn:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.shamsi-date-picker :deep(.vpd-icon-btn:active) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Custom icon styling */
.shamsi-date-picker :deep(.vpd-icon-btn i) {
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

/* Range mode styling */
.shamsi-date-picker :deep(.vpd-range) {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%) !important;
  opacity: 0.2;
}

/* Calendar popup styling */
.shamsi-date-picker :deep(.vpd-picker) {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-borderLight));
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Calendar header */
.shamsi-date-picker :deep(.vpd-header) {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  color: white;
}

/* Calendar navigation buttons */
.shamsi-date-picker :deep(.vpd-nav-btn) {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.shamsi-date-picker :deep(.vpd-nav-btn:hover) {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.05);
}

/* Calendar days */
.shamsi-date-picker :deep(.vpd-day) {
  color: rgb(var(--v-theme-onSurface));
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;
}

/* Ensure proper contrast for calendar days */
.shamsi-date-picker :deep(.vpd-day) {
  color: rgb(var(--v-theme-onSurface)) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Force better visibility in dark mode */
.shamsi-date-picker :deep(.vpd-day) {
  color: rgb(var(--v-theme-secondary)) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.shamsi-date-picker :deep(.vpd-day:hover) {
  background: rgb(var(--v-theme-primaryContainer)) !important;
  color: rgb(var(--v-theme-onPrimaryContainer)) !important;
}

.shamsi-date-picker :deep(.vpd-day.vpd-selected) {
  background: rgb(var(--v-theme-primary)) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.3);
}

.shamsi-date-picker :deep(.vpd-day.vpd-today) {
  border: 2px solid rgb(var(--v-theme-primary));
  font-weight: bold;
}

/* Month/Year selector */
.shamsi-date-picker :deep(.vpd-month-year) {
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Weekday headers */
.shamsi-date-picker :deep(.vpd-weekday) {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  background: rgb(var(--v-theme-primaryContainer));
  border-radius: 6px;
  margin: 0px;
}

/* Footer buttons */
.shamsi-date-picker :deep(.vpd-actions button) {
  background: rgb(var(--v-theme-secondary)) !important;
  color: white !important;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  margin: 4px;
}

.shamsi-date-picker :deep(.vpd-actions button:hover) {
  background: rgb(var(--v-theme-primary)) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.shamsi-date-picker :deep(.vpd-actions button:active) {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .shamsi-date-picker :deep(.vpd-input-group) {
    border-radius: 8px;
  }
  
  .shamsi-date-picker :deep(.vpd-input-group input) {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .shamsi-date-picker :deep(.vpd-icon-btn) {
    padding: 6px;
    margin: 2px;
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .shamsi-date-picker :deep(.vpd-icon-btn i) {
    font-size: 14px;
  }
  
  .shamsi-date-picker :deep(.vpd-picker) {
    max-width: 320px;
    margin: 0 auto;
  }
  
  .shamsi-date-picker :deep(.vpd-day) {
    padding: 8px 4px;
    font-size: 14px;
    min-width: 32px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .shamsi-date-picker :deep(.vpd-weekday) {
    padding: 6px 2px;
    font-size: 12px;
    min-width: 28px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .shamsi-date-picker :deep(.vpd-actions button) {
    padding: 6px 12px;
    font-size: 14px;
    margin: 2px;
  }
  
  .shamsi-date-picker :deep(.vpd-month-year) {
    font-size: 16px;
  }
  
  .shamsi-date-picker :deep(.vpd-nav-btn) {
    padding: 4px;
    min-width: 28px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .shamsi-date-picker :deep(.vpd-picker) {
    max-width: 280px;
    border-radius: 8px;
  }
  
  .shamsi-date-picker :deep(.vpd-day) {
    padding: 6px 2px;
    font-size: 12px;
    min-width: 28px;
    min-height: 28px;
  }
  
  .shamsi-date-picker :deep(.vpd-weekday) {
    padding: 4px 1px;
    font-size: 11px;
    min-width: 24px;
    min-height: 24px;
  }
  
  .shamsi-date-picker :deep(.vpd-actions button) {
    padding: 4px 8px;
    font-size: 12px;
    margin: 1px;
  }
  
  .shamsi-date-picker :deep(.vpd-month-year) {
    font-size: 14px;
  }
  
  .shamsi-date-picker :deep(.vpd-header) {
    border-radius: 8px 8px 0 0;
  }
}

/* Ensure proper touch targets on mobile */
@media (hover: none) and (pointer: coarse) {
  .shamsi-date-picker :deep(.vpd-icon-btn),
  .shamsi-date-picker :deep(.vpd-day),
  .shamsi-date-picker :deep(.vpd-nav-btn),
  .shamsi-date-picker :deep(.vpd-actions button) {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
