<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
const approvalStore = useApprovalStore()
const pdfUrl = ref('');
let pdfObjectUrl: string | null = null;

onMounted(async () => {
  try {
    const response = await api.approval.getResult(22905);
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
</script>

<template>
  <div class="approval-section">
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" md="12" lg="8">
          <div class="iframe-container">
            <iframe
              v-if="pdfUrl"
              :src="pdfUrl"
              type="application/pdf"
              class="pdf-object"
            >
              <p>Your browser does not support PDFs. Please download the PDF to view it.</p>
            </iframe>
            <div v-else class="d-flex justify-center align-center" style="height: 80%">
              <v-progress-circular indeterminate />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.iframe-container {
  overflow: hidden;
}

.pdf-object {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
