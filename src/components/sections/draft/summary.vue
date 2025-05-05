<script lang="ts" setup>
import { ref } from 'vue';
import { api } from '@/services/api';

const nationalCodeErrors = ref([]);
const loading = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);

// initial data
const formData = ref({
  cif: '',
  nationalCode: ''
});

// submit form
const submitData = async () => {
  if (canSubmit.value === false) {
    return Promise.reject('لطفا ابتدا خلاصه درخواست مشتری را وارد کنید');
  } else return Promise.resolve();
};

defineExpose({ submitData });
</script>

<template>
  <v-card variant="flat">
    <form @submit.prevent="submitData">
      <v-row class="mt-2">
        <!-- National Code Input -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="formData.nationalCode"
            label="نوع فعالیت"
            variant="outlined"
            density="comfortable"
            :error-messages="nationalCodeErrors"
          />
        </v-col>
        <!-- National Code Input -->
        <v-col cols="12" md="6">
          <v-text-field
          v-model="formData.nationalCode"
          label="خلاصه درخواست"
          variant="outlined"
          density="comfortable"
          :error-messages="nationalCodeErrors"
          />
        </v-col>
      </v-row>
      <v-snackbar v-if="error" v-model="error" color="error" timeout="5500">
        {{ error }}
      </v-snackbar>
    </form>
  </v-card>
</template>
