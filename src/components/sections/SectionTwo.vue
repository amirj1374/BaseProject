<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios'
import { api } from '@/services/api';

// Define props if needed. For example, you might pass step-specific data.
const props = defineProps<{
  stepData?: Record<string, any>
}>()

const loading = ref(false)
const select = ref('')
const ex4 = ref(['red', 'indigo', 'orange', 'primary', 'secondary', 'success', 'info', 'warning', 'error', 'red darken-3', 'indigo darken-3', 'orange darken-3'])
const items = ref([
  { title: 'مسئول', value: 1 },
  { title: 'مشتری', value: 2 },
  { title: 'ضامن', value: 3 }
]);
const error = ref<string | null>(null)
  // const customerId = ref('12345')
  // const duration = ref('2022')

// the methud get all data
// const fetchData = async() => {
//   loading.value = true
//   error.value = null
//   try {
//     const response = api.transaction.getAccountTurnOver(customerId.value, duration.value);
//   } catch {
//
//   }
// }

// The method that performs the API call.
const submitData = async (): Promise<void> => {
  loading.value = true
  error.value = null
  try {
    // Replace with your actual API endpoint and payload.
    const response = await axios.post('/api/section-one-endpoint', props.stepData || {})
    if (response.status === 200) {
      // API call succeeded.
      return Promise.resolve()
    } else {
      error.value = `Error: ${response.statusText}`
      return Promise.reject(new Error(response.statusText))
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred.'
    return Promise.reject(err)
  } finally {
    loading.value = false
  }
}
// Call fetchData on component mount
// onMounted(() => {
//   fetchData()
// })

// Expose the method so that the parent component can call it.
defineExpose({ submitData })
</script>

<template>
  <div>
    <template v-if="loading">
      <p>Loading...</p>
    </template>
    <template v-else>
  <div>
    <v-container fluid>
      <v-row class="mt-5">
        <v-col
          cols="12"
          md="4"
          sm="4"
        >
          <v-checkbox
            v-model="ex4"
            color="primary"
            label="تسهیلات"
            value="facilities"
            class="inputCenter"
            hide-details
          ></v-checkbox>
          <v-card title="تسهیلات" text="..." variant="outlined" >
            <v-select
              v-model="select"
              :items="items"
              item-title="title"
              item-value="value"
              label="نوع مصوبه"
              variant="outlined"
              persistent-hint
              single-line
              clearable
            ></v-select>
            <v-card-actions>
              <v-btn variant="outlined" color="primary">تایید</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="4"
          sm="4"
        >
        <v-checkbox
            v-model="ex4"
            color="primary"
            label="ضمانت نامه"
            value="warranty"
                 class="inputCenter"
            hide-details
          ></v-checkbox>
        </v-col>
        <v-col
          cols="12"
          md="4"
          sm="4"
        >
        <v-checkbox
            v-model="ex4"
            color="primary"
            label="اعتبار اسنادی"
            value="letter of credit"
                 class="inputCenter"
            hide-details
          ></v-checkbox>
        </v-col>
      </v-row>
    </v-container>
  </div>
    </template>
  </div>
</template>

<style scoped>
.inputCenter {
  display: flex;
  justify-content: center;
}
</style>
