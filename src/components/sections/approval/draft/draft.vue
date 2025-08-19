<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import Facilities from '@/components/sections/approval/draft/FacilitiesHistory.vue';
import NunRialFacilitiesHistory from '@/components/sections/approval/draft/NunRialFacilitiesHistory.vue';
import type { CurrenciesDto } from '@/types/approval/approvalType';
import Guarantee from '@/components/sections/approval/draft/GuaranteesHistory.vue';
import NonRialGuarantee from '@/components/sections/approval/draft/NonRialGuaranteesHistory.vue';
import Lc from '@/components/sections/approval/draft/LcHistory.vue';
import Deposit from '@/components/sections/approval/draft/Deposit.vue';
import Consideration from '@/components/sections/approval/draft/Consideration.vue';
import OcpHistory from '@/components/sections/approval/draft/OcpHistory.vue';
import Collaterls from '@/components/sections/approval/draft/Collaterls.vue';


const currencies = ref<CurrenciesDto[]>([]);
const facilitiesData = ref();
const guaranteeData = ref();
const lcData = ref();

// Component refs for validation
const depositRef = ref();
const considerationRef = ref();
const collateralsRef = ref();

// Validation state
const isDepositValid = ref(false);
const isConsiderationValid = ref(false);
const isCollateralsValid = ref(false);

// Snackbar state
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('error');

// Computed property to check if all required components are valid
const isDraftValid = computed(() => {
  return isDepositValid.value && isConsiderationValid.value && isCollateralsValid.value;
});

// Function to show validation error messages
const showValidationErrors = () => {
  const errors = [];
  
  if (!isDepositValid.value) {
    errors.push('حساب‌های سپرده');
  }
  if (!isConsiderationValid.value) {
    errors.push('ملاحظات');
  }
  if (!isCollateralsValid.value) {
    errors.push('وثایق');
  }
  
  if (errors.length > 0) {
    snackbarMessage.value = `لطفاً بخش‌های زیر را تکمیل کنید: ${errors.join('، ')}`;
  }
};

onMounted(async () => {
});

// Watch validation state changes from child components
watch(() => depositRef.value?.valid, (newValue) => {
  isDepositValid.value = newValue || false;
  console.log('Deposit validation changed:', newValue);
}, { immediate: true });

watch(() => considerationRef.value?.valid, (newValue) => {
  isConsiderationValid.value = newValue || false;
  console.log('Consideration validation changed:', newValue);
}, { immediate: true });

watch(() => collateralsRef.value?.valid, (newValue) => {
  isCollateralsValid.value = newValue || false;
  console.log('Collaterals validation changed:', newValue);
}, { immediate: true });

// API submission method
const submitData = async (): Promise<void> => {
  try {
    // Check validation before submission
    if (!isDraftValid.value) {
      showValidationErrors();
      return Promise.reject(new Error(snackbarMessage.value));
    }

    const payload = {
      facilities: facilitiesData.value,
      guarantee: guaranteeData.value,
      lc: lcData.value
    };

    // return Promise.resolve();
  } catch (err) {
    console.error('Submit error', err);
    throw err; // Re-throw to let parent handle the error
  }
};

defineExpose({ submitData, isDraftValid });
</script>

<template>
  <div class="approval-section">
    <h4 class="group-title">پیشنویس</h4>
      <v-container fluid>
        <v-row class="">
          <!-- Facilities Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Facilities :currencies="currencies"/>
          </v-col>
          <!-- Guarantee Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Guarantee :currencies="currencies"/>
          </v-col>
          <!-- Lc Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Lc :currencies="currencies"/>
          </v-col>
        </v-row>
        <v-row class="mt-5">
          <!-- NonRial-facilities Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <NunRialFacilitiesHistory :currencies="currencies"/>
          </v-col>
          <!-- NonRial-Guarantee Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <NonRialGuarantee :currencies="currencies"/>
          </v-col>
               <!-- ocp Checkbox -->
               <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <OcpHistory/>
          </v-col>
          <!-- deposit Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Deposit ref="depositRef"/>
          </v-col>
          <!-- consideration Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Consideration ref="considerationRef"/>
          </v-col>
          <!-- collateral Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <collaterls ref="collateralsRef"/>
          </v-col>
        </v-row>
      </v-container>
    </div>
    
    <!-- Validation Error Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="5000">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn color="white" text @click="showSnackbar = false">
          بستن
        </v-btn>
      </template>
    </v-snackbar>
</template>

<style scoped>
.inputCenter {
  display: flex;
  justify-content: center;
}
</style>
