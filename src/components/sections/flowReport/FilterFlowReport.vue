<template>
  <div class="action-type-form">
    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="filterModel.trackingCode"
          label="کد رهگیری"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="6">
        <ShamsiDatePicker
          v-model="filterModel.creationDate"
          label="تاریخ ایجاد"
          variant="outlined"
          density="comfortable"
          mode="single"
          format="YYYY-MM-DD"
          displayFormat="jYYYY/jMM/jDD"
          emitWithTimezone
        />
      </v-col>
    </v-row>
    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="filterModel.customerCode"
          label="کد مشتری"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="filterModel.customerName"
          label="نام مشتری"
          variant="outlined"
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
import { reactive, watch, defineProps, defineEmits, onMounted } from 'vue';
import ShamsiDatePicker from '@/components/shared/ShamsiDatePicker.vue';

interface FilterModel {
  trackingCode: string
  creationDate: string
  customerCode: string
  customerName: string
}

onMounted(async () => {

});

const props = defineProps<{
  modelValue?: Partial<FilterModel>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FilterModel];
  'apply': [value: FilterModel];
}>();

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
// Form data
const filterModel = reactive<FilterModel>({
  trackingCode: '',
  creationDate: '',
  customerCode: '',
  customerName: ''
});

// Update form when modelValue changes (for editing)
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.assign(filterModel, newValue);
    }
  },
  { immediate: true, deep: true }
);

// Note: Filters are only applied when the apply button is clicked
</script>

<style lang="scss" scoped>
.action-type-form {
  padding: 16px;
}
</style>
