<template>
  <v-card class="pa-4">
    <v-card-title class="text-h5 mb-4">
      Axios Configuration Test
    </v-card-title>

    <v-card-text>
      <!-- Test Axios Instance -->
      <v-btn 
        @click="testAxiosConfig" 
        color="primary" 
        :loading="loading"
        class="mb-4"
      >
        Test Axios Configuration
      </v-btn>

      <!-- Results -->
      <div v-if="results" class="mt-4">
        <v-card variant="outlined" class="pa-3">
          <v-card-title class="text-h6">Test Results</v-card-title>
          <pre class="text-body-2">{{ JSON.stringify(results, null, 2) }}</pre>
        </v-card>
      </div>

      <!-- Error -->
      <div v-if="error" class="mt-4">
        <v-alert type="error" title="Error">
          {{ error }}
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axiosInstance from '@/services/axiosInstance';
import { useAuthStore } from '@/stores/auth';

const loading = ref(false);
const results = ref<any>(null);
const error = ref<string | null>(null);
const authStore = useAuthStore();

const testAxiosConfig = async () => {
  try {
    loading.value = true;
    error.value = null;
    results.value = null;

    console.log('🔧 Testing axios configuration...');

    // Test 1: Check axios instance
    const config = {
      baseURL: axiosInstance.defaults.baseURL,
      timeout: axiosInstance.defaults.timeout,
      headers: axiosInstance.defaults.headers
    };

    console.log('Axios config:', config);

    // Test 2: Check auth token
    const token = authStore.user?.token;
    console.log('Auth token:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20) + '...'
    });

    // Test 3: Try a simple API call
    console.log('Making test API call...');
    const response = await axiosInstance.get('/api/v1/token');
    
    console.log('API response:', response);

    results.value = {
      axiosConfig: config,
      authToken: {
        hasToken: !!token,
        tokenLength: token?.length || 0
      },
      apiResponse: {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      }
    };

  } catch (err: any) {
    console.error('❌ Axios test failed:', err);
    error.value = err.toString();
    
    results.value = {
      error: err.toString(),
      axiosConfig: {
        baseURL: axiosInstance.defaults.baseURL,
        timeout: axiosInstance.defaults.timeout
      },
      authToken: {
        hasToken: !!authStore.user?.token,
        tokenLength: authStore.user?.token?.length || 0
      }
    };
  } finally {
    loading.value = false;
  }
};
</script> 