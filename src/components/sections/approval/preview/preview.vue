<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import PdfViewer from '@/components/shared/PdfViewer.vue';
const approvalStore = useApprovalStore()
const pdfUrl = ref('');
let pdfObjectUrl: string | null = null;

onMounted(async () => {
  try {
    const response = await api.approval.getResult(approvalStore.loanRequestId);
    const byteCharacters = atob(response.data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: "application/pdf"});
    pdfObjectUrl = URL.createObjectURL(blob);
    pdfUrl.value = pdfObjectUrl;
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
});

onBeforeUnmount(() => {
  if (pdfObjectUrl) {
    URL.revokeObjectURL(pdfObjectUrl);
  }
});

// Event handlers for PdfViewer
const onPdfLoad = (pdf: any) => {
  console.log('PDF loaded successfully:', pdf);
};

const onPdfError = (error: string) => {
  console.error('PDF loading error:', error);
};

const onPdfDownload = (url: string) => {
  console.log('PDF download initiated:', url);
};

const onPdfPrint = (url: string) => {
  console.log('PDF print initiated:', url);
};
</script>

<template>
  <div class="approval-section">
    <h4 class="group-title">نمایش فرم مصوبه</h4>
    <form class="approval-form">
      <v-row justify="center" class="mt-2">
        <v-col cols="12" md="12" lg="12">
          <PdfViewer
            v-if="pdfUrl"
            :src="pdfUrl"
            title="نمایش فرم مصوبه"
            height="80vh"
            :showHeader="true"
            :showFooter="true"
            :showZoomControls="true"
            :showNavigationControls="true"
            :showDownload="true"
            :showPrint="true"
            :showFullscreen="true"
            :showClose="false"
            downloadFileName="1016-form.pdf"
            @load="onPdfLoad"
            @error="onPdfError"
            @download="onPdfDownload"
            @print="onPdfPrint"
          />
          <div v-else class="d-flex justify-center align-center" style="height: 80vh">
            <v-progress-circular indeterminate />
          </div>
        </v-col>
      </v-row>
    </form>
  </div>
</template>
