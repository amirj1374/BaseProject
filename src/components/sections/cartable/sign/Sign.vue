<script setup lang="ts">
import { api } from '@/services/api';
import type { SubmitSignPayload } from '@/types/cartable/cartableTypes';
import { onMounted, ref } from 'vue';
import ApprovalRequestViewer from './ApprovalRequestViewer.vue';
import { usePermissionsStore } from '@/stores/permissions';

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
const agreed = ref(false);
const loading = ref(false);

const downloadExpertReport = () => {
  if (props.item.expertReportUrl) {
    const link = document.createElement('a');
    link.href = props.item.expertReportUrl;
    link.download = 'expert-report.pdf'; // You can customize the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const download1016Report = () => {
  if (props.item.report1016Url) {
    const link = document.createElement('a');
    link.href = props.item.report1016Url;
    link.download = '1016-report.pdf'; // You can customize the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

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
    const payload: SubmitSignPayload = {
      cartableId: Number(id.value),
      comment: description.value,
      agreed: Boolean(agreed.value),
      expertReportIsSeen: getExpertReportIsSeenValue(),
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
      <v-col cols="12" md="3">
        <v-radio-group v-model="agreed" color="primary" class="d-flex flex-column justify-center" direction="center">
          <v-radio color="success" label="موافقم" :value="true"></v-radio>
          <v-radio color="error" label="مخالفم" :value="false"></v-radio>
        </v-radio-group>
      </v-col>
      <v-col cols="12" md="3" v-if="props.item.expertReportUrl && permissionsStore.hasMenuPermission('reviewExpertReport')">
        <v-btn  color="info" @click="downloadExpertReport" variant="tonal"> دانلود گزارش کارشناسی </v-btn>
      </v-col>
      <v-col cols="12" md="3" v-if="props.item.report1016Url && permissionsStore.hasMenuPermission('create1016')">
        <v-btn color="info" @click="download1016Report" variant="tonal"> دانلود گزارش 1016 </v-btn>
      </v-col>
      <v-col cols="12" md="3" v-if="props.item.expertReportUrl && permissionsStore.hasMenuPermission('reviewExpertReport')">
        <v-switch 
            v-model="props.item.expertReportIsSeen" 
            inset 
            color="primary" 
            hide-details 
            class="me-2" 
          />
          <span>گزارش کارشناسی مشاهده شد</span>
      </v-col>
              <v-col cols="12" md="12">
          <ApprovalRequestViewer :loan-request-id="props.item.loanRequestId" />
        </v-col>
      <v-col cols="12" md="12">
        <v-textarea  v-model="description" label="توضیحات" variant="outlined" clearable />
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
