<script lang="ts" setup>
import { ref } from 'vue';
import type { CurrenciesDto } from '@/types/approval/approvalType';
import BaseApprovalForm from './BaseApprovalForm.vue';
import { AlertCircleIcon, SquareRoundedCheckFilledIcon } from 'vue-tabler-icons';

const props = defineProps<{
  currencies: CurrenciesDto[];
  initialData?: any;
}>();

const emit = defineEmits<{
  (e: 'save', data: any): void;
}>();

const formRef = ref();
const valid = ref(false);

const handleSave = (data: any) => {
  emit('save', data);
};

const openForm = () => {
  formRef.value.isDialogActive = true;
};

defineExpose({
  openForm,
  valid
});
</script>

<template>
  <div>
    <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="openForm">
      ضمانت نامه
      <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
      <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
    </v-btn>

    <BaseApprovalForm
      ref="formRef"
      :currencies="currencies"
      :initial-data="initialData"
      request-type="GuaranteeType"
      @save="handleSave"
    />
  </div>
</template>
