<template>
    <v-form ref="formRef" @submit.prevent="submitData">
      <v-row>
        <v-col cols="12" md="12">
          <DescriptionInput
            v-model="form.discription"
            label="پیشنهادات و توضیحات"
            placeholder="لطفا توضیحات را وارد کنید..."
            :start-number="1"
            :auto-numbering="true"
            :rows="6"
            :maxlength="2000"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="12" class="d-flex justify-center gap-2">
        <v-btn type="submit" variant="tonal" color="success">تایید</v-btn>
        <v-btn variant="tonal" color="error" @click="emit('close')">انصراف</v-btn>
        </v-col>
      </v-row>
    </v-form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import DescriptionInput from '@/components/shared/DescriptionInput.vue';
const emit = defineEmits(['close']);

const props = defineProps<{
  item: {
    id: number;
    [key: string]: any;
  };
  onSuccess?: () => void;
}>();
const formRef = ref();

// Local form data - only updates store on submit
const form = ref({
  discription: ''
});

const submitData = async () => {
  try {
    // Validate that we have the required cartableId
    if (!props.item?.id) {
      console.error('Missing cartableId in props.item:', props.item);
      return Promise.reject('شناسه کارتابل یافت نشد');
    }

    const payload = {
      cartableId: props.item.id,
      Description: form.value.discription
    };
    console.log('Submitting payload:', payload);

    // Call saveCreditApproval API
    const res = await api.cartable.addCreditApprovalDescription(payload);

    if (res?.status === 200 && res.data) {
      console.log('Credit approval data saved successfully:', res.data);
      // Call onSuccess callback if provided
      if (props.onSuccess) {
        props.onSuccess();
      }
      return Promise.resolve();
    }

    return Promise.reject('خطا در ثبت اطلاعات');
  } catch (e) {
    console.error('Error saving credit approval data:', e);
    return Promise.reject('خطا در ثبت اطلاعات');
  }
};

defineExpose({ submitData });
</script>

<style scoped>
.credit-approval-form {
  padding: 8px;
}
</style>
