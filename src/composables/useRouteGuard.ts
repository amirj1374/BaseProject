import { usePermissionsStore } from '@/stores/permissions';
import { useRouter } from 'vue-router';

export function useRouteGuard() {
  const permissionsStore = usePermissionsStore();
  const router = useRouter();

  // Check if user can access a specific route
  const canAccessRoute = (routePath: string): boolean => {
    const routePermissions: Record<string, string> = {
      '/dashboard': '', // No permission required for dashboard
      '/approval': 'approval_new',
      '/approval/edit': 'approval_edit',
      '/cartable': 'cartable',
      '/cartable/reference': 'cartable_operation',
      '/base/role-managment': 'admin',
      '/base/department-managment': 'admin',
      '/preApprovalReport': 'preApprovalReport',
      '/directiveReport': 'directiveReport',
      '/report': 'cartableReport'
    };

    const requiredPermission = routePermissions[routePath];
    if (requiredPermission === undefined) return true; // No permission defined
    if (requiredPermission === '') return true; // No permission required

    return permissionsStore.hasMenuPermission(requiredPermission);
  };

  // Navigate to route if user has permission, otherwise redirect to 403
  const navigateWithPermission = (routePath: string) => {
    if (canAccessRoute(routePath)) {
      router.push(routePath);
    } else {
      router.push('/error/403');
    }
  };

  // Check permission and redirect if not authorized
  const requirePermission = (permissionKey: string, redirectTo: string = '/error/403') => {
    if (!permissionsStore.hasMenuPermission(permissionKey)) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  return {
    canAccessRoute,
    navigateWithPermission,
    requirePermission
  };
} 