<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Facilities from '@/components/sections/approval/approvalType/Facilities.vue';
import { api } from '@/services/api';
import type { CollateralDto, ContractTypeDto, CurrenciesDto, CustomerDto, RequestInformationDto } from '@/types/approval/approvalType';
import Guarantee from '@/components/sections/approval/approvalType/Guarantee.vue';
import Lc from '@/components/sections/approval/approvalType/Lc.vue';
import { RepaymentTypeOptions } from '@/constants/enums/repaymentType';
import { ApprovalTypeOptions } from '@/constants/enums/approval';
import { useApprovalStore } from '@/stores/approval';

const approvalStore = useApprovalStore()
const collaterals = ref<CollateralDto[]>([]);
const loading = ref(false);
const currencies = ref<CurrenciesDto[]>([]);

// Separate data tables for each type
const facilitiesData = ref<RequestInformationDto[]>([]);
const guaranteeData = ref<RequestInformationDto[]>([]);
const lcData = ref<RequestInformationDto[]>([]);

// Common headers for all tables
const headers = ref([
  { title: 'ارز', align: 'center', key: 'currency', width: '150px' },
  { title: 'مبلغ', align: 'center', key: 'amount', width: '200px' },
  { title: 'مصوبه', align: 'center', key: 'approvalType', width: '150px' },
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

const repaymentTypeMap = RepaymentTypeOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.title;
  return acc;
}, {} as Record<string, string>);

const approvalTypeMap = ApprovalTypeOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.title;
  return acc;
}, {} as Record<string, string>);

// Add these refs for contract types and facilities
const contractTypes = ref<ContractTypeDto[]>([]);
const facilities = ref<any[]>([]);

onMounted(async () => {
  try {
    // Load currencies
    const currenciesRes = await api.approval.fetchCurrencies();
    currencies.value = currenciesRes.data;

    // Load initial data from store
    const storeData = approvalStore.loanRequestDetailList;
    if (storeData && storeData.length > 0) {
      // Separate data by request type
      for (const item of storeData) {
        const convertedItem = {
          contractTypeId: item.contractTypeId,
          approvalType: item.approvalType,
          requestType: item.requestType,
          amount: item.amount,
          currency: item.currency,
          facilityId: item.facilityId,
          repaymentType: item.repaymentType,
          collaterals: item.collaterals.map(c => ({
            type: c.type.toString(),
            amount: c.amount,
            percent: c.percent
          })),
          advancePayment: item.advancePayment,
          durationDay: item.durationDay
        };

        // Load facilities for this contract type
        const facilitiesRes = await api.approval.getFacilities(convertedItem.contractTypeId, item.requestType);
        facilities.value = facilitiesRes.data.facilityDtoList || [];

        // Find the matching contract type and facility
        const contractType = contractTypes.value.find(ct => ct.id === convertedItem.contractTypeId);
        const facility = facilities.value.find((f: { facilityCode: string }) => f.facilityCode === convertedItem.facilityId.toString());

        // Add the complete objects to the converted item
        const completeItem = {
          ...convertedItem,
          contractType,
          facility
        };

        // Add to the appropriate array
        switch (item.requestType) {
          case 'ContractCode':
            facilitiesData.value.push(completeItem);
            break;
          case 'GuaranteeType':
            guaranteeData.value.push(completeItem);
            break;
          case 'LetterOfCredit':
            lcData.value.push(completeItem);
            break;
        }
      }
    }
  } catch (err) {
    console.error('Error loading data:', err);
    error.value = 'خطا در بارگذاری اطلاعات';
  }
});

const editItem = async (item: RequestInformationDto, ref: any) => {
  // Remove edit functionality
  console.log('Edit functionality has been removed. Please delete and add new item if needed.');
};

const saveFacilitiesData = async (data: RequestInformationDto) => {
  try {
    console.log('Received data in saveFacilitiesData:', data);
    
    const facilitiesRes = await api.approval.getFacilities(data.contractTypeId, 'ContractCode');
    const currentFacilities = facilitiesRes.data.facilityDtoList || [];
    
    const facility = currentFacilities.find((f: { facilityCode: string }) => f.facilityCode === data.facilityId.toString());
    
    if (!facility) {
      console.error('Facility not found:', data.facilityId);
      return;
    }

    const newItem = {
      ...data,
      contractType: {
        id: parseInt(data.contractTypeId.toString()),
        longTitle: data.contractType?.longTitle || '',
        shortTitle: data.contractType?.shortTitle || '',
        code: data.contractType?.code || '',
        parentId: data.contractType?.parentId || 0,
        mainGroup: data.contractType?.mainGroup || '',
        childOrder: data.contractType?.childOrder || '',
        activationDate: data.contractType?.activationDate || '',
        equivalentCode: data.contractType?.equivalentCode || 0,
        parameterValue: data.contractType?.parameterValue || '',
        active: data.contractType?.active || '',
        requestType: 'ContractCode' as const
      },
      facility: {
        facilityId: parseInt(facility.facilityCode),
        facilityCode: parseInt(facility.facilityCode),
        facilityName: facility.facilityName,
        contractId: parseInt(data.contractTypeId.toString())
      }
    };

    console.log('Saving facilities data:', newItem);
    facilitiesData.value.push(newItem);
  } catch (err) {
    console.error('Error saving facilities data:', err);
  }
};

