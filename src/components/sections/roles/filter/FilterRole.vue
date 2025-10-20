<script setup lang="ts">
import { api } from '@/services/api';
import apiService from '@/services/apiService';
import axiosInstance from '@/services/axiosInstance';
import { onMounted, ref, watch } from 'vue';
import { IconDeviceFloppy, IconX } from '@tabler/icons-vue';

const emit = defineEmits(['close']);

const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbar = ref<boolean>(false);
const error = ref<string>('');
const lotusRoles = ref<any[]>([]);
const selectedLotusRoles = ref<any[]>([]);
const minUserNumber = ref('');
const maxUserNumber = ref('');
const props = defineProps<{
  item: any;
  onSuccess?: () => void;
}>();

const id = ref(props.item?.id ?? '');
const description = ref('');
const loading = ref(false);

// Form validation
const required = (v: any) => !!v || 'این فیلد الزامی است';

// Initialize form data when item changes
const initializeFormData = () => {
  if (props.item) {
    minUserNumber.value = props.item.minUserNumber;
    maxUserNumber.value = props.item.maxUserNumber;
    // Set existing lotus roles if available
    if (props.item.lotusRoles && Array.isArray(props.item.lotusRoles)) {
      selectedLotusRoles.value = props.item.lotusRoles;
    } else {
      selectedLotusRoles.value = [];
    }
    
    // Set description if available
    if (props.item.description) {
      description.value = props.item.description;
    }
  }
};

const getLotusRoles = async () => {
  try {
    const response = await api.cartable.getLotusRole();
    if (response.status === 200) {
      lotusRoles.value = response.data;
    }
  } catch (err: any) {
    console.error('Error fetching lotus roles:', err);
    error.value = 'خطا در دریافت نقش‌های لوتوسی';
    snackbarMessage.value = error.value;
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
};

const submitForm = async () => {
  try {
    loading.value = true;
    error.value = '';

    // Normalize selection to an array of objects (always array of objects)
    const rawSelection = selectedLotusRoles.value as unknown;
    const normalizedSelection: any[] = Array.isArray(rawSelection)
      ? rawSelection
      : rawSelection != null
        ? [rawSelection]
        : [];

    const lotusRolesPayload: Array<{ id: string | number; [key: string]: any }> = normalizedSelection
      .map((r: any) => (typeof r === 'object' ? r : { id: r }))
      .filter(Boolean);

    // Validate form
    if (lotusRolesPayload.length === 0) {
      error.value = 'لطفا حداقل یک نقش لوتوسی انتخاب کنید';
      snackbarMessage.value = error.value;
      snackbarColor.value = 'error';
      snackbar.value = true;
      return;
    }

    // Prepare update payload (always array of objects)
    const updatePayload = {
      id: id.value,
      lotusRoles: lotusRolesPayload,
      minUserNumber: minUserNumber.value,
      maxUserNumber: maxUserNumber.value,
    };

    // Call update API using the department-role resource
    const response = await apiService(axiosInstance, 'department-role').update(updatePayload);
    
    if (response.status === 200) {
      snackbarMessage.value = 'نقش با موفقیت بروزرسانی شد';
      snackbarColor.value = 'success';
      snackbar.value = true;
      
      // Call success callback if provided
      props.onSuccess?.();
      
      // Close the dialog
      emit('close');
    } else {
      new Error(response.statusText || 'خطا در بروزرسانی نقش');
    }
  } catch (err: any) {
    console.error('Error updating role:', err);
    error.value = err?.response?.data?.message || err?.message || 'خطا در بروزرسانی نقش';
    snackbarMessage.value = error.value;
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};

// Watch for item changes and initialize form
watch(() => props.item, initializeFormData, { immediate: true });

onMounted(async () => {
  await getLotusRoles();
  initializeFormData();
});
</script>

<template>
  <form @submit.prevent="submitForm">
    <v-row>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="props.item.departmentLevelName"
          label="دپارتمان"
          variant="outlined"
          readonly
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="props.item.samapRole.description"
          label="نقش سماپی"
          variant="outlined"
          readonly
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="selectedLotusRoles"
          :items="lotusRoles"
          item-title="description"
          item-value="id"
          label="نقش لوتوسی"
          variant="outlined"
          density="comfortable"
          return-object
          :multiple="props.item.isLotusMultipleRoleAllowed"
          :rules="[required]"
          :error-messages="error"
          clearable
          placeholder="نقش‌های لوتوسی را انتخاب کنید"
          :disabled="props.item.canAssignLotusRole === false"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="minUserNumber"
          label="حداقل تعداد کاربران"
          variant="outlined"
          type="number"
          density="comfortable"
          :disabled="props.item.canSetMinMaxUser === false"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="maxUserNumber"
          label="حداکثر تعداد کاربران"
          variant="outlined"
          type="number"
          density="comfortable"
          :disabled="props.item.canSetMinMaxUser === false"

        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="12" class="d-flex justify-center gap-3">
        <v-btn 
          type="submit" 
          color="primary" 
          :loading="loading"
          :disabled="!selectedLotusRoles || selectedLotusRoles.length === 0"
        >
          <IconDeviceFloppy size="16" class="ml-1" />
          بروزرسانی نقش
        </v-btn>
        <v-btn 
          color="grey" 
          variant="outlined"
          @click="emit('close')"
          :disabled="loading"
        >
          <IconX size="16" class="ml-1" />
          انصراف
        </v-btn>
      </v-col>
    </v-row>
  </form>
  
  <!-- Success/Error Messages -->
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="top">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<style scoped>
.gap-3 {
  gap: 12px;
}

:deep(.v-field--readonly .v-field__input) {
  color: #666;
}

:deep(.v-textarea .v-field__input) {
  min-height: 80px;
}
</style>