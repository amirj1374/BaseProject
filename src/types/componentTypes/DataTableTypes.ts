/**
 * Enhanced type definitions for CustomDataTable component
 * Replaces all 'any' types with proper TypeScript types
 */

export interface TableItem {
  id?: string | number;
  [key: string]: unknown;
}

export interface Header {
  title: string;
  key: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  editable?: boolean;
  filterable?: boolean;
  width?: number;
  hidden?: boolean;
  defaultValue?: string | number | boolean;
  isDate?: boolean;
  style?: Record<string, string>;
  translate?: boolean;
  options?: Array<{ title: string; value: string | number | boolean }>;
  conditionalStyle?: (value: unknown, item: TableItem) => Record<string, string>;
  nestedKey?: string;
  customRenderer?: (item: TableItem) => string | number | boolean;
  formatter?: (value: unknown, item: TableItem) => string;
  type?: string;
}

export interface CustomAction {
  title: string;
  component: any; // Vue component - keeping as any for Vue component types
  condition?: (item: TableItem) => boolean;
}

export interface CustomButtonAction {
  label: string;
  color?: string;
  onClick: (item: TableItem) => void;
  disabled?: boolean;
}

export interface PaginationConfig {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface TableRoutes {
  [key: string]: string;
}

export interface TableQueryParams {
  [key: string]: unknown;
}

export interface DownloadLink {
  [key: string]: string;
}

export interface DataTableProps {
  apiResource: string;
  headers: Header[];
  actions?: ('create' | 'edit' | 'delete' | 'view')[];
  routes?: TableRoutes | ((item: TableItem) => TableRoutes);
  downloadLink?: DownloadLink;
  formComponent?: any; // Vue component
  customActions?: CustomAction[];
  customButtons?: CustomButtonAction[];
  customButtonsFn?: (item: TableItem) => CustomButtonAction[];
  filterComponent?: any; // Vue component
  autoFetch?: boolean;
  queryParams?: TableQueryParams;
  showPagination?: boolean;
  height: number;
  pagination?: PaginationConfig;
  showRefreshButton?: boolean;
  title?: string;
  selectable?: boolean;
  multiSelect?: boolean;
  selectedItems?: TableItem[];
  uniqueKey?: string | ((item: TableItem) => string | number);
  pageSize?: number;
  groupBy?: string | ((item: TableItem) => string | number);
  groupHeaderTemplate?: (groupKey: string | number, groupItems: TableItem[]) => string;
  defaultExpanded?: boolean;
  defaultSelected?: string;
  dateWithTimezone?: boolean;
  bulkMode?: boolean;
}

export interface ApiResponse<T = TableItem> {
  data: {
    content: T[];
    page: {
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    };
  };
}

export interface FilterModel {
  [key: string]: unknown;
}

export interface SortConfig {
  key: string;
  order: 'asc' | 'desc';
}

export interface GroupedItems {
  [key: string]: TableItem[];
}

export interface SelectionState {
  selectedItems: TableItem[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
}