const saveGuaranteeData = async (data: RequestInformationDto) => {
  try {
    console.log('Received data in saveGuaranteeData:', data);
    
    const facilitiesRes = await api.approval.getFacilities(data.contractTypeId, 'GuaranteeType');
    const currentFacilities = facilitiesRes.data.facilityDtoList || [];
    
    const facility = currentFacilities.find((f: { facilityCode: string }) => f.facilityCode === data.facilityId.toString());
    
    if (!facility) {
      console.error('Facility not found:', data.facilityId);
      return;
    }

    const newItem = {
      ...data,
      contractType: {
        id: parseInt(data.contractTypeId.toString()),
        longTitle: data.contractType?.longTitle || '',
        shortTitle: data.contractType?.shortTitle || '',
        code: data.contractType?.code || '',
        parentId: data.contractType?.parentId || 0,
        mainGroup: data.contractType?.mainGroup || '',
        childOrder: data.contractType?.childOrder || '',
        activationDate: data.contractType?.activationDate || '',
        equivalentCode: data.contractType?.equivalentCode || 0,
        parameterValue: data.contractType?.parameterValue || '',
        active: data.contractType?.active || '',
        requestType: 'GuaranteeType' as const
      },
      facility: {
        facilityId: parseInt(facility.facilityCode),
        facilityCode: parseInt(facility.facilityCode),
        facilityName: facility.facilityName,
        contractId: parseInt(data.contractTypeId.toString())
      }
    };

    console.log('Saving guarantee data:', newItem);
    guaranteeData.value.push(newItem);
  } catch (err) {
    console.error('Error saving guarantee data:', err);
  }
};

const saveLcData = async (data: RequestInformationDto) => {
  try {
    console.log('Received data in saveLcData:', data);
    
    const facilitiesRes = await api.approval.getFacilities(data.contractTypeId, 'LetterOfCredit');
    const currentFacilities = facilitiesRes.data.facilityDtoList || [];
    
    const facility = currentFacilities.find((f: { facilityCode: string }) => f.facilityCode === data.facilityId.toString());
    
    if (!facility) {
      console.error('Facility not found:', data.facilityId);
      return;
    }

    const newItem = {
      ...data,
      contractType: {
        id: parseInt(data.contractTypeId.toString()),
        longTitle: data.contractType?.longTitle || '',
        shortTitle: data.contractType?.shortTitle || '',
        code: data.contractType?.code || '',
        parentId: data.contractType?.parentId || 0,
        mainGroup: data.contractType?.mainGroup || '',
        childOrder: data.contractType?.childOrder || '',
        activationDate: data.contractType?.activationDate || '',
        equivalentCode: data.contractType?.equivalentCode || 0,
        parameterValue: data.contractType?.parameterValue || '',
        active: data.contractType?.active || '',
        requestType: 'LetterOfCredit' as const
      },
      facility: {
        facilityId: parseInt(facility.facilityCode),
        facilityCode: parseInt(facility.facilityCode),
        facilityName: facility.facilityName,
        contractId: parseInt(data.contractTypeId.toString())
      }
    };

    console.log('Saving LC data:', newItem);
    lcData.value.push(newItem);
  } catch (err) {
    console.error('Error saving LC data:', err);
  }
};

const deleteItem = (item: RequestInformationDto, dataArray: RequestInformationDto[]) => {
  const index = dataArray.findIndex(
    (i) => 
      i.requestType === item.requestType &&
      i.contractTypeId === item.contractTypeId &&
      i.facilityId === item.facilityId
  );
  
  if (index !== -1) {
    dataArray.splice(index, 1);
    // Reset the form in the corresponding component
    if (item.requestType === 'ContractCode') {
      facilitiesRef.value?.formRef?.resetFormData();
    } else if (item.requestType === 'GuaranteeType') {
      guaranteeRef.value?.formRef?.resetFormData();
    } else if (item.requestType === 'LetterOfCredit') {
      lcRef.value?.formRef?.resetFormData();
    }
  }
};

