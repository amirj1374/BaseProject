<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Facilities from '@/components/sections/approvalType/Facilities.vue';
import { api } from '@/services/api';
import type { CurrenciesDto } from '@/types/approval/approvalType';
const loading = ref(false);
const currencies = ref<CurrenciesDto[]>([]);

onMounted(async () => {
  const currenciesRes = await api.approval.fetchCurrencies();
  currencies.value = currenciesRes.data;
  const facilitiesRes = await api.approval.getFacilities(3312611,'ContractCode');
});

// API submission method
const submitData = async (): Promise<void> => {
  return Promise.resolve();
  // loading.value = true;
  // error.value = null;
  // try {
  //   const response = await axios.post('/api/section-one-endpoint', props.stepData || {});
  //   if (response.status !== 200) {
  //     error.value = `Error: ${response.statusText}`;
  //     throw new Error(response.statusText);
  //   }
  // } catch (err: any) {
  //   error.value = err.message || 'An error occurred.';
  //   throw err;
  // } finally {
  //   loading.value = false;
  // }
};

defineExpose({ submitData });
</script>

<template>
  <div>
    <template v-if="loading">
      <p>Loading...</p>
    </template>

    <template v-else>
      <v-container fluid>
        <v-row class="mt-5">
          <!-- Facilities Checkbox -->
          <v-col cols="12" md="4" sm="4">
            <Facilities :currencies="currencies"/>
          </v-col>
          <!-- Warranty Checkbox -->
<!--          <v-col cols="12" md="4" sm="4">-->
<!--            <v-checkbox-->
<!--              v-model="requestType"-->
<!--              color="primary"-->
<!--              label="ضمانت نامه"-->
<!--              value="warranty"-->
<!--              class="inputCenter"-->
<!--              hide-details-->
<!--            ></v-checkbox>-->

<!--            <v-card style="padding: 10px; height: 400px; overflow: auto" v-if="requestType.includes('warranty')" title="ضمانت نامه" variant="outlined">-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedApproval"-->
<!--                :items="approval"-->
<!--                item-title="title"-->
<!--                item-value="value"-->
<!--                label="نوع مصوبه"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedFacilitiesType"-->
<!--                :items="FakeData.warrantyProduct"-->
<!--                item-title="TITLE"-->
<!--                item-value="FACILITY_CODE"-->
<!--                label="نوع محصول"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedCurrencyType"-->
<!--                :items="FakeData.currency"-->
<!--                item-title="currencyDescription"-->
<!--                item-value="currencyCode"-->
<!--                label="نوع ارز"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedRefundType"-->
<!--                :items="refundType"-->
<!--                item-title="title"-->
<!--                item-value="value"-->
<!--                label="نحوه بازپرداخت"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedRefundType"-->
<!--                :items="FakeData.economicSector"-->
<!--                item-title="title"-->
<!--                item-value="code"-->
<!--                label="بخش اقتصادی"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--              <v-text-field v-model="selectedPrice" label="مبلغ" variant="outlined" density="comfortable" />-->
<!--              <v-text-field v-model="selectedPrice" label="درصد سپرده نقدی" variant="outlined" density="comfortable" />-->
<!--              <v-card-actions>-->
<!--                <v-btn variant="outlined" color="primary">تایید</v-btn>-->
<!--              </v-card-actions>-->
<!--            </v-card>-->
<!--          </v-col>-->

          <!-- Letter of Credit Checkbox -->
<!--          <v-col cols="12" md="4" sm="4">-->
<!--            <v-checkbox-->
<!--              v-model="requestType"-->
<!--              color="primary"-->
<!--              label="اعتبار اسنادی"-->
<!--              value="letter-of-credit"-->
<!--              class="inputCenter"-->
<!--              hide-details-->
<!--            ></v-checkbox>-->

<!--            <v-card style="padding: 10px; height: 400px; overflow: auto" v-if="requestType.includes('letter-of-credit')" title="اعتبار اسنادی" variant="outlined">-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedApproval"-->
<!--                :items="approval"-->
<!--                item-title="title"-->
<!--                item-value="value"-->
<!--                label="نوع مصوبه"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedFacilitiesType"-->
<!--                :items="FakeData.product"-->
<!--                item-title="description"-->
<!--                item-value="code"-->
<!--                label="نوع محصول"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedCurrencyType"-->
<!--                :items="FakeData.currency"-->
<!--                item-title="currencyDescription"-->
<!--                item-value="currencyCode"-->
<!--                label="نوع ارز"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedRefundType"-->
<!--                :items="refundType"-->
<!--                item-title="title"-->
<!--                item-value="value"-->
<!--                label="نحوه بازپرداخت"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedRefundType"-->
<!--                :items="FakeData.economicSector"-->
<!--                item-title="title"-->
<!--                item-value="value"-->
<!--                label="بخش اقتصادی"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--              <v-text-field v-model="selectedPrice" label="مبلغ" variant="outlined" density="comfortable" />-->
<!--              <v-card-actions>-->
<!--                <v-btn variant="outlined" color="primary">تایید</v-btn>-->
<!--              </v-card-actions>-->
<!--            </v-card>-->
<!--          </v-col>-->
        </v-row>
      </v-container>
    </template>
  </div>
</template>

<style scoped>
.inputCenter {
  display: flex;
  justify-content: center;
}
</style>
