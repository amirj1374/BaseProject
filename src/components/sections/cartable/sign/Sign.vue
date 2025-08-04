<script setup lang="ts">
import { api } from '@/services/api';
import type { ActionData, SubmitReferencePayload, SubmitSignPayload, ValidRole } from '@/types/cartable/cartableTypes';
import { onMounted, ref, watch, computed } from 'vue';

const tableRef = ref();
const emit = defineEmits(['close']);

const actionsData = ref<ActionData[]>([]);
const selectedAction = ref<ActionData | null>(null);
const selectedRole = ref<ValidRole | null>(null);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbar = ref<boolean>(false);
const error = ref<string>('');
const props = defineProps<{
  item: any;
  onSuccess?: () => void;
}>();
const id = ref(props.item?.id ?? '');
const description = ref('');
const agreed = ref(false);
const loading = ref(false);
const submitForm = async () => {
  try {
    loading.value = true;
    const payload: SubmitSignPayload = {
      cartableId: Number(id.value),
      comment: description.value,
      agreed: Boolean(agreed.value)
    };
    const response = await api.cartable.submitSign(payload);
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
        <v-col cols="12" md="12">
            <v-radio-group v-model="agreed" color="primary" class="d-flex flex-column justify-center" direction="center" >
              <v-radio
                color="success"
                label="موافقم"
                :value="true"
              ></v-radio>
              <v-radio
                color="error"
                label="مخالفم"
                :value="false"
              ></v-radio>
            </v-radio-group>
        </v-col>
        <v-col cols="12" md="12">
            <v-textarea v-model="description" label="توضیحات" variant="outlined" clearable />
        </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="12" style="display: flex; justify-content: center; gap: 10px">
        <v-btn type="submit" color="primary" :loading="loading">تایید</v-btn>
      </v-col>
    </v-row>
  </form>
  <v-snackbar v-if="error" v-model="error" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" timeout="2500">
    {{ snackbarMessage }}
  </v-snackbar>
</template>