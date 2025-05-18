<script setup lang="ts">
import { ref } from 'vue';

// Hardcoded PDF URL
const pdfUrl = ref('http://192.168.251.98/ReportServer/Pages/ReportViewer.aspx?%2fCORE%2fform1016&loanRequestId=9803&rs:Format=PDF'); // Replace with your actual PDF URL
</script>

<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-4">
          <div class="text-h6 mb-4">پیش‌نمایش PDF</div>
          <div class="iframe-container">
            <iframe 
              :src="pdfUrl" 
              width="100%" 
              height="400" 
              frameborder="0"
              class="pdf-iframe"
              scrolling="auto"
            ></iframe>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.iframe-container {
  width: 100%;
  height: 600px;
  overflow: hidden;
  position: relative;
}

.pdf-iframe {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
