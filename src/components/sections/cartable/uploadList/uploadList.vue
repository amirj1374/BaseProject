<script setup lang="ts">
import { ref, watch } from 'vue';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { RelationTypeOptions } from '@/types/enums/global';

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

const props = defineProps({
  loanRequestId: {
    type: String,
    required: true
  },
  cartableId: {
    type: String,
    required: true
  },
  trackingCode: {
    type: String,
    required: true
  },
  item: {
    type: Object,
    required: false,
    default: null
  }
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const docs = ref<Document[]>([]);
const error = ref<string | null>(null);
const showError = ref(false);

// Watch for error changes
watch(error, (newError) => {
  showError.value = !!newError;
});

// Removed upload and image dialog refs since we only show download buttons
const dataTableRef = ref();

// Group header template function to show nationalCode and fullName
const getGroupHeaderTemplate = (groupKey: string | number, groupItems: any[]): string => {
  if (groupItems.length > 0) {
    const firstItem = groupItems[0];
    return ` نام و نام خانوادگی :  ${firstItem.fullName}  -  کد ملی : ${firstItem.nationalCode} (${groupItems.length} مدرک)`;
  }
  return `${groupKey} (${groupItems.length} مدرک)`;
};

const headers = [
  { title: 'مدرک', key: 'relationType', translate: true, options: RelationTypeOptions },
  { title: 'عنوان مدرک', key: 'fileName', width: 500 }
];
// Removed handleUpload function since we only show download buttons

const handleView = (doc: Document) => {
  if (doc.filePath) {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = doc.filePath;
    link.download = doc.fileTitle || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Removed handleFileUpload function since we only show download buttons

function getCustomButtons(doc: Document) {
  const hasFile = !!doc.filePath;
  return [
    {
      label: 'دانلود فایل',
      color: 'success',
      onClick: () => handleView(doc),
      disabled: !hasFile
    }
  ];
}
// Removed image handling functions since we only show download buttons

const submitData = async () => {
  return Promise.resolve();
};

defineExpose({ submitData });
</script>

<template>
  <div class="approval-section">
    <div class="upload-form">
      <CustomDataTable
        ref="dataTableRef"
        :headers="headers"
        api-resource="general/get-all-doc"
        :query-params="{ loanRequestId: props.loanRequestId }"
        :show-refresh-button="true"
        :auto-fetch="true"
        :show-pagination="true"
        :height="600"
        group-by="groupByItem"
        :default-expanded="true"
        :page-size="150"
        :custom-buttons-fn="getCustomButtons"
        :group-header-template="getGroupHeaderTemplate"
      />
    </div>
  </div>

  <!-- Removed image dialog since we only show download buttons -->

  <v-snackbar v-model="showError" color="error" timeout="5500">
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

/* Removed image-related CSS since we only show download buttons */
</style>
