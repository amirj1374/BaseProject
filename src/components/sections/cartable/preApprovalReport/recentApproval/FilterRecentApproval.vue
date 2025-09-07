<script setup lang="ts">
import { reactive, watch } from 'vue';
import ShamsiDatePicker from '@/components/shared/ShamsiDatePicker.vue';

interface ModelShape {
  creditApprovalNo?: string;
  creditApprovalDate?: string;
  loanRequestType?: string;
  cashDeposit?: string;
  approvalCollaterals?: string;
  activeRemainAmount?: string;
  depositAmount?: string;
  estateAmount?: string;
  chequeAmount?: string;
  promissoryNoteAmount?: string;
}

const props = defineProps<{ modelValue: ModelShape }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: ModelShape): void;
  (e: 'apply', v: ModelShape): void;
}>();

const model = reactive<ModelShape>({ ...(props.modelValue || {}) });

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(model, val || {});
  },
  { deep: true }
);

watch(
  model,
  (val) => {
    emit('update:modelValue', { ...val });
  },
  { deep: true }
);

function apply() {
  emit('apply', { ...model });
}

function reset() {
  Object.keys(model).forEach((k) => ((model as any)[k] = ''));
  emit('apply', { ...model });
}
</script>

<template>
  <v-form @submit.prevent="apply">
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field v-model="model.creditApprovalNo" label="شماره مصوبه" variant="outlined" hide-details="auto" />
      </v-col>
      <v-col cols="12" md="4">
        <ShamsiDatePicker
          v-model="model.creditApprovalDate"
          label="تاریخ مصوبه"
          variant="outlined"
          density="comfortable"
          mode="single"
          format="YYYY-MM-DD"
          displayFormat="jYYYY/jMM/jDD"
          emitWithTimezone
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="model.loanRequestType" label="تعهدات / تسهیلات" variant="outlined" hide-details="auto" />
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field v-model="model.cashDeposit" label="سپرده نقدی" type="number" variant="outlined" hide-details="auto" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="model.approvalCollaterals" label="وثایق طبق مصوبه" type="number" variant="outlined" hide-details="auto" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="model.activeRemainAmount" label="مانده فعال" type="number" variant="outlined" hide-details="auto" />
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field v-model="model.depositAmount" label="ضمانت نامه / سپرده" type="number" variant="outlined" hide-details="auto" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="model.estateAmount" label="وثیقه غیر منقول" type="number" variant="outlined" hide-details="auto" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="model.chequeAmount" label="جک / وثیقه" type="number" variant="outlined" hide-details="auto" />
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field v-model="model.promissoryNoteAmount" label="وثیقه - سفته" type="number" variant="outlined" hide-details="auto" />
      </v-col>
    </v-row>
  </v-form>
</template>

<style scoped></style>
