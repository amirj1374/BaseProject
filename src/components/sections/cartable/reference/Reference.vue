<script setup lang="ts">
import { api } from '@/services/api';
import { onMounted, ref } from 'vue';

const emit = defineEmits(['close']);
const items = ref<any[]>([]);
const action = ref<string>('');
const percent = ref<number | null>(null);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbar = ref<boolean>(false);
const error = ref<string>('');
const props = defineProps<{
  item: any;
  onSuccess?: () => void;
}>();

const id = ref(props.item?.id ?? '');

const fetchValidUsers = async (selectedValue: string) => {
  const res = await api.cartable.getValidRoles(Number(selectedValue));
  if (res?.data) {
    items.value = res.data.map((item: any) => ({
      ...item,
      display: `${item.actionName} - ${item.roleName}`,
    }));
  }
};

onMounted(async () => {
  await fetchValidUsers(id.value);
});

const submitForm = async () => {
  try {
    const payload: any = {
      shesaCode: action.value,
      percent: percent.value,
    };
    snackbarMessage.value = 'با موفقیت ثبت شد';
    snackbarColor.value = 'success';
    snackbar.value = true;
    props.onSuccess?.();
    emit('close');
  } catch (e: any) {
    error.value = e?.message ?? 'خطایی رخ داد';
  }
};

const handleValidUser =  (value: any) => {
  console.log(value)
  // const res = api.cartable.getValidUser()
};
</script>

<template>
  <form @submit.prevent="submitForm">
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          :items="items"
          v-model="action"
          item-title="display"
          item-value="roleCode"
          variant="outlined"
          label="عمل - نقش"
          required
          @update:modelValue="handleValidUser"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="percent" variant="outlined" label="درصد" required type="number" step="0.01" min="0" max="100" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="12" style="display: flex; justify-content: center; gap: 10px">
        <v-btn type="submit" color="primary">اضافه کردن</v-btn>
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