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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';
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
  { title: 'فعال', value: 'ACTIVE' },
  { title: 'غیرفعال', value: 'INACTIVE' },
  { title: 'در انتظار', value: 'PENDING' },
  { title: 'تکمیل شده', value: 'COMPLETED' },
  { title: 'رد شده', value: 'REJECTED' }
]);

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    Object.assign(filterModel, newValue);
  }
}, { immediate: true, deep: true });

// Clear all filters
const clearFilters = () => {
  Object.keys(filterModel).forEach(key => {
    filterModel[key as keyof FilterModel] = '';
  });
  emit('update:modelValue', { ...filterModel });
  emit('apply', { ...filterModel });
};

// Apply filters
const applyFilters = () => {
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