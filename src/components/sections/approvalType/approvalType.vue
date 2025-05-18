<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Facilities from '@/components/sections/approvalType/Facilities.vue';
import { api } from '@/services/api';
import type { CollateralDto, ContractTypeDto, CurrenciesDto, CustomerDto, RequestInformationDto } from '@/types/approval/approvalType';
import Guarantee from '@/components/sections/approvalType/Guarantee.vue';
import Lc from '@/components/sections/approvalType/Lc.vue';
import { RepaymentTypeOptions } from '@/constants/enums/repaymentType';
import { ApprovalTypeOptions } from '@/constants/enums/approval';
import { useApprovalStore } from '@/stores/approval';

const approvalStore = useApprovalStore()
const collaterals = ref<CollateralDto[]>([]);
const loading = ref(false);
const currencies = ref<CurrenciesDto[]>([]);
const facilitiesData = ref<RequestInformationDto | null>(null);
const guaranteeData = ref<RequestInformationDto | null>(null);
const lcData = ref<RequestInformationDto | null>(null);
const dataTable = ref<RequestInformationDto[]>([]);
const headers = ref([
  { title: 'ارز', align: 'center', key: 'currency', width: '150px' },
  { title: 'مبلغ', align: 'center', key: 'amount', width: '200px' },
  { title: 'مصوبه', align: 'center', key: 'approvalType', width: '150px' },
  { title: 'نوع درخواست', align: 'center', key: 'requestType', width: '150px' },
  { title: 'نوع عقد', align: 'center', key: 'contractTypeId', width: '200px' },
  { title: 'محصول', align: 'center', key: 'facilityId', width: '200px' },
  { title: 'بازپرداخت', align: 'center', key: 'repaymentType', width: '200px' },
  { title: 'مدت', align: 'center', key: 'durationDay', width: '200px' },
]);

const error = ref<string | null>(null);
const valid = ref<boolean | null>(false);

const getRequestType = (requestType: string): string => {
  switch (requestType) {
    case 'ContractCode':
      return 'تسهیلات';
    case 'GuaranteeType':
      return 'ضمانت‌نامه';
    case 'LetterOfCredit':
      return 'اعتبار اسنادی';
    default:
      return '-';
  }
};

onMounted(async () => {
  const currenciesRes = await api.approval.fetchCurrencies();
  currencies.value = currenciesRes.data;
});

const isDuplicate = (newData: RequestInformationDto): boolean => {
  return dataTable.value.some(existingItem => 
    existingItem.requestType === newData.requestType &&
    existingItem.contractTypeId === newData.contractTypeId &&
    existingItem.facilityId === newData.facilityId
  );
};

const saveFacilitiesData = (data: RequestInformationDto) => {
  if (isDuplicate(data)) {
    console.warn('Duplicate entry detected');
    return;
  }
  facilitiesData.value = data;
  dataTable.value.push(data);
};

const saveGuaranteeData = (data: RequestInformationDto) => {
  if (isDuplicate(data)) {
    error.value = 'این نوع ضمانت نامه قبلاً اضافه شده است';
    return;
  }
  guaranteeData.value = data;
  dataTable.value.push(data);
  valid.value = true;
};

const saveLcData = (data: RequestInformationDto) => {
  if (isDuplicate(data)) {
    console.warn('Duplicate entry detected');
    return;
  }
  lcData.value = data;
  dataTable.value.push(data);
};

// API submission method
const submitData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const payload = {
      loanRequestDetailList: [facilitiesData.value, guaranteeData.value, lcData.value].filter(Boolean),
      loanRequestId: approvalStore.loanRequestId

    };

    if (payload.loanRequestDetailList.length === 0) {
      return Promise.reject({ success: false, message: 'هیچ داده‌ای برای ارسال وجود ندارد.' });
    }

    const res = await api.approval.saveLoanRequest(payload);
    return Promise.resolve({ success: true, message: 'درخواست با موفقیت ثبت شد.' });
  } catch (err: any) {
    return Promise.reject({
      success: false,
      message: err
    });
  }
};


const repaymentTypeMap = RepaymentTypeOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.title;
  return acc;
}, {} as Record<string, string>);

const approvalTypeMap = ApprovalTypeOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.title;
  return acc;
}, {} as Record<string, string>);

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
            <Lc :collateral="collaterals" :currencies="currencies" @save="saveLcData" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="12">
            <div class="table-scroll" style="margin-top: 25px">
              <v-data-table :headers="headers" :items="dataTable" hide-default-footer no-data-text="رکوردی وجود ندارد" sticky>
                <!-- Custom display for approvalType -->
                <template #item.requestType="{ item }">
                  {{ getRequestType(item.requestType) }}
                </template>
                <template #item.repaymentType="{ item }">
                  {{ repaymentTypeMap[item.repaymentType] || '-' }}
                </template>
                <!-- Custom display for facility -->
                <template #item.approvalType="{ item }">
                  {{ approvalTypeMap[item.approvalType] || '-' }}
                </template>
                <!-- Custom display for contract type -->
                <template #item.contractTypeId="{ item }">
                  {{ item.contractType?.longTitle || '-' }}
                </template>
              </v-data-table>
            </div>
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
