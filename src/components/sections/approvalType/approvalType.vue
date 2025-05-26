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
  { title: 'عملیات', align: 'center', key: 'actions', width: '100px' },
]);

const error = ref<string | null>(null);
const valid = ref<boolean | null>(false);

const facilitiesRef = ref();
const guaranteeRef = ref();
const lcRef = ref();

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

  // Load initial data from store
  const storeData = approvalStore.loanRequestDetailList;
  if (storeData && storeData.length > 0) {
    // Convert store data back to RequestInformationDto format
    const convertedData = storeData.map(item => ({
      contractTypeId: item.contractTypeId.toString(),
      approvalType: item.approvalType,
      requestType: item.requestType,
      amount: item.amount,
      currency: item.currency,
      facilityId: item.facilityId,
      year: parseInt(item.year) || undefined,
      month: parseInt(item.month) || undefined,
      day: parseInt(item.day) || undefined,
      repaymentType: item.repaymentType,
      collaterals: item.collaterals.map(c => ({
        type: c.type.toString(),
        amount: c.amount,
        percent: c.percent
      })),
      advancePayment: item.advancePayment,
      durationDay: item.durationDay,
      other: item.other
    }));

    // Update data table and individual data refs
    dataTable.value = convertedData;
    
    // Set individual data refs based on request type
    convertedData.forEach(item => {
      switch (item.requestType) {
        case 'ContractCode':
          facilitiesData.value = item;
          break;
        case 'GuaranteeType':
          guaranteeData.value = item;
          break;
        case 'LetterOfCredit':
          lcData.value = item;
          break;
      }
    });
  }
});

const isDuplicate = (newData: RequestInformationDto): boolean => {
  return dataTable.value.some((existingItem: RequestInformationDto) => 
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

const deleteItem = (item: RequestInformationDto) => {
  const index = dataTable.value.findIndex(
    (i) => 
      i.requestType === item.requestType &&
      i.contractTypeId === item.contractTypeId &&
      i.facilityId === item.facilityId
  );
  
  if (index !== -1) {
    dataTable.value.splice(index, 1);
    
    // Also clear the corresponding data ref
    switch (item.requestType) {
      case 'ContractCode':
        facilitiesData.value = null;
        break;
      case 'GuaranteeType':
        guaranteeData.value = null;
        break;
      case 'LetterOfCredit':
        lcData.value = null;
        break;
    }
  }
};

const editItem = (item: RequestInformationDto) => {
  // Remove the item from dataTable first
  const index = dataTable.value.findIndex(
    (i) => 
      i.requestType === item.requestType &&
      i.contractTypeId === item.contractTypeId &&
      i.facilityId === item.facilityId
  );
  
  if (index !== -1) {
    dataTable.value.splice(index, 1);
  }

  // Set the data in the appropriate component and open dialog
  switch (item.requestType) {
    case 'ContractCode':
      facilitiesData.value = item;
      facilitiesRef.value?.openForm();
      break;
    case 'GuaranteeType':
      guaranteeData.value = item;
      guaranteeRef.value?.openForm();
      break;
    case 'LetterOfCredit':
      lcData.value = item;
      lcRef.value?.openForm();
      break;
  }
};

// API submission method
const submitData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    if (dataTable.value.length === 0) {
      return Promise.reject({ success: false, message: 'هیچ داده‌ای برای ارسال وجود ندارد.' });
    }

    // Convert dataTable items to LoanRequestDetail format and save to store
    const loanRequestDetails = dataTable.value.map((item: RequestInformationDto) => {
      const { contractType, selectedCollaterals, ...rest } = item as any;
      return {
        advancePayment: item.advancePayment || '',
        amount: item.amount,
        approvalType: item.approvalType,
        collaterals: item.collaterals.map((c: { type: string; amount: number; percent: number }) => ({
          type: parseInt(c.type),
          amount: c.amount,
          percent: c.percent
        })),
        contractTypeId: parseInt(item.contractTypeId),
        currency: item.currency,
        day: item.day?.toString() || '',
        durationDay: item.durationDay || 0,
        facilityId: item.facilityId,
        month: item.month?.toString() || '',
        other: item.other || '',
        repaymentType: item.repaymentType,
        requestType: item.requestType,
        year: item.year?.toString() || ''
      };
    });

    // Save all items to store
    approvalStore.setLoanRequestDetailList(loanRequestDetails);
    return Promise.resolve({ success: true, message: 'اطلاعات با موفقیت ذخیره شد.' });
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
            <Facilities ref="facilitiesRef" :currencies="currencies" :initial-data="facilitiesData" @save="saveFacilitiesData" />
          </v-col>
          <!-- Guarantee Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Guarantee ref="guaranteeRef" :currencies="currencies" :initial-data="guaranteeData" @save="saveGuaranteeData" />
          </v-col>
          <!-- Lc Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Lc ref="lcRef" :currencies="currencies" :initial-data="lcData" @save="saveLcData" />
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
                <!-- Delete button -->
                <template #item.actions="{ item }">
                  <div style="display: flex; gap: 8px; justify-content: center">
                    <v-btn
                      color="primary"
                      size="small"
                      icon
                      @click="editItem(item)"
                    >
                      ✏️
                    </v-btn>
                    <v-btn
                      color="error"
                      size="small"
                      icon
                      @click="deleteItem(item)"
                    >
                      ❌
                    </v-btn>
                  </div>
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
