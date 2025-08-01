import { 
  IconBookmarkEdit, 
  IconClipboardData, 
  IconDatabase, 
  IconFileSymlink, 
  IconHome, 
  IconPencilPlus ,
  IconTableShare
} from '@tabler/icons-vue';
import { usePermissionsStore } from '@/stores/permissions';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
  permissionKey?: string; // Add permission key for role-based access
}

const sidebarItem: menu[] = [
  {
    title: 'اطلاعات پایه',
    icon: IconDatabase,
    permissionKey: 'basic_info' // No specific permission required
  },
  {
    title: 'درخواست مصوبه جدید',
    icon: IconPencilPlus,
    to: '/approval',
    permissionKey: 'approval_new'
  },
  {
    title: 'کارتابل',
    icon: IconTableShare,
    to: '/cartable',
    permissionKey: 'cartable'
  },
  {
    title: 'ویرایش درخواست مصوبه',
    icon: IconBookmarkEdit,
    to: '/approval/edit',
    permissionKey: 'approval_edit'
  },
  {
    title: 'ارجاع درخواست های جاری',
    icon: IconFileSymlink,
    to: '/cartable/reference',
    permissionKey: 'cartable_operation'
  },
  {
    title: 'گزارشات',
    icon: IconClipboardData,
    to: '/report',
    permissionKey: 'reports' // No specific permission required
  }
];

// Function to get filtered menu items based on user permissions
export function getFilteredSidebarItems(): menu[] {
  const permissionsStore = usePermissionsStore();
  
  return sidebarItem.filter(item => {
    // If no permission key is defined, show the item
    if (!item.permissionKey) return true;
    
    // Check if user has permission for this menu item
    return permissionsStore.hasMenuPermission(item.permissionKey);
  });
}

export default sidebarItem;
