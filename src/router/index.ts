import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import { useAuthStore } from '@/stores/auth';
import { usePermissionsStore } from '@/stores/permissions';
import { waitForInitialization } from '@/utils/appInitializer';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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

// Route permissions are defined per-route in route meta (meta.permission)

router.beforeEach(async (to, from, next) => {
  // Wait for app initialization to complete before checking permissions
  try {
    await waitForInitialization();
  } catch (error) {
    // If initialization fails, you might want to redirect to an error page
    return next('/error/403');
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

  // Check permissions from route meta
  const requiredPermission = to.matched
    .map((record) => record.meta?.permission as string | undefined)
    .find((perm) => perm !== undefined);

  if (requiredPermission) {
    const hasPermission = permissionsStore.hasMenuPermission(requiredPermission);
    if (!hasPermission) {
      return next('/error/403');
    }
  }

  next();
});
