<script setup lang="ts">
import { ref } from 'vue';
import ApprovalRequestViewer from '@/components/approval/ApprovalRequestViewer.vue';
import { usePermissionsStore } from '@/stores/permissions';

const emit = defineEmits(['close']);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbar = ref<boolean>(false);
const error = ref<string>('');
const props = defineProps<{
  item: any;
  onSuccess?: () => void;
}>();


</script>

<template>
    <v-row>
      <v-col cols="12" md="12">
        <ApprovalRequestViewer :loan-request-id="props.item.loanRequestId" />
      </v-col>
    </v-row>
  <v-snackbar v-if="error" v-model="error" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" timeout="2500">
    {{ snackbarMessage }}
  </v-snackbar>
</template>
