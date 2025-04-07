<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { jsPDF } from 'jspdf';
import PdfViewer from '@/components/shared/PdfViewer.vue';
const generatedPdf = ref<string>('');

const data = [
  { id: 1, name: 'رضا', lastName: 'علیزاده', nationalCode: '0012345678', birthDate: '1360/05/01' },
  { id: 2, name: 'مهسا', lastName: 'رضایی', nationalCode: '0012345679', birthDate: '1365/07/15' },
  // Add more entries here
];

const generatePDF = async () => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFont('IRANSansWeb');
  doc.setFontSize(12);
  doc.text('بانک شهر شعبه آیت اله کاشانی', 105, 20, { align: 'center' });

  const startY = 40;
  const rowHeight = 8;
  const startX = 10;
  const endX = 190;

  // Table headers
  const headers = ['ردیف', 'نام', 'نام خانوادگی', 'کد ملی', 'تاریخ تولد'];
  const columnWidths = [20, 40, 50, 40, 40];

  // Draw header
  headers.forEach((header, index) => {
    doc.text(header, startX + sumWidths(columnWidths, index) + 2, startY, { align: 'left' });
  });

  // Draw lines for the header
  doc.line(startX, startY + 2, endX, startY + 2); // Top border of header
  let currentY = startY + rowHeight;

  // Adding data to the table
  data.forEach((item, rowIndex) => {
    const baseY = currentY + rowIndex * rowHeight;
    doc.text(item.id.toString(), startX + 5, baseY);
    doc.text(item.name, startX + columnWidths[0] + 5, baseY);
    doc.text(item.lastName, startX + sumWidths(columnWidths, 1) + 5, baseY);
    doc.text(item.nationalCode, startX + sumWidths(columnWidths, 2) + 5, baseY);
    doc.text(item.birthDate, startX + sumWidths(columnWidths, 3) + 5, baseY);

    // Draw bottom border for each row
    doc.line(startX, baseY + 2, endX, baseY + 2);
  });

  // Output as Data URL
  generatedPdf.value = doc.output('datauristring');
};

// Utility to calculate the starting position of each column
const sumWidths = (widths, index) => widths.slice(0, index).reduce((acc, curr) => acc + curr, 0);

onMounted(() => {
  generatePDF();
});
</script>

<template>
  <div>
    <pdf-viewer v-if="generatedPdf" :src="generatedPdf" />
  </div>
</template>
