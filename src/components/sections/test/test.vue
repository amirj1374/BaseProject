<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
const approvalStore = useApprovalStore();

const headers = ref([
  { title: 'شماره مشتری', key: 'cif' },
  { title: 'کدملی / شناسه ملی', align: 'center', key: 'nationalCode' },
  { title: 'نام مشتری', key: 'customerName' },
  { title: 'گروه مشتری', key: 'clientGroupName' },
  { title: 'نام شعبه', key: 'branchName' },
  { title: 'کدپستی', key: 'postalCode' },
  { title: 'آدرس', key: 'address' }
]);
onMounted(async () => {
  const response = await api.approval.fetchCustomer(cif);
  // Set the data to store.customerInfo
  approvalStore.setCustomerInfo(response.data)
})
</script>
<template>
  <v-card flat>
    <v-card-title class="d-flex align-center py-2">
      <v-icon icon="mdi-video-input-component"></v-icon> &nbsp;
      Find a Graphics Card


      <v-text-field
        v-model="search"
        label="خلاصه درخواست"
        variant="outlined"
        density="comfortable" />
    </v-card-title>

    <v-divider></v-divider>
    <v-data-table-virtual
      v-model:search="search"
      :items="items"
      :headers="headers"
      no-data-text="رکوردی یافت نشد"
    >
      <template v-slot:item.rating="{ item }">
        <v-rating
          :model-value="item.rating"
          color="orange-darken-2"
          density="compact"
          size="small"
          readonly
        ></v-rating>
      </template>

      <template v-slot:item.stock="{ item }">
        <div class="text-end">
          <v-chip
            :color="item.stock ? 'green' : 'red'"
            :text="item.stock ? 'In stock' : 'Out of stock'"
            class="text-uppercase"
            size="small"
            label
          ></v-chip>
        </div>
      </template>
    </v-data-table-virtual>
  </v-card>
</template>