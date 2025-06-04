<script setup lang="ts">
import { api } from '@/services/api';
import type { ActionData, SubmitReferencePayload, ValidRole } from '@/types/cartable/cartableTypes';
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

const fetchValidUsers = async (selectedValue: string) => {
  const res = await api.cartable.getValidRoles(Number(selectedValue));
  if (res?.data) {
    actionsData.value = res.data;
    // Auto-select first action and its first role (from roleOptions)
    if (actionsData.value.length > 0) {
      selectedAction.value = actionsData.value[0];
      if (roleOptions.value.length > 0) {
        selectedRole.value = roleOptions.value[0];
      }
    }
  }
};

onMounted(async () => {
  await fetchValidUsers(id.value);
});

// When action changes, auto-select its first role (from roleOptions)
watch(selectedAction, () => {
  if (roleOptions.value.length > 0) {
    selectedRole.value = roleOptions.value[0];
  } else {
    selectedRole.value = null;
  }
});

// When role changes, fetch valid users
watch(selectedRole, (newRole) => {
  if (newRole) {
    handleValidUser(newRole);
  } else {
    validUserOptions.value = [];
    selectedValidUser.value = null;
  }
});

const description = ref('');

const loading = ref(false);

const submitForm = async () => {
  try {
    loading.value = true;
    const payload: SubmitReferencePayload = {
      cartableId: Number(id.value),
      roleDTO: {
        name: selectedRole.value?.roleName ?? '',
        code: Number(selectedRole.value?.roleCode ?? 0),
      },
      description: description.value,
      actionType: selectedAction.value?.actionType ?? '',
      username: selectedValidUser.value?.username ?? '',
    };
    const response = await api.cartable.submitReference(payload);
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

const percent = ref<number | null>(null);

const validUserOptions = ref<any[]>([]);
const selectedValidUser = ref<any | null>(null);

const handleValidUser = async (role: ValidRole) => {
  if (!role || !selectedAction.value) return;
  const res = await api.cartable.getValidUser({
  id: Number(id.value),
  actionType: selectedAction.value.actionType,
  roleCode: String(role.roleCode)
});
  if (res?.data) {
    validUserOptions.value = res.data;
    selectedValidUser.value = res.data[0] || null;
  } else {
    validUserOptions.value = [];
    selectedValidUser.value = null;
  }
};

const roleOptions = computed(() =>
  selectedAction.value
    ? selectedAction.value.validRoles.map(role => ({
        ...role,
        display: `${role.roleName} - ${role.departmentLevelName}`
      }))
    : []
);

watch(validUserOptions, (newOptions) => {
  if (newOptions.length > 0) {
    selectedValidUser.value = newOptions[0];
  } else {
    selectedValidUser.value = null;
  }
});
</script>

<template>
  <form @submit.prevent="submitForm">
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedAction"
          :items="actionsData"
          item-title="actionName"
          item-value="actionType"
          label="انتخاب عملیات"
          variant="outlined"
          return-object
          @update:modelValue="(val: ActionData) => console.log('Action changed:', val)"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedRole"
          :items="roleOptions"
          item-title="display"
          item-value="roleCode"
          label="انتخاب نقش"
          variant="outlined"
          return-object
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-if="validUserOptions.length"
          v-model="selectedValidUser"
          :items="validUserOptions"
          item-title="name"
          item-value="id"
          label="انتخاب کاربر"
          variant="outlined"
          return-object
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="12">
        <v-text-field
          v-model="description"
          label="توضیحات"
          variant="outlined"
          clearable
        />
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