// API submission method
const submitData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const allData = [...facilitiesData.value, ...guaranteeData.value, ...lcData.value];
    
    if (allData.length === 0) {
      return Promise.reject({ success: false, message: 'هیچ داده‌ای برای ارسال وجود ندارد.' });
    }

    // Convert data to LoanRequestDetail format and save to store
    const loanRequestDetails = allData.map((item: RequestInformationDto) => {
      const { contractType, selectedCollaterals, facility, year, month, day, ...rest } = item as any;
      return {
        advancePayment: item.advancePayment || '',
        amount: item.amount,
        approvalType: item.approvalType,
        collaterals: item.collaterals.map((c: { type: string; amount: number; percent: number }) => ({
          type: parseInt(c.type),
          amount: c.amount,
          percent: c.percent
        })),
        contractTypeId: item.contractTypeId,
        contractTypeTitle: item.contractType?.longTitle || '',
        currency: item.currency,
        durationDay: item.durationDay || 0,
        facilityId: item.facilityId,
        repaymentType: item.repaymentType,
        requestType: item.requestType
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

defineExpose({ submitData });
</script>

<template>
  <div class="approval-type-container">
    <template v-if="loading">
      <p>Loading...</p>
    </template>

    <template v-else>
      <v-container fluid>
        <!-- Facilities Section -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card class="approval-section">
              <v-card-title class="d-flex align-center">
                <span class="text-h2">تسهیلات</span>
                <v-spacer></v-spacer>
                <Facilities 
                  ref="facilitiesRef" 
                  :currencies="currencies" 
                  @save="saveFacilitiesData" 
                  :disabled="facilitiesData.length > 0"
                />
              </v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="facilitiesData"
                  hide-default-footer
                  no-data-text="رکوردی وجود ندارد"
                  class="elevation-1"
                >
                  <template #item.repaymentType="{ item }">
                    {{ repaymentTypeMap[item.repaymentType] || '-' }}
                  </template>
                  <template #item.approvalType="{ item }">
                    {{ approvalTypeMap[item.approvalType] || '-' }}
                  </template>
                  <template #item.contractTypeId="{ item }">
                    {{ item.contractType?.longTitle || item.contractTypeTitle || '-' }}
                  </template>
                  <template #item.facilityId="{ item }">
                    {{ item.facility?.facilityName || '-' }}
                  </template>
                  <template #item.currency="{ item }">
                    {{ currencies.find(c => c.code === item.currency)?.description || '-' }}
                  </template>
                  <template #item.actions="{ item }">
                    <div class="d-flex justify-center gap-2">
                      <v-btn
                        size="small"
                        icon
                        @click="deleteItem(item, facilitiesData)"
                      >
                        ❌
                      </v-btn>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Guarantee Section -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card class="approval-section">
              <v-card-title class="d-flex align-center">
                <span class="text-h2">ضمانت نامه</span>
                <v-spacer></v-spacer>
                <Guarantee 
                  ref="guaranteeRef" 
                  :currencies="currencies" 
                  @save="saveGuaranteeData" 
                  :disabled="guaranteeData.length > 0"
                />
              </v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="guaranteeData"
                  hide-default-footer
                  no-data-text="رکوردی وجود ندارد"
                  class="elevation-1"
                >
                  <template #item.repaymentType="{ item }">
                    {{ repaymentTypeMap[item.repaymentType] || '-' }}
                  </template>
                  <template #item.approvalType="{ item }">
                    {{ approvalTypeMap[item.approvalType] || '-' }}
                  </template>
                  <template #item.contractTypeId="{ item }">
                    {{ item.contractType?.longTitle || '-' }}
                  </template>
                  <template #item.facilityId="{ item }">
                    {{ item.facility?.facilityName || '-' }}
                  </template>
                  <template #item.currency="{ item }">
                    {{ currencies.find(c => c.code === item.currency)?.description || '-' }}
                  </template>
                  <template #item.actions="{ item }">
                    <div class="d-flex justify-center gap-2">
                      <v-btn
                        size="small"
                        icon
                        @click="deleteItem(item, guaranteeData)"
                      >
                        ❌
                      </v-btn>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- LC Section -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card class="approval-section">
              <v-card-title class="d-flex align-center">
                <span class="text-h2">اعتبار اسنادی</span>
                <v-spacer></v-spacer>
                <Lc 
                  ref="lcRef" 
                  :currencies="currencies" 
                  :collateral="collaterals" 
                  @save="saveLcData" 
                  :disabled="lcData.length > 0"
                />
              </v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="headers"
                  :items="lcData"
                  hide-default-footer
                  no-data-text="رکوردی وجود ندارد"
                  class="elevation-1"
                >
                  <template #item.repaymentType="{ item }">
                    {{ repaymentTypeMap[item.repaymentType] || '-' }}
                  </template>
                  <template #item.approvalType="{ item }">
                    {{ approvalTypeMap[item.approvalType] || '-' }}
                  </template>
                  <template #item.contractTypeId="{ item }">
                    {{ item.contractType?.longTitle || '-' }}
                  </template>
                  <template #item.facilityId="{ item }">
                    {{ item.facility?.facilityName || '-' }}
                  </template>
                  <template #item.currency="{ item }">
                    {{ currencies.find(c => c.code === item.currency)?.description || '-' }}
                  </template>
                  <template #item.actions="{ item }">
                    <div class="d-flex justify-center gap-2">
                      <v-btn
                        size="small"
                        icon
                        @click="deleteItem(item, lcData)"
                      >
                        ❌
                      </v-btn>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </div>
</template>

<style scoped>
.approval-type-container {
  padding: 16px;
}

.approval-section {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.approval-section .v-card-title {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.gap-2 {
  gap: 8px;
}
</style>
