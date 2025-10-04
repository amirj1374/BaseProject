<template>
  <div class="action-type-form">
    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="filterModel.fromDepartmentLevel"
          :items="DepartmentTypeOptions"
          item-title="title"
          item-value="value"
          label="دپارتمان مبدا"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="filterModel.toDepartmentLevel"
          :items="DepartmentTypeOptions"
          item-title="title"
          item-value="value"
          label="دپارتمان مقصد"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="filterModel.fromRole"
          :items="roleOptions"
          item-title="description"
          item-value="name"
          label="نقش مبدا"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="filterModel.toRole"
          :items="roleOptions"
          item-title="description"
          item-value="name"
          label="نقش مقصد"
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="filterModel.actionType"
          :items="ActionTypeOptions"
          item-title="title"
          item-value="value"
          label="نوع عملیات"
          variant="outlined"
          density="comfortable"
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
import { api } from '@/services/api';
import { ActionTypeOptions, DepartmentTypeOptions } from '@/types/enums/global';
import { ref, reactive, watch, defineProps, defineEmits, onMounted } from 'vue';
import type { SamapRoleDTO } from '@/types/cartable/cartableTypes';
const roleOptions = ref<SamapRoleDTO[]>([]);

interface FilterModel {
  fromDepartmentLevel: string;
  toDepartmentLevel: string;
  toRole: string;
  fromRole: string;
  actionType: string;
}

onMounted(async () => {
  const roles = await api.cartable.getSamapRole();
  roleOptions.value.push(...roles.data);
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
  fromDepartmentLevel: '',
  toDepartmentLevel: '',
  fromRole: '',
  toRole: '',
  actionType: '',
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
