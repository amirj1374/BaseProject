<script lang="ts" setup>
import { ref, defineExpose } from 'vue'
import FakeData from './sectionTwoData.json'
import axios from 'axios'

// Define props if needed. For example, you might pass step-specific data.
const props = defineProps<{
  stepData?: Record<string, any>
}>()

const loading = ref(false)
const selectedCollateral = ref<string>();
const error = ref<string | null>(null)

// The method that performs the API call.
const submitData = async (): Promise<void> => {

  // loading.value = true
  // error.value = null
  // try {
  //   // Replace with your actual API endpoint and payload.
  //   const response = await axios.post('/api/section-one-endpoint', props.stepData || {})
  //   if (response.status === 200) {
  //     // API call succeeded.
  //     return Promise.resolve()
  //   } else {
  //     error.value = `Error: ${response.statusText}`
  //     return Promise.reject(new Error(response.statusText))
  //   }
  // } catch (err: any) {
  //   error.value = err.message || 'An error occurred.'
  //   return Promise.reject(err)
  // } finally {
  //   loading.value = false
  // }
}

// Expose the method so that the parent component can call it.
defineExpose({ submitData })
</script>

<template>
  <div>
    <template v-if="loading">
      <p>Loading...</p>
    </template>
    <div style="width: 100%; display: flex; justify-content: center; padding-top: 25px">
      <v-col cols="12" md="4" sm="4">
        <v-select
          v-model="selectedCollateral"
          :items="FakeData.collateral"
          item-title="DESCRIPTION"
          item-value="ID"
          label="نوع وثیقه"
          variant="outlined"
          persistent-hint
          single-line
          clearable
        ></v-select>
      </v-col>
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
  margin-top: 0.5em;
}
</style>
