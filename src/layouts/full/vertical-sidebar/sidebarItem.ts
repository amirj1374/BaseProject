import { 
  IconBookmarkEdit, 
  IconClipboardData, 
  IconDatabase, 
  IconFileSymlink, 
  IconHome, 
  IconPencilPlus 
} from '@tabler/icons-vue';

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
}

const sidebarItem: menu[] = [
  // {
  //   title: 'صفحه اصلی',
  //   icon: IconHome,
  //   to: '/dashboard/default'
  // },
  {
    title: 'اطلاعات پایه',
    icon: IconDatabase
    // children: [
    //   {
    //     title: 'سهام ها',
    //     icon: DashboardIcon,
    //     to: '/base/stock'
    //   },
    //   {
    //     title: 'بانک ها',
    //     icon: DashboardIcon,
    //     to: '/base/bank',
    //   },
    //   {
    //     title: 'سهام دار',
    //     icon: DashboardIcon,
    //     to: '/base/person'
    //   },
    //   {
    //     title: 'بارگزاری فایل',
    //     icon: DashboardIcon,
    //     to: '/base/person/upload'
    //   }
    // ]
  },
  {
    title: 'درخواست مصوبه جدید',
    icon: IconPencilPlus,
    to: '/approval'
  },
  {
    title: 'ویرایش درخواست مصوبه',
    icon: IconBookmarkEdit,
    to: '/approval/edit'
  },
  {
    title: 'ارجاع درخواست های جاری',
    icon: IconFileSymlink,
    to: '/cartable/reference'
  },
  {
    title: 'گزارشات',
    icon: IconClipboardData,
    to: '/report'
  }
];

export default sidebarItem;
