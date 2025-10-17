<script setup lang="ts">
import ShamsiDatePicker from '@/components/shared/ShamsiDatePicker.vue';
import { api } from '@/services/api';
import type { ActionData, SubmitReferencePayload, ValidRole } from '@/types/cartable/cartableTypes';
import { onMounted, ref, watch, computed } from 'vue';
import ApprovalRequestViewer from '@/components/approval/ApprovalRequestViewer.vue';
import { usePermissionsStore } from '@/stores/permissions';
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue';
import DownloadButton from '@/components/shared/DownloadButton.vue';

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
const required = (v: any) => !!v || 'این فیلد الزامی است';
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
      correctionDeadline: selectedDate?.value ?? undefined,
      expertReportIsSeen: props.item.expertReportIsSeen
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

// Check if all required fields are valid
const isFormValid = computed(() => {
  // Check if action is selected
  if (!selectedAction.value) return false;
  
  // Check if role is selected
  if (!selectedRole.value) return false;
  
  // Check if users are selected and meet validation requirements
  if (userSelectionError.value) return false;
  
  // If role has minimum user requirements, ensure users are selected
  const minUsers = selectedRole.value.minUserNumber || 0;
  if (minUsers > 0 && selectedValidUser.value.length < minUsers) return false;
  
  return true;
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
          :rules="[required]"
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
      <v-col cols="12" md="3" v-if="props.item.formLetterUrl && permissionsStore.hasMenuPermission('downloadDirectiveReport')">
        <DownloadButton 
          :url="props.item.formLetterUrl"
          title="دانلود گزارش ابلاغیه"
          color="secondary"
          variant="tonal"
          filename="directive-report.pdf"
        />
      </v-col>
      <v-col cols="12" md="3" v-if="props.item.expertReportUrl && permissionsStore.hasMenuPermission('downloadExpertReport')">
        <DownloadButton 
          :url="props.item.expertReportUrl"
          title="دانلود گزارش کارشناسی"
          color="secondary"
          variant="tonal"
          filename="expert-report.pdf"
        />
      </v-col>
      <v-col cols="12" md="3" v-if="props.item.report1016Url && permissionsStore.hasMenuPermission('download1016')">
        <DownloadButton 
          :url="props.item.report1016Url"
          title="دانلود فرم 1016"
          color="secondary"
          variant="tonal"
          filename="form-1016.pdf"
        />
      </v-col>
      <v-col cols="12" md="3" v-if="props.item.formCreditApprovalUrl && permissionsStore.hasMenuPermission('formCreditApprovalUrl')">
        <DownloadButton 
          :url="props.item.formCreditApprovalUrl"
          title="دانلود فرم پیش مصوبه اعتبارات"
          color="secondary"
          variant="tonal"
          filename="credit-approval-form.pdf"
        />
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
        <v-btn variant="tonal" @click="confirmDialog = true" color="primary" :loading="loading" :disabled="!isFormValid">تایید</v-btn>
        <v-btn color="error" @click="emit('close')">انصراف</v-btn>
      </v-col>
    </v-row>
  </form>

  <ConfirmDialog
    v-model="confirmDialog"
    confirmText="تایید"
    :message="`آیا از عملیات ${selectedAction?.actionName} به ${selectedRole?.roleDescription} (${selectedValidUser.map((user) => user.name)}) اطمینان دارید؟`"
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
