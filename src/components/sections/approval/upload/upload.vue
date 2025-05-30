<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';

interface Document {
  nationalCode: string;
  fullName: string;
  relationType: 'ASKER' | 'GUARANTOR';
  fileType: string;
  fileTitle: string;
  description: string | null;
  file: string | null;
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

const headers = [
  { title: 'نام و نام خانوادگی', key: 'fullName' },
  { title: 'کد ملی', key: 'nationalCode' },
  { title: 'نوع', key: 'relationType' },
  { title: 'عنوان مدرک', key: 'fileTitle' },
  { title: 'وضعیت', key: 'status' },
];
const handleUpload = (doc: Document) => {
  selectedDoc.value = doc;
  showUploadDialog.value = true;
};

const handleView = (doc: Document) => {
  if (doc.file) {
    window.open(doc.file, '_blank');
  }
};

const handleFileUpload = async () => {
  if (!selectedFile.value || !selectedDoc.value) return;

  try {
    uploading.value = true;
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('customerNumber', selectedDoc.value.nationalCode);
    formData.append('docTypeCode', selectedDoc.value.fileType);
    formData.append('description', selectedDoc.value.description || '');
    formData.append('loanRequestId', selectedDoc.value.loanRequestId.toString());

    const response = await api.approval.saveDoc(formData);
    
    if (response.status === 200) {
      // Update the document in the list
      const updatedDocs = docs.value.map(d => {
        if (d.nationalCode === selectedDoc.value?.nationalCode && d.fileType === selectedDoc.value?.fileType) {
          return { ...d, file: response.data.fileUrl };
        }
        return d;
      });
      docs.value = updatedDocs;
      showUploadDialog.value = false;
      selectedFile.value = null;
    }
  } catch (err: any) {
    error.value = err.message || 'خطا در آپلود فایل';
  } finally {
    uploading.value = false;
  }
};

// Custom button action for inquiry
const customButtons = ref([
  {
    label: 'آپلود',
    color: 'secondary',
    onClick: handleUpload
  }
]);
const submitData = async () => {
  return Promise.resolve();
};
defineExpose({ submitData });
const getRelationTypeText = (type: string) => {
  return type === 'ASKER' ? 'متقاضی' : 'ضامن';
};
</script>

<template>
  <v-card variant="flat">
    <form @submit.prevent="submitData">
      <CustomDataTable
        :headers="headers"
        api-resource="general/get-all-doc"
        :query-params="{ loanRequestId: approvalStore.loanRequestId}"
        :auto-fetch="true"
        :show-pagination="true"
        :custom-buttons="customButtons"
      />
    </form>

    <v-dialog
      v-model="showUploadDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>آپلود مدرک</span>
          <v-btn
            icon
            variant="text"
            @click="showUploadDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-file-input
            v-model="selectedFile"
            label="انتخاب فایل"
            accept=".pdf,.jpg,.jpeg,.png"
            :loading="uploading"
            :disabled="uploading"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            :loading="uploading"
            :disabled="!selectedFile || uploading"
            @click="handleFileUpload"
          >
            آپلود
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="error" color="error" timeout="5500">
      {{ error }}
    </v-snackbar>
  </v-card>
</template>
