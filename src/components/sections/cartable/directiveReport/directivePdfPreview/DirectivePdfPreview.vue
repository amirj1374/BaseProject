<template>
  <div class="pdf-preview">

    <!-- PDF Viewer -->
    <PdfViewer
      v-if="pdfUrl"
      :src="pdfUrl"
      :title="pdfTitle"
      :width="'100%'"
      :height="800"
      :show-header="true"
      :show-footer="true"
      :show-zoom-controls="true"
      :show-navigation-controls="true"
      :show-download="true"
      :show-print="true"
      :show-fullscreen="true"
      :download-file-name="downloadFileName"
      :loading-text="'در حال بارگذاری گزارش...'"
      :error-title="'خطا در بارگذاری گزارش'"
      @load="onPdfLoad"
      @error="onPdfError"
      @download="onPdfDownload"
      @print="onPdfPrint"
    />
    <!-- Action Buttons -->
    <div class="pdf-actions">
      <v-btn
        color="primary"
        @click="generatePdf"
        :loading="generating"
        :disabled="!props.loanRequestId"
      >
        {{ pdfUrl ? 'تولید مجدد گزارش PDF' : 'تولید گزارش PDF' }}
      </v-btn>

      <v-btn
        color="secondary"
        @click="downloadPdf"
        :disabled="!pdfUrl"
        :loading="downloading"
      >
        دانلود گزارش
      </v-btn>

      <v-btn
        color="success"
        @click="printPdf"
        :disabled="!pdfUrl"
      >
        چاپ گزارش
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import PdfViewer from '@/components/shared/PdfViewer.vue';
import { api } from '@/services/api';

// Define props for the component
const props = defineProps({
  loanRequestId: {
    type: String,
    required: true
  },
  cartableId: {
    type: String,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  }
});

console.log('PdfPreview component received props:', props);

// Reactive state
const pdfUrl = ref<string>('');
const pdfTitle = ref<string>('گزارش پیش مصوبه');
const generating = ref(false);
const downloading = ref(false);
const debugMode = ref(false);

// Computed properties
const downloadFileName = computed(() => {
  return `pre-approval-report-${props.cartableId}.pdf`;
});

// Methods
const generatePdf = async () => {
  if (!props.cartableId) {
    console.error('Cartable ID is required');
    return;
  }

  generating.value = true;

  try {

    // Call API to generate PDF report
    const response = await api.cartable.getCreditSuggestionReport(props.cartableId);


    if (response.status === 200 && response.data) {
      // Check if the response is already a blob or base64 data
      if (response.data instanceof Blob) {
        // If it's already a blob, create URL directly
        pdfUrl.value = URL.createObjectURL(response.data);
      } else if (typeof response.data === 'string') {
        // If it's a base64 string, convert to blob
        if (response.data.startsWith('data:application/pdf')) {
          // It's already a data URL
          pdfUrl.value = response.data;
        } else {
          // Assume it's base64, convert to blob
          try {
            const byteCharacters = atob(response.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            pdfUrl.value = URL.createObjectURL(blob);
          } catch (base64Error) {
            throw new Error('Invalid base64 PDF data');
          }
        }
      } else if (response.data.url) {
        // If the API returns an object with a URL
        pdfUrl.value = response.data.url;
      } else if (response.data.pdfUrl) {
        // Alternative property name
        pdfUrl.value = response.data.pdfUrl;
      } else {
        // If it's JSON data, we need to make another request to get the actual PDF
        throw new Error('PDF data not found in response. Please check the API response format.');
      }

      pdfTitle.value = `گزارش پیش مصوبه - ${props.cartableId}`;
    } else {
      throw new Error('Failed to generate PDF report - Invalid response');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Create a sample PDF for testing purposes
    createSamplePdf();
  } finally {
    generating.value = false;
  }
};

// Create a sample PDF for testing when API fails
const createSamplePdf = () => {
  try {
    // Create a simple PDF-like blob for testing
    const pdfContent = `
      %PDF-1.4
      1 0 obj
      <<
        /Type /Catalog
        /Pages 2 0 R
      >>
      endobj

      2 0 obj
      <<
        /Type /Pages
        /Kids [3 0 R]
        /Count 1
      >>
      endobj

      3 0 obj
      <<
        /Type /Page
        /Parent 2 0 R
        /MediaBox [0 0 612 792]
        /Contents 4 0 R
      >>
      endobj

      4 0 obj
      <<
        /Length 44
      >>
      stream
      BT
      /F1 12 Tf
      100 700 Td
      (Sample PDF Report) Tj
      ET
      endstream
      endobj

      xref
      0 5
      0000000000 65535 f
      0000000009 00000 n
      0000000058 00000 n
      0000000115 00000 n
      0000000204 00000 n
      trailer
      <<
        /Size 5
        /Root 1 0 R
      >>
      startxref
      297
      %%EOF
    `;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    pdfUrl.value = URL.createObjectURL(blob);
    pdfTitle.value = `گزارش نمونه - ${props.cartableId}`;
  } catch (error) {
    console.error('Error creating sample PDF:', error);
  }
};

const downloadPdf = async () => {
  if (!pdfUrl.value) return;

  downloading.value = true;

  try {
    const response = await fetch(pdfUrl.value);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFileName.value;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
  } finally {
    downloading.value = false;
  }
};

const printPdf = () => {
  if (!pdfUrl.value) return;

  const printWindow = window.open(pdfUrl.value, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

// PDF Viewer event handlers
const onPdfLoad = (pdfData: any) => {
};

const onPdfError = (error: string) => {
  console.error('PDF error:', error);
};

const onPdfDownload = (url: string) => {
};

const onPdfPrint = (url: string) => {
};

// Submit data method for stepper
const submitData = async () => {
  try {
    // Validate that PDF has been generated
    if (!pdfUrl.value) {
      throw new Error('لطفا ابتدا گزارش PDF را تولید کنید');
    }


    // You can add additional validation or submission logic here
    // For example, saving the PDF URL to the database

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

// Lifecycle
onMounted(() => {

  // Auto-generate PDF when component mounts if we have the required data
  if (props.cartableId) {
    generatePdf();
  } else {

  }
});

// Expose the submitData method for the stepper
defineExpose({ submitData });

// Debug mode toggle
const toggleDebug = () => {
  debugMode.value = !debugMode.value;
};
</script>

<style scoped>
.pdf-preview {
  padding: 20px;
}

.pdf-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 600px; /* Match PdfViewer height */
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.placeholder-card {
  width: 100%;
  max-width: 500px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pdf-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .pdf-actions {
    flex-direction: column;
    align-items: center;
  }
}

.debug-info {
  margin-top: 20px;
  padding: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  font-size: 0.9em;
  color: #333;
}
</style>
