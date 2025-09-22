import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import { useAuthStore } from '@/stores/auth';
import { usePermissionsStore } from '@/stores/permissions';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/test-keycloak',
      component: () => import('@/views/test-keycloak.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/error/403',
      component: () => import('@/views/pages/maintenance/error/Error403Page.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/pages/maintenance/error/Error404Page.vue')
    },
    MainRoutes,
    AuthRoutes
  ]
});

interface User {
  // Define the properties and their types for the user data here
  // For example:
  id: number;
  name: string;
}

// Assuming you have a type/interface for your authentication store
interface AuthStore {
  user: User | null;
  returnUrl: string | null;
  login(username: string, password: string): Promise<void>;
  logout(): void;
}

// Route permission mapping
const routePermissions: Record<string, string> = {
  '/dashboard': '', // No permission required for dashboard
  '/approval': 'approval_new',
  '/approval/edit': 'approval_edit',
  '/cartable': 'cartable',
  '/cartable/reference': 'cartable_operation',
  '/base/role-managment': 'flowManagement',
  '/base/department-managment': 'flowManagement',
  '/preApprovalReport': 'preApprovalReport',
  '/directiveReport': 'directiveReport',
  '/report': 'cartableReport'
};

router.beforeEach(async (to, from, next) => {
  // Skip auth checks for test page
  if (to.path === '/test-keycloak') {
    return next();
  }

  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/'];
  const authRequired = !publicPages.includes(to.path);
  const auth: AuthStore = useAuthStore();
  const permissionsStore = usePermissionsStore();

  // Check authentication first
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (authRequired && !auth.user) {
      auth.returnUrl = to.fullPath;
      return next('/auth/login');
    }
  }

  // Check permissions for the route
  const requiredPermission = routePermissions[to.path];
  if (requiredPermission !== undefined) {
    // If permission is empty string, no permission required
    if (requiredPermission === '') {
      // No permission required, allow access
    } else {
      const hasPermission = permissionsStore.hasMenuPermission(requiredPermission);
      
      if (!hasPermission) {
        // Redirect to a 403 error page
        return next('/error/403');
      }
    }
  }

  next();
});
