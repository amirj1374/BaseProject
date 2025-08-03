import { defineStore } from 'pinia';
import { useCustomerInfoStore } from './customerInfo';

export interface MenuPermission {
  menuKey: string;
  requiredRoles: string[];
  requiredLotusRoles?: string[];
}

export const usePermissionsStore = defineStore({
  id: 'permissions',
  state: () => ({
    menuPermissions: [
      {
        menuKey: 'approval_new',
        requiredRoles: ['SMP_CREATE_APPROVAL']
      },
      {
        menuKey: 'approval_edit',
        requiredRoles: ['SMP_EDIT_APPROVAL']
      },
      {
        menuKey: 'cartable',
        requiredRoles: ['SMP_VIEW_CARTABLE']
      },
      {
        menuKey: 'cartable_operation',
        requiredRoles: ['SMP_CARTABLE_OPERATION']
      },
      {
        menuKey: 'cartable_history',
        requiredRoles: ['SMP_CARTABLE_HIST']
      },
      {
        menuKey: 'approval_history',
        requiredRoles: ['SMP_APPROVAL_HIST']
      },
      {
        menuKey: 'flow_management',
        requiredRoles: ['SMP_CREATE_FLOW_MNG']
      },
      {
        menuKey: 'basic_info',
        requiredRoles: ['SMP_BASIC_INFO']
      },
      {
        menuKey: 'report',
        requiredRoles: ['SMP_REPORT']
      },
      {
        menuKey: 'admin',
        requiredRoles: ['SMP_CREATE_FLOW_MNG']
      }
    ] as MenuPermission[]
  }),

  getters: {
    // Check if user has permission for a specific menu
    hasMenuPermission: (state) => (menuKey: string) => {
      const customerInfo = useCustomerInfoStore();
      const permission = state.menuPermissions.find(p => p.menuKey === menuKey);
      
      if (!permission) return true; // If no permission defined, allow access
      
      const userRoles = customerInfo.getUserRoles;
      const userLotusRoles = customerInfo.getLotusRoles;
      
      // Check required roles
      const hasRequiredRole = permission.requiredRoles.some(role => 
        userRoles.includes(role)
      );
      
      // Check required lotus roles if defined
      const hasRequiredLotusRole = permission.requiredLotusRoles 
        ? permission.requiredLotusRoles.some(role => 
            userLotusRoles.includes(role)
          )
        : true;
      
      return hasRequiredRole && hasRequiredLotusRole;
    },

    // Get all available menu permissions for current user
    getAvailableMenus: (state) => {
      const customerInfo = useCustomerInfoStore();
      if (!customerInfo.isUserInfoLoaded) return [];
      
      return state.menuPermissions.filter(permission => {
        const userRoles = customerInfo.getUserRoles;
        const userLotusRoles = customerInfo.getLotusRoles;
        
        const hasRequiredRole = permission.requiredRoles.some(role => 
          userRoles.includes(role)
        );
        
        const hasRequiredLotusRole = permission.requiredLotusRoles 
          ? permission.requiredLotusRoles.some(role => 
              userLotusRoles.includes(role)
            )
          : true;
        
        return hasRequiredRole && hasRequiredLotusRole;
      });
    },

    // Check if user has any of the specified roles
    hasAnyRole: () => (roles: string[]) => {
      const customerInfo = useCustomerInfoStore();
      return roles.some(role => customerInfo.hasRole(role));
    },

    // Check if user has any of the specified lotus roles
    hasAnyLotusRole: () => (roles: string[]) => {
      const customerInfo = useCustomerInfoStore();
      return roles.some(role => customerInfo.hasLotusRole(role));
    }
  },

  actions: {
    // Add new menu permission
    addMenuPermission(permission: MenuPermission) {
      this.menuPermissions.push(permission);
    },

    // Remove menu permission
    removeMenuPermission(menuKey: string) {
      const index = this.menuPermissions.findIndex(p => p.menuKey === menuKey);
      if (index !== -1) {
        this.menuPermissions.splice(index, 1);
      }
    },

    // Update menu permission
    updateMenuPermission(menuKey: string, permission: Partial<MenuPermission>) {
      const index = this.menuPermissions.findIndex(p => p.menuKey === menuKey);
      if (index !== -1) {
        this.menuPermissions[index] = { ...this.menuPermissions[index], ...permission };
      }
    }
  }
}); 