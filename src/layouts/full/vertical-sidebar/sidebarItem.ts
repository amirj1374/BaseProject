import { BookmarkEditIcon, ClipboardDataIcon, DatabaseIcon, FileSymlinkIcon, HomeIcon, PencilPlusIcon } from 'vue-tabler-icons';

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
  //   icon: HomeIcon,
  //   to: '/dashboard/default'
  // },
  {
    title: 'اطلاعات پایه',
    icon: DatabaseIcon
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
    icon: PencilPlusIcon,
    to: '/approval'
  },
  {
    title: 'ویرایش درخواست مصوبه',
    icon: BookmarkEditIcon,
    to: '/approval/edit'
  },
  {
    title: 'ارجاع درخواست های جاری',
    icon: FileSymlinkIcon,
    to: '/cartable/reference'
  },
  {
    title: 'گزارشات',
    icon: ClipboardDataIcon,
    to: '/report'
  }
];

export default sidebarItem;
