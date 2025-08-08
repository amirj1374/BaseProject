<template>
  <div class="action-type-form">
    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="formData.fromDepartmentLevel"
          :items="DepartmentTypeOptions"
          item-title="title"
          item-value="value"
          label="دپارتمان مبدا"
          variant="outlined"
          density="comfortable"
          :rules="[required]"
          @update:model-value="updateForm"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="formData.toDepartmentLevel"
          :items="DepartmentTypeOptions"
          item-title="title"
          item-value="value"
          label="دپارتمان مقصد"
          variant="outlined"
          density="comfortable"
          :rules="[required]"
          @update:model-value="updateForm"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="formData.fromRole"
          :items="roleOptions"
          item-title="description"
          item-value="code"
          label="نقش مبدا"
          variant="outlined"
          density="comfortable"
          :rules="[required]"
          @update:model-value="updateForm"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="formData.toRole"
          :items="roleOptions"
          item-title="description"
          item-value="code"
          label="نقش مقصد"
          variant="outlined"
          density="comfortable"
          :rules="[required]"
          @update:model-value="updateForm"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="formData.actionType"
          :items="ActionTypeOptions"
          item-title="title"
          item-value="value"
          label="نوع عملیات"
          variant="outlined"
          density="comfortable"
          :rules="[required]"
          @update:model-value="updateForm"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { api } from '@/services/api';
import { ActionTypeOptions, DepartmentTypeOptions } from '@/types/enums/global';
import { ref, reactive, watch, defineProps, defineEmits, onMounted } from 'vue';
import { useBaseStore } from '@/stores/base';
import type { SamapRoleDTO } from '@/types/cartable/cartableTypes';
const roleOptions = ref<SamapRoleDTO[]>([]);
const baseStore = useBaseStore();

interface FormData {
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
  modelValue?: Partial<FormData>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FormData];
}>();

// Form validation
const required = (v: any) => !!v || 'این فیلد الزامی است';

// Form data
const formData = reactive<FormData>({
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
      Object.assign(formData, newValue);
    }
  },
  { immediate: true, deep: true }
);

// Emit form updates
const updateForm = () => {
  emit('update:modelValue', { ...formData });
};

// Watch form data changes and emit updates
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', { ...newValue });
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.action-type-form {
  padding: 16px;
}
</style>
