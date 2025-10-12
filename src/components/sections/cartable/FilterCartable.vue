<template>
  <div class="filter-cartable">
    <v-row>
      <!-- Date Range Filter -->
      <v-col cols="12" md="6">
        <ShamsiDatePicker
          v-model="filterModel.dateFrom"
          label="از تاریخ"
          variant="outlined"
          density="comfortable"
          mode="single"
          format="YYYY-MM-DD"
          displayFormat="jYYYY/jMM/jDD"
          placeholder="تاریخ را انتخاب کنید"
          emitWithTimezone
          :error-messages="dateValidationErrors.dateFrom"
        />
      </v-col>
      <v-col cols="12" md="6">
        <ShamsiDatePicker
          v-model="filterModel.dateTo"
          label="تا تاریخ"
          variant="outlined"
          density="comfortable"
          mode="single"
          format="YYYY-MM-DD"
          displayFormat="jYYYY/jMM/jDD"
          placeholder="تاریخ را انتخاب کنید"
          emitWithTimezone
          :error-messages="dateValidationErrors.dateTo"
        />
      </v-col>

      <!-- Created By Filter -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="filterModel.createdBy"
          label="ایجاد شده توسط"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          clearable
          placeholder="نام کاربر"
        />
      </v-col>

      <!-- Tracking Code Filter -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="filterModel.trackingCode"
          label="کد رهگیری"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          clearable
          placeholder="کد رهگیری"
        />
      </v-col>

      <!-- Role Name Filter -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="filterModel.roleName"
          label="نقش"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          clearable
          placeholder="نام نقش"
        />
      </v-col>

      <!-- Status Filter -->
      <v-col cols="12" md="6">
        <v-select
          v-model="filterModel.status"
          :items="statusOptions"
          label="وضعیت"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          clearable
          placeholder="انتخاب وضعیت"
        />
      </v-col>
    </v-row>

    <!-- Filter Actions -->
    <v-row class="mt-4">
      <v-col cols="12" class="d-flex justify-center gap-2">
        <v-btn color="error" variant="outlined" @click="clearFilters">
          پاک کردن فیلترها
        </v-btn>
        <v-btn color="primary" @click="applyFilters">
          اعمال فیلتر
        </v-btn>
      </v-col>
    </v-row>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showErrorSnackbar" color="error" timeout="4000">
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, defineProps, defineEmits, computed } from 'vue';
import ShamsiDatePicker from '@/components/shared/ShamsiDatePicker.vue';

interface FilterModel {
  dateFrom: string;
  dateTo: string;
  createdBy: string;
  trackingCode: string;
  roleName: string;
  status: string;
}

const props = defineProps<{
  modelValue?: Partial<FilterModel>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FilterModel];
  'apply': [value: FilterModel];
}>();

// Filter model
const filterModel = reactive<FilterModel>({
  dateFrom: '',
  dateTo: '',
  createdBy: '',
  trackingCode: '',
  roleName: '',
  status: ''
});

// Status options
const statusOptions = ref([
  { title: 'در حال بررسی', value: 'IN_PROGRESS' },
  { title: 'تایید شده', value: 'ACCEPTED' },
  { title: 'رد شده', value: 'REJECTED' },
  { title: 'بسته شده', value: 'CLOSED' },
]);

// Date validation
const dateValidationErrors = ref({
  dateFrom: [] as string[],
  dateTo: [] as string[]
});

// Error snackbar
const showErrorSnackbar = ref(false);
const errorMessage = ref('');

// Check if there are date validation errors
const hasDateValidationErrors = computed(() => {
  return dateValidationErrors.value.dateFrom.length > 0 || dateValidationErrors.value.dateTo.length > 0;
});

// Date validation function
const validateDates = () => {
  // Reset errors
  dateValidationErrors.value.dateFrom = [];
  dateValidationErrors.value.dateTo = [];

  // Check if both dates are provided
  if (filterModel.dateFrom && filterModel.dateTo) {
    const fromDate = new Date(filterModel.dateFrom);
    const toDate = new Date(filterModel.dateTo);

    // Check if dateFrom is after dateTo
    if (fromDate > toDate) {
      dateValidationErrors.value.dateFrom = ['تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد'];
      dateValidationErrors.value.dateTo = ['تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد'];
    }
  }
};

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    Object.assign(filterModel, newValue);
  }
}, { immediate: true, deep: true });

// Watch for date changes to validate
watch([() => filterModel.dateFrom, () => filterModel.dateTo], () => {
  validateDates();
}, { deep: true });

// Clear all filters
const clearFilters = () => {
  Object.keys(filterModel).forEach(key => {
    filterModel[key as keyof FilterModel] = '';
  });
  // Clear validation errors
  dateValidationErrors.value.dateFrom = [];
  dateValidationErrors.value.dateTo = [];
  emit('update:modelValue', { ...filterModel });
  emit('apply', { ...filterModel });
};

// Apply filters
const applyFilters = () => {
  // Validate dates before applying
  validateDates();
  
  // Check if there are validation errors
  if (hasDateValidationErrors.value) {
    // Show error message in snackbar
    errorMessage.value = 'لطفاً تاریخ‌ها را صحیح وارد کنید. تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.';
    showErrorSnackbar.value = true;
    return;
  }
  
  // Apply filters if validation passes
  emit('update:modelValue', { ...filterModel });
  emit('apply', { ...filterModel });
};
</script>

<style scoped>
.filter-cartable {
  padding: 16px;
}

.gap-2 {
  gap: 8px;
}
</style> 