<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <div class="approval-section">
    <v-tabs v-model="activeTab" class="mb-2">
      <v-tab value="summaryPerformance">خلاصه وضعیت مالی و عملکرد متقاضی</v-tab>
      <v-tab value="creditOffer">مشخصات پيشنهاد اعتباري</v-tab>
      <v-tab value="depositStatus">وضعيت سپرده های مشتري</v-tab>
      <v-tab value="facilityStatus">وضعيت تسهيلات و تعهدات مشتري</v-tab>
      <v-tab value="recentApproval">مصوبات اخیر</v-tab>
      <v-tab value="comments">ساير شرايط و ملاحظات</v-tab>
    </v-tabs>
    <SummaryPerformance v-if="activeTab === 'summaryPerformance'" ref="summaryPerformanceRef"/>
    <CreditOffer v-if="activeTab === 'creditOffer'" ref="creditOfferRef"/>
    <DepositStatus v-if="activeTab === 'depositStatus'" ref="depositStatusRef" :loan-request-id="id"/>
    <FacilityStatus v-if="activeTab === 'facilityStatus'" ref="facilityStatusRef"/>
    <RecentApproval v-if="activeTab === 'recentApproval'" ref="recentApprovalRef"/>
    <Comments v-if="activeTab === 'comments'" ref="commentsRef"/>
  </div>
</template>
<script lang="ts" setup>
// components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import SummaryPerformance from '@/components/sections/cartable/preApprovalReport/summaryPerformance/summaryPerformance.vue';
import CreditOffer from '@/components/sections/cartable/preApprovalReport/creditOffer/creditOffer.vue';
import DepositStatus from '@/components/sections/cartable/preApprovalReport/depositStatus/depositStatus.vue';
import FacilityStatus from '@/components/sections/cartable/preApprovalReport/facilityStatus/facilityStatus.vue';
import RecentApproval from '@/components/sections/cartable/preApprovalReport/recentApproval/recentApproval.vue';
import Comments from '@/components/sections/cartable/preApprovalReport/comments/comments.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/services/api';

const { id } = useRoute().params;
onMounted(async () => {
  const loanRequestId = await api.cartable.getLoanRequestId(id as string);
})

const breadcrumbs = ref([
  {
    title: 'کارتابل ها',
    disabled: false,
    href: '/cartable'
  },
  {
    title: 'گزارش پیش مصوبه',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'گزارش پیش مصوبه' });
const activeTab = ref('summaryPerformance');
</script>