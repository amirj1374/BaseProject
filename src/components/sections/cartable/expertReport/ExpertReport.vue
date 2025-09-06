<template>
  <div class="approval-section">
    <v-form ref="formRef" @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12">
          <v-file-input
            v-model="selectedFile"
            variant="outlined"
            label="انتخاب فایل"
            accept=".pdf,.jpg,.jpeg,.png"
            :loading="loading"
            :disabled="loading"
            :rules="[required]"
            prepend-icon="mdi-paperclip"
            show-size
          />
        </v-col>
        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="!selectedFile"
          >
            ارسال فایل
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccess" color="success" timeout="3000" location="top">
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { api } from '@/services/api';

interface Props {
  cartableId?: string | number;
  item?: any;
  onSuccess?: () => void;
}

const selectedFile = ref<File | null>(null);
const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

// Get cartableId from either direct prop or from item
const cartableId = computed((): string | number | undefined => {
  const id = props.cartableId || props.item?.id;
  console.log('ExpertReport - cartableId computed:', {
    propsCartableId: props.cartableId,
    itemId: props.item?.id,
    finalId: id
  });
  return id;
});

// Form validation
const formRef = ref();
const required = (value: File | null) => !!value || 'انتخاب فایل الزامی است';

// Loading and UI states
const loading = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Submit form
const submitForm = async () => {
  const { valid } = await formRef.value?.validate();

  if (!valid) {
    return;
  }

  if (!selectedFile.value) {
    errorMessage.value = 'لطفاً فایل را انتخاب کنید';
    showError.value = true;
    return;
  }

  try {
    loading.value = true;

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('cartableId', String(cartableId.value));

    const response = await api.cartable.submitExpertReport(formData);

    if (response.status === 200) {
      successMessage.value = 'فایل با موفقیت ارسال شد';
      showSuccess.value = true;
      props.onSuccess?.();
      emit('close');
    } else {
      throw new Error(response.statusText || 'خطا در ارسال فایل');
    }
  } catch (error: any) {
    console.error('Error submitting expert report:', error);
    errorMessage.value = error?.message || 'خطا در ارسال فایل';
    showError.value = true;
  } finally {
    loading.value = false;
  }
};

// Expose submitData method for parent component to call
const submitData = async () => {
  console.log('submitData called with cartableId:', cartableId.value);

  if (!cartableId.value) {
    throw new Error('شناسه کارتابل یافت نشد');
  }

  if (!selectedFile.value) {
    throw new Error('لطفاً فایل را انتخاب کنید');
  }

  const { valid } = await formRef.value?.validate();

  if (!valid) {
    throw new Error('لطفاً خطاهای فرم را برطرف کنید');
  }

  try {
    console.log('Submitting file:', selectedFile.value);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('cartableId', String(cartableId.value));

    const response = await api.cartable.submitExpertReport(formData);

    console.log('API response:', response);

    if (response.status === 200) {
      console.log('Expert report submitted successfully');
      return true;
    } else {
      throw new Error(response.statusText || 'خطا در ارسال فایل');
    }
  } catch (error: any) {
    console.error('Error submitting expert report:', error);
    throw new Error(error?.message || 'خطا در ارسال فایل');
  }
};

// Expose methods to parent component
defineExpose({
  submitData
});
</script>

<style scoped>
.approval-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>
