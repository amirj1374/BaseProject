<template>
  <div class="action-type-form">
    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="formData.fromRole"
          :items="roleOptions"
          item-title="title"
          item-value="value"
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
          item-title="title"
          item-value="value"
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
          :items="actionTypeOptions"
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
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';

interface FormData {
  fromRole: string;
  toRole: string;
  actionType: string;
}

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
  fromRole: '',
  toRole: '',
  actionType: ''
});

// Mock data - replace with actual API calls
const roleOptions = ref([
  { title: 'مدیر سیستم', value: 'SYSTEM_ADMIN' },
  { title: 'کاربر عادی', value: 'REGULAR_USER' },
  { title: 'مدیر دپارتمان', value: 'DEPARTMENT_MANAGER' },
  { title: 'کارشناس', value: 'EXPERT' }
]);

const actionTypeOptions = ref([
  { title: 'تایید', value: 'APPROVE' },
  { title: 'رد', value: 'REJECT' },
  { title: 'بازگشت', value: 'RETURN' },
  { title: 'ارجاع', value: 'REFER' }
]);

// Update form when modelValue changes (for editing)
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    Object.assign(formData, newValue);
  }
}, { immediate: true, deep: true });

// Emit form updates
const updateForm = () => {
  emit('update:modelValue', { ...formData });
};

// Watch form data changes and emit updates
watch(formData, (newValue) => {
  emit('update:modelValue', { ...newValue });
}, { deep: true });
</script>

<style lang="scss" scoped>
.action-type-form {
  padding: 16px;
}
</style>