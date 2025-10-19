<script setup lang="ts">
import { api } from '@/services/api';
import type { SignerData, SubmitChangeSignerPayload } from '@/types/cartable/cartableTypes';
import { onMounted, ref, watch } from 'vue';
const emit = defineEmits(['close']);

const signerData = ref<SignerData[]>([]);
const selectedValidUser = ref<SignerData | null>(null);

const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbar = ref<boolean>(false);
const error = ref<string>('');
const showError = ref(false);

// Watch for error changes
watch(error, (newError) => {
  showError.value = !!newError;
});

const props = defineProps<{
  item: any;
  id?: string | number;
  onSuccess?: () => void;
}>();

const cartableId = ref(props.id ?? '');
const signerId = ref(props.item.id ?? '');
console.log(cartableId.value)
console.log(signerId.value)
const fetchValidSigner = async (id: number) => {
  const res = await api.cartable.getValidSigner(Number(id));
  if (res?.data) {
    signerData.value = res.data;
  }
};

onMounted(async () => {
  await fetchValidSigner(Number(cartableId.value));
});

const loading = ref(false);

const submitForm = async () => {
  try {
    loading.value = true;
    const payload: SubmitChangeSignerPayload = {
      id: Number(signerId.value),
      username: selectedValidUser.value?.username || ''
    };
    const response = await api.cartable.submitChangeSigner(payload, Number(cartableId.value));
    if (response.status === 200) {
      snackbarMessage.value = 'با موفقیت ثبت شد';
      snackbarColor.value = 'success';
      snackbar.value = true;
      props.onSuccess?.();
      emit('close');
    } else {
      throw new Error(response.statusText || 'خطا در ثبت اطلاعات');
    }
  } catch (e: any) {
    error.value = e?.message ?? 'خطایی رخ داد';
    snackbarMessage.value = error.value;
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="submitForm">
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedValidUser"
          :items="signerData"
          item-title="name"
          item-value="username"
          label="انتخاب کاربر"
          variant="outlined"
          return-object
          chips
          closable-chips
          persistent-hint
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="12" style="display: flex; justify-content: center; gap: 10px">
        <v-btn type="submit" color="primary" :loading="loading">تایید</v-btn>
        <v-btn color="error" @click="emit('close')">انصراف</v-btn>
      </v-col>
    </v-row>
  </form>
  <v-snackbar v-if="error" v-model="showError" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" timeout="2500">
    {{ snackbarMessage }}
  </v-snackbar>
</template>