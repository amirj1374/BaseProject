<script lang="ts" setup>
import { ref, type PropType, watch } from 'vue';
import type { CollateralDto } from '@/types/approval/approvalType'; // Import your CollateralDto
import MoneyInput from '@/components/shared/MoneyInput.vue';

// Interface for the structure of emitted data
interface EmittedCollateralData {
  collateral: CollateralDto | null;
  amount: string; // Raw numeric string from VPriceTextField
  // percent: string; // Raw numeric string - Assuming 'price' was meant to be 'percent' or vice-versa based on Facilities.vue
  // Let's use 'percent' as it was in your handleCollateralSave and selectedCollaterals structure
  percent: string; // Raw numeric string
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  collateralOptions: {
    type: Array as PropType<CollateralDto[]>,
    required: true,
    default: () => []
  },
  // Prop to receive an item to edit, if needed in the future
  // editingItem: {
  //   type: Object as PropType<EmittedCollateralData | null>,
  //   default: null
  // }
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', data: EmittedCollateralData): void;
}>();

const selectedCollateralDto = ref<CollateralDto | null>(null);
const amount = ref<string>('');
const percent = ref<string>(''); // Changed from price to percent to match Facilities.vue

const errorMessage = ref<string>('');

// If you add editing functionality later:
// watch(() => props.editingItem, (item) => {
//   if (item) {
//     selectedCollateralDto.value = item.collateral;
//     amount.value = item.amount;
//     percent.value = item.percent;
//   } else {
//     selectedCollateralDto.value = null;
//     amount.value = '';
//     percent.value = '';
//   }
// }, { immediate: true });

const closeDialog = () => {
  emit('update:modelValue', false);
  resetForm();
};

const resetForm = () => {
  selectedCollateralDto.value = null;
  amount.value = '';
  percent.value = '';
  errorMessage.value = '';
};

const handleSave = () => {
  errorMessage.value = '';
  if (!selectedCollateralDto.value) {
    errorMessage.value = 'لطفا یک نوع وثیقه را انتخاب کنید.';
    return;
  }

  emit('save', {
    collateral: selectedCollateralDto.value,
    amount: amount.value, // Emitting raw string from VPriceTextField
    percent: percent.value // Emitting raw string from VPriceTextField
  });
  closeDialog();
};

// Watch for dialog becoming visible to reset form (optional, good for fresh state)
watch(() => props.modelValue, (isVisible) => {
  if (isVisible) {
    // Only reset if not editing an item (if editingItem prop was used)
    // if (!props.editingItem) {
    //   resetForm();
    // }
    resetForm(); // For now, always reset on open
  }
});

</script>

<template>
  <v-dialog
    :model-value="props.modelValue"
    @update:model-value="closeDialog"
    max-width="700px"
    persistent
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">افزودن وثیقه</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="12">
              <v-select
                v-model="selectedCollateralDto"
                :items="props.collateralOptions"
                item-title="description" 
                item-value="collateralTypeCode"
                label="نوع وثیقه"
                variant="outlined"
                density="comfortable"
                return-object
                clearable
                hide-details="auto"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <MoneyInput
                v-model="amount"
                label="مبلغ وثیقه"
                placeholder="0"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                suffix="میلیون ریال"
                type="text"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field 
                v-model="percent"
                label="درصد پوشش"
                placeholder="0"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                suffix="%"
                type="number"
                :rules="[
                  (v: string) => !v || (Number(v) >= 1 && Number(v) <= 100) || 'درصد باید بین 1 تا 100 باشد'
                ]"
                min="1"
                max="100"
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
        <v-btn color="blue-darken-1" variant="text" @click="closeDialog">
          انصراف
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="handleSave">
          ذخیره
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
