<script setup lang="ts">
import { api } from '@/services/api';
import type { SubmitSignPayload } from '@/types/cartable/cartableTypes';
import { onMounted, ref, computed } from 'vue';
import ApprovalRequestViewer from '../../../approval/ApprovalRequestViewer.vue';
import { usePermissionsStore } from '@/stores/permissions';
import DownloadButton from '@/components/shared/DownloadButton.vue';

const emit = defineEmits(['close']);
const permissionsStore = usePermissionsStore();
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
const actionType = ref('');
const loading = ref(false);

// Conditional requirement for description when action type is DISAGREED or RETURNED
const needsComment = computed(() => actionType.value === 'DISAGREED' || actionType.value === 'RETURNED');

// Show field error instead of snackbar for this validation
const descriptionErrors = computed(() => (needsComment.value && !description.value ? ['این فیلد الزامی است'] : []));


// Function to determine expertReportIsSeen value based on conditions
const getExpertReportIsSeenValue = (): boolean | null => {
  const hasPermission = permissionsStore.hasMenuPermission('reviewExpertReport');
  const hasExpertReportUrl = props.item.expertReportUrl;

  // Condition is false: send null
  if (!(!hasExpertReportUrl && hasPermission)) {
    return null;
  }

  // Condition is true: check switch state
  return Boolean(props.item.expertReportIsSeen);
};

const submitForm = async () => {
  try {
    loading.value = true;

    // Guard: require description for DISAGREED or RETURNED (use field error)
    if (needsComment.value && !description.value) {
      return;
    }

    const payload: SubmitSignPayload = {
      cartableId: Number(id.value),
      comment: description.value,
      actionType: actionType.value,
      expertReportIsSeen: getExpertReportIsSeenValue()
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
// Form validation (Vuetify rule)
const required = (v: any) => (needsComment.value ? (!!v || 'این فیلد الزامی است') : true);
</script>

<template>
  <form @submit.prevent="submitForm">
    <v-row>
      <v-col cols="12" md="3">
        <v-radio-group v-model="actionType" color="primary" class="d-flex flex-column justify-center" direction="center">
          <v-radio color="success" label="موافقم" :value="'AGREED'"></v-radio>
          <v-radio color="error" label="مخالفم" :value="'DISAGREED'"></v-radio>
          <v-radio color="warning" label="عودت" :value="'RETURNED'"></v-radio>
        </v-radio-group>
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
      <v-col cols="12" md="3" v-if="props.item.formLetterUrl && permissionsStore.hasMenuPermission('downloadDirectiveReport')">
        <DownloadButton 
          :url="props.item.formLetterUrl"
          title="دانلود گزارش ابلاغیه"
          color="secondary"
          variant="tonal"
          filename="directive-report.pdf"
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
      <v-col cols="12" md="12">
        <ApprovalRequestViewer :loan-request-id="props.item.loanRequestId" />
      </v-col>
      <v-col cols="12" md="12">
        <v-textarea
          v-model="description"
          label="توضیحات"
          variant="outlined"
          clearable
          :error-messages="descriptionErrors"
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
