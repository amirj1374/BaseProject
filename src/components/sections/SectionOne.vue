<script lang="ts" setup>
import { ref, defineExpose } from 'vue';
import { api } from '@/services/api';
import Loading from '@/components/Loading.vue';

// Define interfaces
interface CustomerDTO {
  nationalCode: string;
}

interface InsertPersonPayload {
  personType: number;
  customerDTO: CustomerDTO;
}
const loading = ref(false);
const error = ref<string | null>(null);
// Sample select items for person type
const items = [
  { title: 'مسئول', value: 1 },
  { title: 'مشتری', value: 2 },
  { title: 'ضامن', value: 3 },
];

const formData = ref({
  personType: null,
  nationalCode: ''
});
const submitData = async (): Promise<void> => {
  loading.value = true;
  error.value = null;
  try {
    // Build the payload based on our interfaces
    const payload: InsertPersonPayload = {
      personType: Number(formData.value.personType),
      customerDTO: {
        nationalCode: formData.value.nationalCode,
      },
    };
    // Call the API and check the response
    const response = await api.transaction.insertPersonByNationalCode(payload);
    if (response.status === 200) {
      return Promise.resolve();
    } else {
      error.value = `Error: ${response.statusText}`;
      return Promise.reject(new Error(response.statusText));
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred.';
    return Promise.reject(err);
  } finally {
    loading.value = false;
  }
};

defineExpose({ submitData });
</script>

<template>
  <v-card variant="flat">
    <template v-if="loading">
      <Loading />
    </template>
    <template v-else>
      <form @submit.prevent="submitData">
        <v-container>
          <v-row>
            <!-- National Code Input -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.nationalCode"
                label="کد ملی"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <!-- Person Type Select -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.personType"
                :items="items"
                item-title="title"
                item-value="value"
                label="نوع شخص"
                variant="outlined"
                persistent-hint
                single-line
                clearable
              ></v-select>
            </v-col>
          </v-row>
        </v-container>
        <v-snackbar v-if="error" v-model="error" color="error" timeout="3000">
          {{ error }}
        </v-snackbar>
      </form>
    </template>
  </v-card>
</template>

<style scoped>
.error {
  color: red;
  margin-top: 0.5em;
}
</style>
