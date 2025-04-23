<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Facilities from '@/components/sections/history/FacilitiesHistory.vue';
import { api } from '@/services/api';
import type { CurrenciesDto, CustomerDto, RequestInformationDto } from '@/types/approval/approvalType';
import Guarantee from '@/components/sections/history/GuaranteesHistory.vue';
import Lc from '@/components/sections/approvalType/Lc.vue';

const loading = ref(false);
const currencies = ref<CurrenciesDto[]>([]);
const facilitiesData = ref();
const guaranteeData = ref();
const lcData = ref();
const dataTable = ref(<RequestInformationDto[]>[]);
const headers = ref([
  { title: 'ارز', align: 'center', key: 'currency', width: '150px' },
  { title: 'مبلغ', align: 'center', key: 'price', width: '150px' },
  { title: 'مصوبه', align: 'center', key: 'selectedApprovalType', width: '150px' },
  { title: 'وثیقه', align: 'center', key: 'selectedCollateral', width: '120px' },
  { title: 'نوع عقد', align: 'center', key: 'selectedContractType', width: '200px' },
  { title: 'محصول', align: 'center', key: 'selectedFacilities', width: '200px' },
  { title: 'بازپرداخت', align: 'center', key: 'selectedRepaymentType', width: '200px' },
  { title: 'مبلغ', align: 'center', key: 'price', width: '200px' },
  { title: 'مدت', align: 'center', key: 'term', width: '200px' },
  { title: 'روز', align: 'center', key: 'day', width: '150px' },
  { title: 'ماه', align: 'center', key: 'month', width: '150px' },
  { title: 'سال', align: 'center', key: 'year', width: '200px' },
]);

onMounted(async () => {
  const currenciesRes = await api.approval.fetchCurrencies();
  currencies.value = currenciesRes.data;
});

const saveFacilitiesData = (data: RequestInformationDto) => {
  facilitiesData.value = data;
  dataTable.value.push(data);
};

const saveGuaranteeData = (data: RequestInformationDto) => {
  guaranteeData.value = data;
  dataTable.value.push(data);
};

const saveLcData = (data: RequestInformationDto) => {
  lcData.value = data;
  dataTable.value.push(data);
};

// API submission method
const submitData = async (): Promise<void> => {
  try {
    const payload = {
      facilities: facilitiesData.value,
      guarantee: guaranteeData.value,
      lc: lcData.value
    };

    console.log('Final submission payload:', payload);

    // return Promise.resolve();
  } catch (err) {
    console.error('Submit error', err);
  }
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
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Facilities :currencies="currencies" @save="saveFacilitiesData" />
          </v-col>
          <!-- Guarantee Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Guarantee :currencies="currencies" @save="saveGuaranteeData" />
          </v-col>
          <!-- Lc Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Lc :currencies="currencies" @save="saveLcData" />
          </v-col>
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
