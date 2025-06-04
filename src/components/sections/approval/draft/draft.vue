<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Facilities from '@/components/sections/approval/draft/FacilitiesHistory.vue';
import NunRialFacilitiesHistory from '@/components/sections/approval/draft/NunRialFacilitiesHistory.vue';
import { api } from '@/services/api';
import type { CurrenciesDto,RequestInformationDto } from '@/types/approval/approvalType';
import Guarantee from '@/components/sections/approval/draft/GuaranteesHistory.vue';
import NonRialGuarantee from '@/components/sections/approval/draft/NonRialGuaranteesHistory.vue';
import Lc from '@/components/sections/approval/draft/LcHistory.vue';
import Deposit from '@/components/sections/approval/draft/Deposit.vue';
import Consideration from '@/components/sections/approval/draft/Consideration.vue';
import { useApprovalStore } from '@/stores/approval';

const loading = ref(false);
const currencies = ref<CurrenciesDto[]>([]);
const facilitiesData = ref();
const guaranteeData = ref();
const lcData = ref();
const approvalStore = useApprovalStore()

onMounted(async () => {
});

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
          <!-- deposit Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Deposit/>
          </v-col>
          <!-- consideration Checkbox -->
          <v-col cols="12" md="4" sm="4" style="display: flex; justify-content: center">
            <Consideration/>
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
