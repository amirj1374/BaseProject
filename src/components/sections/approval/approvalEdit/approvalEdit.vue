<template>
  <div class="filter-cartable">
    <v-row>
      <!-- Created By Filter -->
      <v-col cols="12" md="6">
        <v-text-field
          v-model="filterModel.cif"
          label="شماره مشتری"
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

      <!-- Status Filter -->
      <v-col cols="12" md="6">
        <v-select
          v-model="filterModel.status"
          :items="LoanRequestStatusOptions"
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
        <v-btn color="error" variant="outlined" @click="clearFilters"> پاک کردن فیلترها </v-btn>
        <v-btn color="primary" @click="applyFilters"> اعمال فیلتر </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { LoanRequestStatusOptions } from '@/types/enums/global';
import { reactive, watch } from 'vue';

interface FilterModel {
  dateFrom: string;
  dateTo: string;
  cif: string;
  trackingCode: string;
  roleName: string;
  status: string;
}

const props = defineProps<{
  modelValue?: Partial<FilterModel>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FilterModel];
  apply: [value: FilterModel];
}>();

// Filter model
const filterModel = reactive<FilterModel>({
  dateFrom: '',
  dateTo: '',
  cif: '',
  trackingCode: '',
  roleName: '',
  status: ''
});

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.assign(filterModel, newValue);
    }
  },
  { immediate: true, deep: true }
);

// Clear all filters
const clearFilters = () => {
  Object.keys(filterModel).forEach((key) => {
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
