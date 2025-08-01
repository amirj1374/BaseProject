# Automatic API Call System

## Overview

The application automatically calls the `getUserInfo` API (`/api/v1/token`) when the project starts. This ensures that user information and permissions are loaded immediately after authentication.

## How It Works

### 1. **App Initialization**
When the Vue app starts (`src/App.vue`):
- Checks if a user is logged in (from localStorage)
- If logged in, automatically calls the user info API
- Shows loading indicator during the API call
- Logs detailed information to console

### 2. **API Call Flow**
```
App Start → Check Auth State → Call /api/v1/token → Store User Info → Update Permissions
```

### 3. **Loading States**
- **Loading Overlay**: Shows when API call is in progress
- **Console Logs**: Detailed logging for debugging
- **Error Handling**: Graceful error handling with user feedback

## Console Logs

When the app starts, you'll see these logs in the browser console:

```
🚀 App starting - checking user authentication...
Current auth state: { user: true, userInfo: false, token: "Present" }
✅ User is logged in, fetching user info from API...
🔄 Fetching user info from API...
✅ User info fetched and stored successfully
✅ User info loaded successfully: { username: "lending3", roles: 8, authorities: 5 }
```

## Files Involved

### Core Files
- `src/App.vue` - Main app initialization
- `src/stores/auth.ts` - Auth store with loading state
- `src/services/userInfoService.ts` - API service
- `src/components/Loading.vue` - Loading overlay component

### Test Files
- `src/views/ApiTestPage.vue` - Test page to verify API calls
- `src/components/examples/SimpleApiTest.vue` - Manual API test component

## Testing the Automatic API Call

### 1. **Check Console Logs**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Refresh the page
4. Look for the initialization logs

### 2. **Check Network Tab**
1. Open browser developer tools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for the `/api/v1/token` request

### 3. **Use Test Page**
Navigate to `/main/api-test` to see:
- Current auth state
- Loading status
- User information
- Permission status

## Expected Behavior

### **When User is Logged In:**
- ✅ Loading overlay appears
- ✅ API call to `/api/v1/token` is made
- ✅ User info is stored in auth store
- ✅ Permissions are updated
- ✅ Menu items are filtered based on roles
- ✅ Loading overlay disappears

### **When User is Not Logged In:**
- ✅ No API call is made
- ✅ No loading overlay
- ✅ App continues normally

### **When API Call Fails:**
- ✅ Error is logged to console
- ✅ Loading overlay disappears
- ✅ App continues with limited functionality
- ✅ User can retry manually

## Troubleshooting

### **API Call Not Happening**
1. Check if user is logged in
2. Check browser console for errors
3. Verify token is present in auth store
4. Check network tab for failed requests

### **Loading Overlay Not Showing**
1. Check if `Loading.vue` component is imported
2. Verify `authStore.isLoading` is working
3. Check for CSS conflicts

### **User Info Not Loading**
1. Check API endpoint (`/api/v1/token`)
2. Verify authentication token
3. Check server response
4. Look for console errors

## Manual Testing

### **Test API Call Manually**
```javascript
// In browser console
const authStore = useAuthStore();
await authStore.fetchUserInfo();
```

### **Check Current State**
```javascript
// In browser console
const authStore = useAuthStore();
console.log('User:', authStore.user);
console.log('UserInfo:', authStore.userInfo);
console.log('Loading:', authStore.isLoading);
```

## Configuration

### **API Endpoint**
The API endpoint is configured in `src/services/userInfoService.ts`:
```typescript
const response = await axiosInstance.get('/api/v1/token');
```

### **Loading Duration**
The loading overlay shows for the duration of the API call. Typical duration:
- **Fast**: 100-500ms
- **Normal**: 500ms-2s
- **Slow**: 2s+

## Security Notes

- **Token Required**: API call requires valid authentication token
- **Error Handling**: Failed calls don't crash the app
- **Retry Logic**: Users can manually retry failed calls
- **Session Management**: Token expiration is handled gracefully

## Performance Considerations

- **Single Call**: API is called only once on app start
- **Caching**: User info is cached in auth store
- **Lazy Loading**: Permissions are computed on-demand
- **Minimal Impact**: Loading overlay is lightweight 