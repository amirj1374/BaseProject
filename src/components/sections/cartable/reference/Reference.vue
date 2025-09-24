<script setup lang="ts">
import ShamsiDatePicker from '@/components/shared/ShamsiDatePicker.vue';
import { api } from '@/services/api';
import type { ActionData, SubmitReferencePayload, ValidRole } from '@/types/cartable/cartableTypes';
import { onMounted, ref, watch, computed } from 'vue';
import ApprovalRequestViewer from '../sign/ApprovalRequestViewer.vue';
import { usePermissionsStore } from '@/stores/permissions';
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue';
import user from '@/services/modules/user';

const confirmDialog = ref(false);
const permissionsStore = usePermissionsStore();
const tableRef = ref();
const emit = defineEmits(['close']);

const actionsData = ref<ActionData[]>([]);
const selectedAction = ref<ActionData | null>(null);
const selectedRole = ref<ValidRole | null>(null);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbar = ref<boolean>(false);
const error = ref<string>('');
const selectedDate = ref<string | null>(null);
const props = defineProps<{
  item: any;
  onSuccess?: () => void;
  expertReportUrl?: string;
}>();

const id = ref(props.item?.id ?? '');

const downloadExpertReport = async () => {
  if (props.item.expertReportUrl) {
    try {
      // Fetch the file
      const response = await fetch(props.item.expertReportUrl);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'expert-report.pdf';
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading expert report:', error);
      // Fallback to opening in new tab
      window.open(props.expertReportUrl, '_blank');
    }
  }
};

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
    selectedValidUser.value = [];
  }
});

const description = ref('');

const loading = ref(false);

const submitForm = async () => {
  // Validate user selection before submitting
  if (userSelectionError.value) {
    error.value = userSelectionError.value;
    snackbarMessage.value = error.value;
    snackbarColor.value = 'error';
    snackbar.value = true;
    return;
  }

  try {
    loading.value = true;
    const payload: SubmitReferencePayload = {
      cartableId: Number(id.value),
      roleDTO: {
        name: selectedRole.value?.roleName ?? '',
        code: Number(selectedRole.value?.roleCode ?? 0)
      },
      description: description.value,
      actionType: selectedAction.value?.actionType ?? '',
      usernameList: selectedValidUser.value.map((user) => user.username), // Extract usernames from selected users array
      correctionDeadline: selectedDate?.value ?? undefined
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
const selectedValidUser = ref<any[]>([]); // Changed from any | null to any[]

// Validation for user selection
const userSelectionError = computed(() => {
  if (!selectedRole.value) return '';

  const minUsers = selectedRole.value.minUserNumber || 0;
  const maxUsers = selectedRole.value.maxUserNumber || 0;
  const selectedCount = selectedValidUser.value.length;

  if (minUsers > 0 && selectedCount < minUsers) {
    return `حداقل ${minUsers} کاربر باید انتخاب شود`;
  }

  if (maxUsers > 0 && selectedCount > maxUsers) {
    return `حداکثر ${maxUsers} کاربر می‌تواند انتخاب شود`;
  }

  return '';
});

const userSelectionHelperText = computed(() => {
  if (!selectedRole.value) return '';

  const minUsers = selectedRole.value.minUserNumber || 0;
  const maxUsers = selectedRole.value.maxUserNumber || 0;

  if (minUsers > 0 && maxUsers > 0) {
    return `انتخاب ${minUsers} تا ${maxUsers} کاربر`;
  } else if (minUsers > 0) {
    return `حداقل ${minUsers} کاربر`;
  } else if (maxUsers > 0) {
    return `حداکثر ${maxUsers} کاربر`;
  }

  return '';
});

const handleValidUser = async (role: ValidRole) => {
  if (!role || !selectedAction.value) return;
  const res = await api.cartable.getValidUser({
    id: Number(id.value),
    actionType: selectedAction.value.actionType,
    roleName: String(role.roleName)
  });
  if (res?.data) {
    validUserOptions.value = res.data;
    selectedValidUser.value = []; // Reset to empty array instead of null
  } else {
    validUserOptions.value = [];
    selectedValidUser.value = [];
  }
};

const roleOptions = computed(() =>
  selectedAction.value
    ? selectedAction.value.validRoles.map((role) => ({
        ...role,
        display: `${role.roleDescription} - ${role.departmentLevelName}`
      }))
    : []
);

const download1016Report = async () => {
  if (props.item.report1016Url) {
    try {
      // Fetch the file
      const response = await fetch(props.item.report1016Url);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '1016-report.pdf';
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading 1016 report:', error);
      // Fallback to opening in new tab
      window.open(props.item.report1016Url, '_blank');
    }
  }
};

watch(validUserOptions, (newOptions) => {
  if (newOptions.length > 0) {
    selectedValidUser.value = []; // Reset to empty array instead of selecting first item
  } else {
    selectedValidUser.value = [];
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
          multiple
          chips
          closable-chips
          :error-messages="userSelectionError"
          :hint="userSelectionHelperText"
          persistent-hint
          :color="userSelectionError ? 'error' : 'primary'"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="12">
        <v-text-field v-model="description" label="توضیحات" variant="outlined" clearable />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <ShamsiDatePicker
          v-if="selectedRole?.canSetCorrectionDeadline === true"
          v-model="selectedDate"
          label="تاریخ مهلت اصلاح شعبه"
          variant="outlined"
          clearable
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="3" v-if="props.item.expertReportUrl && permissionsStore.hasMenuPermission('downloadExpertReport')">
        <v-btn color="info" @click="downloadExpertReport" variant="tonal"> دانلود گزارش کارشناسی </v-btn>
      </v-col>
      <v-col cols="12" md="3" v-if="props.item.report1016Url && permissionsStore.hasMenuPermission('download1016')">
        <v-btn color="info" @click="download1016Report" variant="tonal"> دانلود فرم 1016 </v-btn>
      </v-col>
      <v-col cols="12" md="3" v-if="props.item.expertReportUrl && permissionsStore.hasMenuPermission('reviewExpertReport')">
        <v-switch v-model="props.item.expertReportIsSeen" inset color="primary" hide-details class="me-2" />
        <span>گزارش کارشناسی مشاهده شد</span>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="12">
        <ApprovalRequestViewer :loan-request-id="props.item.loanRequestId" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="12" style="display: flex; justify-content: center; gap: 10px">
        <v-btn variant="tonal" @click="confirmDialog = true" color="primary" :loading="loading">تایید</v-btn>
        <v-btn color="error" @click="emit('close')">انصراف</v-btn>
      </v-col>
    </v-row>
  </form>

  <ConfirmDialog
    v-model="confirmDialog"
    confirmText="تایید"
    :message="`آیا از عملیات ${selectedAction?.actionName} به ${selectedRole?.roleDescription} (${selectedValidUser.map((user) => user.name)}) مطمئن هستید؟`"
    cancelText="انصراف"
    :loading="loading"
    color="primary"
    @confirm="submitForm"
  >
  </ConfirmDialog>
  <v-snackbar v-if="error" v-model="error" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" timeout="2500">
    {{ snackbarMessage }}
  </v-snackbar>
</template>
