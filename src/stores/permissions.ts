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
        menuKey: 'flowManagement',
        requiredRoles: ['SMP_CREATE_FLOW_MNG']
      },
      {
        menuKey: 'preApprovalReport',
        requiredRoles: ['SMP_PRE_APPROVAL_RPT']
      },
      {
        menuKey: 'cartableReport',
        requiredRoles: ['SMP_CARTABLE_RPT']
      },
      {
        menuKey: 'addFile',
        requiredRoles: ['SMP_ADD_FILE']
      },
      {
        menuKey: 'download1016',
        requiredRoles: ['SMP_DOWNLOAD_1016']
      },
      {
        menuKey: 'reviewExpertReport',
        requiredRoles: ['SMP_REVIEW_EXPERT_RPT']
      },
      {
        menuKey: 'downloadExpertReport',
        requiredRoles: ['SMP_DOWNLOAD_EXPERT_RPT_FILE']
      },
      {
        menuKey: 'downloadDirectiveReport',
        requiredRoles: ['SMP_DOWNLOAD_DIRECTIVE_RPT_FILE']
      },
      {
        menuKey: 'regionPreApprovalReport',
        requiredRoles: ['SMP_REGION_PRE_APPROVAL_RPT']
      },
      {
        menuKey: 'directiveReport',
        requiredRoles: ['SMP_DIRECTIVE_RPT']
      },
      {
        menuKey: 'uploadExpertReport',
        requiredRoles: ['SMP_UPLOAD_EXPERT_RPT_FILE']
      },
      {
        menuKey: 'changeSigner',
        requiredRoles: ['SMP_CHANGE_SIGNER']
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