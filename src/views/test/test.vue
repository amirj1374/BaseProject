<script setup lang="ts">
import { onMounted, ref } from 'vue'; // Import the Base64 font

import { jsPDF } from 'jspdf';

import { addImage, addText } from '@/views/test/_utils';

import PdfViewer from '@/components/shared/PdfViewer.vue';

import IRANSansWeb from './IRANSansWeb';

import Page01 from './page01';
import Page02 from './page02';
import dataJson from './data.json'
import { api } from '@/services/api';
const generatedPdf = ref<string>('');


//deposit-info
onMounted(async () => {
  const currenciesRes = await api.approval.getDepositInfo(3252);
})
const generatePDF = async () => {
  // ساخت بیس جنریتور
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: 'a4'
  });

  // افزودن فونت
  doc.addFileToVFS('IRANSansWeb.ttf', IRANSansWeb);
  doc.addFont('IRANSansWeb.ttf', 'IRANSansWeb', 'normal');
  doc.setFont('IRANSansWeb');

  // سایز طول و عرض صفحه بر اساس پوینت
  const widthInPoints = doc.internal.pageSize.width;
  const heightInPoints = doc.internal.pageSize.height;

  // ادد کردن قالب زمینه
  doc.addImage(Page01, 'PNG', 0, 0, widthInPoints, heightInPoints); // Adjust dimensions to your template size (A4: 210mm x 297mm)


  doc.setFontSize(9);
  // const textWidth = doc.getStringUnitWidth(' تست برای زبان فارسی است') * doc.internal.getFontSize();
  // const xPos = (widthInPoints - textWidth) / 2;
  // doc.text(' تست برای زبان فارسی است', xPos, 150);

  // افزودن تصویر base64
  // addImage(doc, 'data:image/png;base64,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', { width: 30, height: 30, top: 20, left: widthInPoints / 2 - 15 });

  // customer section
  addText(doc, dataJson.customers.branchName, { top: 18, left: 389, maxWidth: 100, maxHeight: 10 });
  addText(doc, dataJson.customers.branchCode, { top: 32, left: 389, maxWidth: 60, maxHeight: 10 });
  addText(doc, `${ dataJson.customers.FirstName } ${ dataJson.customers.LastName }`, { top: 118, left: 375, maxWidth: 60, maxHeight: 10 });
  addText(doc, dataJson.customers.customerId, { top: 118, left: 240, maxWidth: 60, maxHeight: 10 });
  addText(doc, dataJson.customers.NationalCode, { top: 118, left: 100, maxWidth: 60, maxHeight: 10 });
  addText(doc, dataJson.customers.customerActivity, { top: 132, left: 370, maxWidth: 100, maxHeight: 10 });
  addText(doc, dataJson.customers.summery, { top: 132, left: 155, maxWidth: 150, maxHeight: 10 });
  // lc section
  addText(doc, dataJson.LCSearchDto[0].approvedAmountYear ? dataJson.LCSearchDto[0].approvedAmountYear : '-', { top: 455, left: 370, maxWidth: 50, maxHeight: 10 });
  addText(doc, dataJson.LCSearchDto[0].approvedAmountItem ? dataJson.LCSearchDto[0].approvedAmountItem : '-', { top: 455, left: 350, maxWidth: 50, maxHeight: 10 });




  // واسه درآدوردن width حدودی
  // doc.setFillColor(225, 123, 126); // Light orange background
  // doc.rect(222, 135, 148, 10, 'F');

  // رفتن به صفحه بعدی
  doc.addPage();

  // ادد کردن قالب زمینه
  doc.addImage(Page02, 'PNG', 0, 0, widthInPoints, heightInPoints); // Adjust dimensions to your template size (A4: 210mm x 297mm)

  // خروجی بیس ۶۴
  generatedPdf.value = doc.output('datauristring');
};

onMounted(() => {
  generatePDF();
});
</script>

<template>
  <div>
    <pdf-viewer v-if="generatedPdf" :src="generatedPdf" />
  </div>
</template>
