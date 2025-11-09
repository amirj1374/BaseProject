<script setup lang="ts">
import CustomAutocomplete from '@/components/shared/CustomAutocomplete.vue';
import { api } from '@/services/api';
import type { ContractType, FacilityDto } from '@/types/approval/approvalType';
import { computed, ref, watch } from 'vue';

interface FacilitySelectionPayload {
  contractType: ContractType;
  facility: FacilityDto;
}

const props = defineProps<{
  modelValue: boolean;
  contractTypes: ContractType[];
  existingSelections?: FacilitySelectionPayload[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', payload: FacilitySelectionPayload): void;
}>();

const selectedContractType = ref<ContractType | null>(null);
const facilityOptions = ref<FacilityDto[]>([]);
const selectedFacility = ref<FacilityDto | null>(null);
const loadingFacilities = ref(false);
const errorMessage = ref('');

const dialogTitle = computed(() => 'افزودن محصول');

const resetForm = () => {
  selectedContractType.value = null;
  selectedFacility.value = null;
  facilityOptions.value = [];
  errorMessage.value = '';
};

const closeDialog = () => {
  emit('update:modelValue', false);
  resetForm();
};

const handleContractTypeChange = async (contractType: ContractType | null) => {
  selectedFacility.value = null;
  facilityOptions.value = [];

  if (!contractType) {
    return;
  }

  loadingFacilities.value = true;
  try {
    const response = await api.approval.getFacilities(contractType.coreId, 'ContractCode');
    facilityOptions.value = response.data.facilityDtoList || [];
  } catch (error) {
    errorMessage.value = 'خطا در دریافت لیست محصولات مرتبط با عقد انتخاب شده.';
    console.error('FacilityProductDialog - getFacilities error:', error);
  } finally {
    loadingFacilities.value = false;
  }
};

const handleSave = () => {
  errorMessage.value = '';

  if (!selectedContractType.value) {
    errorMessage.value = 'لطفا نوع عقد را انتخاب کنید.';
    return;
  }

  if (!selectedFacility.value) {
    errorMessage.value = 'لطفا نوع محصول را انتخاب کنید.';
    return;
  }

  const duplicate = props.existingSelections?.some(
    (item) =>
      item.contractType.coreId === selectedContractType.value?.coreId &&
      item.facility.facilityCode === selectedFacility.value?.facilityCode
  );

  if (duplicate) {
    errorMessage.value = 'این ترکیب عقد و محصول قبلاً اضافه شده است.';
    return;
  }

  emit('save', {
    contractType: selectedContractType.value,
    facility: selectedFacility.value
  });
  closeDialog();
};

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      resetForm();
    }
  }
);
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="700px" persistent @update:model-value="closeDialog">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ dialogTitle }}</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="12">
              <CustomAutocomplete
                v-model="selectedContractType"
                :items="contractTypes"
                :fields="{
                  title: 'longTitle',
                  value: 'coreId'
                }"
                display-style="detailed"
                label="نوع عقد"
                placeholder="جستجو در انواع عقد..."
                density="comfortable"
                return-object
                clearable
                hide-details="auto"
                @update:model-value="handleContractTypeChange"
              />
            </v-col>

            <v-col cols="12" md="12">
              <v-autocomplete
                v-model="selectedFacility"
                :items="facilityOptions"
                :loading="loadingFacilities"
                item-title="facilityName"
                item-value="facilityCode"
                label="نوع محصول"
                placeholder="ابتدا نوع عقد را انتخاب کنید"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                clearable
                return-object
                :disabled="loadingFacilities || !selectedContractType"
              />
            </v-col>
          </v-row>

          <v-row v-if="errorMessage" dense>
            <v-col cols="12">
              <v-alert type="error" density="compact" class="mt-3">
                {{ errorMessage }}
              </v-alert>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <div style="display: flex; justify-content: space-evenly; width: 100%">
          <v-btn color="primary" variant="outlined" @click="handleSave"> ذخیره </v-btn>
          <v-btn color="error" variant="tonal" @click="closeDialog"> انصراف </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


