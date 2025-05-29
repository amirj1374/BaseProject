<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { api } from '@/services/api';
import type { CartableDetail } from '@/types/cartable/cartableTypes';

const route = useRoute();
const cartableDetail = ref<CartableDetail | null>(null);
const loading = ref(false);

const breadcrumbs = ref([
  {
    title: 'کارتابل',
    disabled: false,
    href: '#'
  },
  {
    title: 'جزییات کارتابل',
    disabled: false,
    href: '#'
  }
]);

const page = ref({ title: 'جزییات کارتابل' });

onMounted(async () => {
  loading.value = true;
  try {
    const res = await api.cartable.getCartableDetail(Number(route.params.id));
    cartableDetail.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

  <v-card class="mt-4">
    <v-card-text style="height: calc(100vh - 230px); overflow-y: auto">
      <v-row v-if="loading">
        <v-col cols="12" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-col>
      </v-row>

      <v-row v-else-if="cartableDetail">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="cartableDetail.createdAt"
            label="تاریخ ایجاد"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="cartableDetail.createdBy"
            label="ایجاد شده توسط"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="cartableDetail.status" label="وضعیت" readonly variant="outlined" density="comfortable"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="cartableDetail.trackingCode"
            label="کد رهگیری"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="cartableDetail.updatedAt"
            label="تاریخ ویرایش"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="cartableDetail.updatedBy"
            label="ویرایش شده توسط"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="cartableDetail.roleName" label="نقش" readonly variant="outlined" density="comfortable"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="cartableDetail.branchCode"
            label="کد شعبه"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="cartableDetail.branchName"
            label="نام شعبه"
            readonly
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4" class="d-flex justify-end mb-4">
          <v-btn color="primary" :to="`/cartable/${route.params.id}/more-detail`" variant="tonal"> مشاهده جزئیات بیشتر </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
