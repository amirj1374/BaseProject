<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { IconX } from '@tabler/icons-vue';

interface Document {
  nationalCode: string;
  fullName: string;
  relationType: 'ASKER' | 'GUARANTOR';
  fileType: string;
  fileTitle: string;
  description: string | null;
  filePath: string | null;
  loanRequestId: number;
}

const docs = ref<Document[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const approvalStore = useApprovalStore();
const showUploadDialog = ref(false);
const selectedDoc = ref<Document | null>(null);
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const showImageDialog = ref(false);
const imageDialogUrl = ref<string | null>(null);
const dataTableRef = ref();

function fixUrl(url: string): string {
  // Handle different URL formats
  if (!url) return '';

  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative path, prepend the base URL
  if (url.startsWith('/')) {
    // You might need to adjust this base URL based on your API configuration
    return `${window.location.origin}${url}`;
  }

  // For other cases, try to fix common issues
  return url.replace(/(https?:\/\/[^:]+:\d+)(?!\/)/, '$1/');
}

function openImageDialog(url: string) {
  if (!url) {
    error.value = 'آدرس تصویر نامعتبر است';
    return;
  }

  const fixedUrl = fixUrl(url);

  // Test if the image can be loaded
  const img = new Image();
  img.onload = () => {
    imageDialogUrl.value = fixedUrl;
    showImageDialog.value = true;
    error.value = null;
  };

  img.onerror = () => {
    console.error('Failed to load image:', fixedUrl);
    error.value = 'تصویر قابل بارگذاری نیست. لطفا آدرس را بررسی کنید.';
    // Still show the dialog but with error message
    imageDialogUrl.value = fixedUrl;
    showImageDialog.value = true;
  };

  img.src = fixedUrl;
}

const headers = [
  { title: 'عنوان مدرک', key: 'fileName' },
  { title: 'توضیحات', key: 'description' }
];
const handleUpload = (doc: Document) => {
  selectedDoc.value = doc;
  showUploadDialog.value = true;
};

const handleEdit = (doc: Document) => {
  // Prevent edit when status is CORRECT_FROM_REGION
  if (approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION') {
    error.value = 'امکان ویرایش در این مرحله وجود ندارد';
    return;
  }
  
  selectedDoc.value = doc;
  showUploadDialog.value = true;
};

const handleFileUpload = async () => {
  if (!selectedFile.value || !selectedDoc.value) return;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('customerNumber', selectedDoc.value.nationalCode);
    formData.append('docTypeCode', selectedDoc.value.fileType);
    formData.append('description', selectedDoc.value.description || 'asdasdasd');
    formData.append('loanRequestId', selectedDoc.value.loanRequestId.toString());

    const response = await api.approval.saveDoc(formData);

    if (response.status === 200) {
      // Update the document in the list

      docs.value = docs.value.map((d) => {
        if (d.nationalCode === selectedDoc.value?.nationalCode && d.fileType === selectedDoc.value?.fileType) {
          return { ...d, file: response.data.fileUrl };
        }
        return d;
      });
      showUploadDialog.value = false;
      selectedFile.value = null;
      // Refresh the data table
      if (dataTableRef.value && typeof dataTableRef.value.fetchData === 'function') {
        dataTableRef.value.fetchData();
      }
    }
  } catch (err: any) {
    error.value = err.message || 'خطا در آپلود فایل';
  } finally {
    uploading.value = false;
    selectedFile.value = null;
  }
};

function getCustomButtons(doc: Document) {
  const hasImage = !!(doc.filePath && doc.filePath.match(/\.(jpg|jpeg|png|pdf)$/i));
  const hasFile = !!doc.filePath;
  const isEditDisabled = approvalStore.loanRequestStatus === 'CORRECT_FROM_REGION';
  
  const buttons = [];
  
  // Upload button (always enabled)
  if (!hasFile) {
    buttons.push({
      label: 'آپلود',
      color: 'secondary',
      onClick: () => handleUpload(doc),
      disabled: false
    });
  }
  
  // Edit button (disabled when condition is met)
  if (hasFile) {
    buttons.push({
      label: 'ویرایش',
      color: 'secondary',
      onClick: () => handleEdit(doc),
      disabled: isEditDisabled
    });
  }
  
  // View image button
  buttons.push({
    label: 'مشاهده تصویر مدرک',
    color: 'primary',
    onClick: () => {
      if (hasImage) openImageDialog(doc.filePath!);
    },
    disabled: !hasImage
  });
  
  return buttons;
}
// Image handling functions
const handleImageError = () => {
  error.value = 'تصویر قابل بارگذاری نیست. لطفا آدرس را بررسی کنید.';
};

const handleImageLoad = () => {
  error.value = null;
};

const openInNewTab = () => {
  if (imageDialogUrl.value) {
    window.open(imageDialogUrl.value, '_blank');
  }
};

const submitData = async () => {
  return Promise.resolve();
};

// Group header template function to show nationalCode and fullName
const getGroupHeaderTemplate = (groupKey: string | number, groupItems: any[]): string => {
  if (groupItems.length > 0) {
    const firstItem = groupItems[0];
    return ` نام و نام خانوادگی :  ${firstItem.fullName}  -  کد ملی : ${firstItem.nationalCode} (${groupItems.length} مدرک)`;
  }
  return `${groupKey} (${groupItems.length} مدرک)`;
};

defineExpose({ submitData });
</script>

<template>
  <div class="approval-section">
    <form @submit.prevent="submitData" class="upload-form">
      <CustomDataTable
        ref="dataTableRef"
        :headers="headers"
        api-resource="general/get-all-doc"
        :query-params="{ loanRequestId: approvalStore.loanRequestId }"
        :show-refresh-button="true"
        :auto-fetch="true"
        :show-pagination="true"
        :custom-buttons-fn="getCustomButtons"
        :height="1500"
        group-by="groupByItem"
        :default-expanded="true"
        :page-size="100"
        :group-header-template="getGroupHeaderTemplate"
      />
    </form>
  </div>

  <v-dialog v-model="showUploadDialog" max-width="500px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>آپلود مدرک</span>
        <v-btn variant="text" @click="showUploadDialog = false">
          <IconX size="16" />
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-file-input v-model="selectedFile" label="انتخاب فایل" accept=".pdf,.jpg,.jpeg,.png" :loading="uploading" :disabled="uploading" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :loading="uploading" :disabled="!selectedFile || uploading" @click="handleFileUpload" variant="outlined">
          آپلود
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showImageDialog" max-width="1500px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>نمایش تصویر</span>
        <v-btn variant="text" @click="showImageDialog = false">
          <IconX size="16" />
        </v-btn>
      </v-card-title>
      <v-card-text style="text-align: center" mini-variant>
        <div v-if="imageDialogUrl" class="image-container">
          <img
            :src="imageDialogUrl"
            alt="تصویر"
            style="max-width: 100%; max-height: 400px; border-radius: 8px"
            @error="handleImageError"
            @load="handleImageLoad"
          />
          <div v-if="error" class="error-message mt-3">
            <v-alert type="error" variant="tonal">
              {{ error }}
            </v-alert>
            <v-btn color="primary" variant="outlined" @click="openInNewTab" class="mt-2"> باز کردن در تب جدید </v-btn>
          </div>
        </div>
        <div v-else class="loading-container">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-2">در حال بارگذاری تصویر...</p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="error" color="error" timeout="5500">
    {{ error }}
  </v-snackbar>
</template>
<style scoped>
.upload-form {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.error-message {
  max-width: 400px;
  text-align: center;
}
</style>
