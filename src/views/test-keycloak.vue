<template>
  <div class="pa-4">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-center">
              <h1>Keycloak Test Page</h1>
            </v-card-title>
            
            <v-card-text>
              <!-- Loading State -->
              <div v-if="!keycloak.ready" class="text-center pa-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">Initializing Keycloak...</p>
              </div>

              <!-- Authentication Status -->
              <div v-else class="pa-4">
                <v-alert
                  :type="keycloak.authenticated ? 'success' : 'warning'"
                  :title="keycloak.authenticated ? 'Authenticated' : 'Not Authenticated'"
                  class="mb-4"
                >
                  <div v-if="keycloak.authenticated">
                    <p><strong>User:</strong> {{ keycloak.userName || 'Unknown' }}</p>
                    <p><strong>Full Name:</strong> {{ keycloak.fullName || 'Unknown' }}</p>
                    <p><strong>Subject:</strong> {{ keycloak.subject || 'Unknown' }}</p>
                  </div>
                  <div v-else>
                    <p>Please click the login button below to authenticate with Keycloak.</p>
                    <p class="text-caption mt-2">
                      <strong>Note:</strong> When you logout, you will be redirected back to the Keycloak login page for re-authentication.
                    </p>
                  </div>
                </v-alert>

                <!-- Token Information (for testing) -->
                <v-expansion-panels v-if="keycloak.authenticated" class="mb-4">
                  <v-expansion-panel>
                    <v-expansion-panel-title>Token Information (Debug)</v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-textarea
                        :model-value="keycloak.token || 'No token available'"
                        readonly
                        variant="outlined"
                        rows="3"
                        class="mt-2"
                      ></v-textarea>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <!-- User Profile -->
                <v-expansion-panels v-if="keycloak.authenticated" class="mb-4">
                  <v-expansion-panel>
                    <v-expansion-panel-title>User Profile</v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <pre>{{ JSON.stringify(keycloak.tokenParsed, null, 2) }}</pre>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <!-- Debug Information -->
                <v-expansion-panels v-if="keycloak.authenticated" class="mb-4">
                  <v-expansion-panel>
                    <v-expansion-panel-title>Available Methods (Debug)</v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div class="text-caption">
                        <p><strong>keycloak.logoutFn:</strong> {{ typeof keycloak.logoutFn }}</p>
                        <p><strong>keycloak.keycloak:</strong> {{ keycloak.keycloak ? 'Available' : 'Not available' }}</p>
                        <p><strong>keycloak.keycloak.logout:</strong> {{ keycloak.keycloak?.logout ? 'Available' : 'Not available' }}</p>
                        <p><strong>keycloak.login:</strong> {{ typeof keycloak.login }}</p>
                        <p><strong>keycloak.loginFn:</strong> {{ typeof keycloak.loginFn }}</p>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>

                <!-- Actions -->
                <div class="d-flex gap-2 flex-wrap">
                  <v-btn
                    v-if="!keycloak.authenticated"
                    color="primary"
                    @click="handleLogin"
                    :loading="isLoading"
                  >
                    Login
                  </v-btn>
                  
                  <v-btn
                    v-if="keycloak.authenticated"
                    color="error"
                    @click="handleLogout"
                    :loading="isLoading"
                  >
                    Logout & Redirect to Login
                  </v-btn>
                  
                  <v-btn
                    v-if="keycloak.authenticated"
                    color="warning"
                    @click="handleLocalLogout"
                    :loading="isLoading"
                  >
                    Local Logout Only
                  </v-btn>
                  
                  <v-btn
                    v-if="keycloak.authenticated"
                    color="secondary"
                    @click="loadProfile"
                    :loading="isLoading"
                  >
                    Load Profile
                  </v-btn>
                  
                  <v-btn
                    v-if="keycloak.authenticated"
                    color="info"
                    @click="refreshToken"
                    :loading="isLoading"
                  >
                    Refresh Token
                  </v-btn>
                  
                  <v-btn
                    v-if="keycloak.authenticated"
                    color="success"
                    @click="testApiCall"
                    :loading="isLoading"
                  >
                    Test API Call
                  </v-btn>
                </div>

                <!-- API Response -->
                <v-card v-if="apiResponse" class="mt-4" variant="outlined">
                  <v-card-title>API Response</v-card-title>
                  <v-card-text>
                    <v-alert
                      :type="apiResponse.success ? 'success' : 'error'"
                      :title="apiResponse.success ? 'API Call Successful' : 'API Call Failed'"
                      class="mb-3"
                    >
                      {{ apiResponse.message }}
                    </v-alert>
                    <pre v-if="apiResponse.data">{{ JSON.stringify(apiResponse.data, null, 2) }}</pre>
                  </v-card-text>
                </v-card>

                <!-- Profile Information -->
                <v-card v-if="userProfile" class="mt-4" variant="outlined">
                  <v-card-title>User Profile</v-card-title>
                  <v-card-text>
                    <pre>{{ JSON.stringify(userProfile, null, 2) }}</pre>
                  </v-card-text>
                </v-card>

                <!-- Realm Access -->
                <v-card v-if="keycloak.realmAccess" class="mt-4" variant="outlined">
                  <v-card-title>Realm Roles</v-card-title>
                  <v-card-text>
                    <v-chip
                      v-for="role in keycloak.realmAccess.roles"
                      :key="role"
                      class="ma-1"
                      color="primary"
                      variant="outlined"
                    >
                      {{ role }}
                    </v-chip>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useKeycloak } from '@dsb-norge/vue-keycloak-js'
