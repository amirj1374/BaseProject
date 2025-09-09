import { 
  IconBookmarkEdit, 
  IconClipboardData, 
  IconDatabase, 
  IconFileSymlink, 
  IconHome, 
  IconPencilPlus,
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
    title: 'داشبورد',
    icon: IconHome,
    to: '/',
  },
  {
    title: 'محصولات',
    icon: IconHome,
    to: '/products',
  },
  {
    title: 'درخواست مصوبه جدید',
    icon: IconPencilPlus,
    to: '/approval',
    permissionKey: 'approval_new',
  },
  {
    title: 'ویرایش درخواست مصوبه',
    icon: IconBookmarkEdit,
    to: '/approval/edit',
    permissionKey: 'approval_edit'
  },
  {
    title: 'کارتابل',
    icon: IconTableShare,
    to: '/cartable',
    permissionKey: 'cartable'
  },
  {
    title: 'گزارش',
    icon: IconFileSymlink,
    to: '/report',
    permissionKey: 'cartableReport'
  },
  {
    title: 'اطلاعات پایه',
    icon: IconDatabase,
    permissionKey: 'flowManagement',
    children: [
      {
        title: 'مدیریت نقش ها',
        icon: IconBookmarkEdit,
        to: '/base/role-managment',
        permissionKey: 'flowManagement'
      },
      {
        title: 'مدیریت عملیات',
        icon: IconDatabase,
        to: '/base/department-managment',
        permissionKey: 'flowManagement'
      }
    ]
  }
];

// Function to get filtered menu items based on user permissions
export function getFilteredSidebarItems(): menu[] {
  const permissionsStore = usePermissionsStore();
  
  return sidebarItem.filter(item => {
    // If no permission key is defined, show the item
    if (!item.permissionKey) return true;
    
    // Check if user has permission for this menu item
    const hasPermission = permissionsStore.hasMenuPermission(item.permissionKey);
    
    // If item has children, filter them too
    if (item.children && item.children.length > 0) {
      item.children = item.children.filter(child => {
        if (!child.permissionKey) return true;
        return permissionsStore.hasMenuPermission(child.permissionKey);
      });
      
      // Show parent if it has any visible children or if parent itself is accessible
      return hasPermission || item.children.length > 0;
    }
    
    return hasPermission;
  });
}

export default sidebarItem;
