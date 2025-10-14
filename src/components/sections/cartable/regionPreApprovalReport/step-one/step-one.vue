<template>
  <div class="approval-section">
    <v-form ref="formRef">
      <v-row>
        <v-col cols="12">
          <v-textarea
            v-model="formData.templateBody"
            label="متن پیشنهاد اعتباری"
            placeholder="متن پیشنهاد اعتباری را وارد کنید..."
            variant="outlined"
            :rows="8"
            :maxlength="2000"
            counter
            :rules="[required]"
            auto-grow
          />
        </v-col>
      </v-row>
    </v-form>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2" :icon="icons.checkCircle"></v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2" :icon="icons.alertCircle"></v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import DescriptionInput from '@/components/shared/DescriptionInput.vue';
import { icons } from '@/plugins/mdi-icon';

interface Props {
  cartableId?: string | number;
  loanRequestId?: string;
  currentStep?: number;
  totalSteps?: number;
  onSuccess?: () => void;
}

interface CreditSuggestionData {
  templateBody: string;
  conditions: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

// Form data
const formData = ref<CreditSuggestionData>({
  templateBody: '',
  conditions: ''
});

// Form validation
const formRef = ref();
const required = (value: string) => !!value || 'این فیلد الزامی است';

// Loading and UI states
const loading = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Fetch existing data
const fetchData = async () => {
  if (!props.cartableId) return;

  try {
    loading.value = true;
    const response = await api.cartable.getCreditSuggestion(String(props.cartableId));

    if (response.status === 200 && response.data) {
      formData.value = {
        templateBody: response.data.templateBody || '',
        conditions: response.data.conditions || ''
      };
    }
  } catch (error: any) {
    console.error('Error fetching credit suggestion:', error);
    // Don't show error for GET request if no data exists
  } finally {
    loading.value = false;
  }
};

// Submit form

// Load data on mount
onMounted(() => {
  fetchData();
});

// Expose submitData method for parent component to call
const submitData = async () => {
  console.log('submitData called with cartableId:', props.cartableId);

  if (!props.cartableId) {
    throw new Error('شناسه کارتابل یافت نشد');
  }

  const { valid } = await formRef.value?.validate();

  if (!valid) {
    throw new Error('لطفاً خطاهای فرم را برطرف کنید');
  }

  try {
    const payload = {
      cartableId: Number(props.cartableId),
      description: formData.value.templateBody,
    };

    console.log('Submitting payload:', payload);

    const response = await api.cartable.submitCreditSuggestionDescription(payload);

    console.log('API response:', response);

    if (response.status === 200) {
      console.log('Credit suggestion submitted successfully');
      // Don't show success message or close dialog when called from parent
      // Just return success
      return true;
    } else {
      throw new Error(response.statusText || 'خطا در ذخیره اطلاعات');
    }
  } catch (error: any) {
    console.error('Error submitting credit suggestion:', error);
    throw new Error(error?.message || 'خطا در ذخیره پیشنهاد اعتباری');
  }
};

// Expose methods to parent component
defineExpose({
  submitData
});
</script>

<style scoped>
.credit-suggestion-form {
  max-width: 800px;
  margin: 0 auto;
}

.v-card-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}
</style>
