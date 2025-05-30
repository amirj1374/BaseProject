import { 
  IconBookmarkEdit, 
  IconClipboardData, 
  IconDatabase, 
  IconFileSymlink, 
  IconHome, 
  IconPencilPlus ,
  IconTableShare
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
  {
    title: 'اطلاعات پایه',
    icon: IconDatabase
  },
  {
    title: 'درخواست مصوبه جدید',
    icon: IconPencilPlus,
    to: '/approval'
  },
  {
    title: 'کارتابل',
    icon: IconTableShare,
    to: '/cartable'
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