import axiosInstance from '@/services/axiosInstance'

const keycloak = useKeycloak()
const isLoading = ref(false)
const userProfile = ref(null)
const apiResponse = ref(null)

const handleLogin = async () => {
  try {
    isLoading.value = true
    await keycloak.login()
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

const handleLogout = async () => {
  try {
    isLoading.value = true
    // Use the logoutFn method from the Keycloak instance
    if (keycloak.logoutFn) {
      await keycloak.logoutFn({
        redirectUri: window.location.origin + '/test-keycloak'
      })
    } else if (keycloak.keycloak && keycloak.keycloak.logout) {
      // Fallback to direct keycloak instance
      await keycloak.keycloak.logout({
        redirectUri: window.location.origin + '/test-keycloak'
      })
    } else {
      throw new Error('Logout function not available')
    }
  } catch (error) {
    console.error('Logout error:', error)
    // Final fallback: try to redirect manually
    try {
      window.location.href = 'http://192.168.251.72:8080/realms/master/protocol/openid-connect/logout?redirect_uri=' + encodeURIComponent(window.location.origin + '/test-keycloak')
    } catch (fallbackError) {
      console.error('Manual logout redirect error:', fallbackError)
    }
  } finally {
    isLoading.value = false
  }
}

const handleLocalLogout = async () => {
  try {
    isLoading.value = true
    // Local logout only - doesn't redirect to Keycloak
    if (keycloak.keycloak && keycloak.keycloak.logout) {
      await keycloak.keycloak.logout({ redirectUri: undefined })
    } else if (keycloak.logoutFn) {
      await keycloak.logoutFn({ redirectUri: undefined })
    } else {
      console.warn('Logout function not available for local logout')
    }
  } catch (error) {
    console.error('Local logout error:', error)
  } finally {
    isLoading.value = false
  }
}

const loadProfile = async () => {
  try {
    isLoading.value = true
    if (keycloak.loadUserProfile) {
      userProfile.value = await keycloak.loadUserProfile()
    }
  } catch (error) {
    console.error('Load profile error:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshToken = async () => {
  try {
    isLoading.value = true
    if (keycloak.keycloak?.updateToken) {
      const refreshed = await keycloak.keycloak.updateToken(5)
      if (refreshed) {
        console.log('Token refreshed')
      } else {
        console.log('Token is still valid')
      }
    }
  } catch (error) {
    console.error('Token refresh error:', error)
  } finally {
    isLoading.value = false
  }
}

const testApiCall = async () => {
  try {
    isLoading.value = true
    apiResponse.value = null
    
    // Test API call - using the token endpoint as an example
    const response = await axiosInstance.get('test')
    
    apiResponse.value = {
      success: true,
      message: 'API call successful! Token was automatically added to the request.',
      data: response.data
    }
    
    console.log('API Response:', response.data)
  } catch (error) {
    console.error('API call error:', error)
    
    apiResponse.value = {
      success: false,
      message: `API call failed: ${error.response?.status} - ${error.response?.statusText || error.message}`,
      data: error.response?.data || null
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
