<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { BooleanEnumOptions, RelationTypeOptions } from '@/types/enums/global';

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
const showImageDialog = ref(false);
const imageDialogUrl = ref<string | null>(null);
const dataTableRef = ref();

function fixUrl(url: string): string {
  return url.replace(/(https?:\/\/[^:]+:\d+)(?!\/)/, '$1/');
}

function openImageDialog(url: string) {
  imageDialogUrl.value = fixUrl(url);
  showImageDialog.value = true;
}

const headers = [
  { title: 'نام و نام خانوادگی', key: 'fullName' },
  { title: 'کد ملی', key: 'nationalCode' },
  { title: 'نوع', key: 'relationType', translate: true, options: RelationTypeOptions },
  { title: 'عنوان مدرک', key: 'fileTitle' },
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
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('customerNumber', selectedDoc.value.nationalCode);
    formData.append('docTypeCode', selectedDoc.value.fileType);
    formData.append('description', selectedDoc.value.description || 'asdasdasd');
    formData.append('loanRequestId', selectedDoc.value.loanRequestId.toString());

    const response = await api.approval.saveDoc(formData);

    if (response.status === 200) {
      // Update the document in the list
      const updatedDocs = docs.value.map((d) => {
        if (d.nationalCode === selectedDoc.value?.nationalCode && d.fileType === selectedDoc.value?.fileType) {
          return { ...d, file: response.data.fileUrl };
        }
        return d;
      });
      docs.value = updatedDocs;
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
  }
};

function getCustomButtons(doc: Document) {
  const hasImage = !!(doc.file && doc.file.match(/\.(jpg|jpeg|png)$/i));
  const hasFile = !!doc.file;
  return [
    {
      label: hasFile ? 'ویرایش' : 'آپلود',
      color: hasFile ? 'warning' : 'secondary',
      onClick: () => handleUpload(doc)
    },
    {
      label: 'مشاهده تصویر مدرک',
      color: 'primary',
      onClick: () => {
        if (hasImage) openImageDialog(doc.file!);
      },
      disabled: !hasImage
    }
  ];
}
const submitData = async () => {
  return Promise.resolve();
};
defineExpose({ submitData });
</script>

<template>
  <form @submit.prevent="submitData" class="upload-form">
    <CustomDataTable
      ref="dataTableRef"
      :headers="headers"
      api-resource="general/get-all-doc"
      :query-params="{ loanRequestId: approvalStore.loanRequestId }"
      :auto-fetch="true"
      :show-pagination="true"
      :custom-buttons-fn="getCustomButtons"
      :height="500"
    />
  </form>

  <v-dialog v-model="showUploadDialog" max-width="500px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>آپلود مدرک</span>
        <v-btn variant="text" @click="showUploadDialog = false">
          <v-icon>mdi-close</v-icon>
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
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text style="text-align: center;" mini-variant>
        <img v-if="imageDialogUrl" :src="imageDialogUrl" alt="تصویر" style="max-width: 100%; max-height: 400px; border-radius: 8px;" />
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
</style>
