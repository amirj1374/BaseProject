<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <div class="upload-form">
    <CustomDataTable
      ref="dataTableRef"
      :headers="headers"
      api-resource="public-category"
      :show-pagination="true"
      :auto-fetch="true"
      :height="550"
      :actions="['create', 'edit', 'delete']"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import CustomDataTable from '@/components/shared/CustomDataTable.vue';
import { useBaseStore } from '@/stores/base';
import { computed, ref } from 'vue';

const baseStore = useBaseStore();

const breadcrumbs = ref([
  {
    title: 'اطلاعات پایه',
    disabled: false,
    href: '#'
  },
  {
    title: 'مدیریت گروه بندی اطلاعات پایه',
    disabled: false,
    href: '#'
  }
]);
const page = ref({ title: 'مدیریت گروه بندی اطلاعات پایه' });
// Reactive data
const dataTableRef = ref();
const childOptions = computed(() => {
  const rows = dataTableRef.value?.items?.value ?? [];
  if (!Array.isArray(rows)) {
    return [];
  }

  const unique = new Map<string | number, any>();
  rows.forEach((row: Record<string, any>) => {
    const children = Array.isArray(row?.children) ? row.children : [];
    children.forEach((child: Record<string, any>) => {
      const key = child?.id ?? child?.code;
      if (key !== undefined && !unique.has(key)) {
        unique.set(key, child);
      }
    });
  });

  return Array.from(unique.values());
});

const childrenOptionsByGroup = computed<Record<number, any[]>>(() => {
  const source = Array.isArray(baseStore.collateral) ? baseStore.collateral : [];

  return source.reduce<Record<number, any[]>>((acc, item: any) => {
    const id = Number(item?.groupId);
    if (Number.isFinite(id)) {
      if (!acc[id]) {
        acc[id] = [];
      }
      acc[id].push(item);
    }
    return acc;
  }, {});
});

const fallbackChildrenOptions = computed(() => {
  const allCollateral = Array.isArray(baseStore.collateral) ? baseStore.collateral : [];
  if (allCollateral.length > 0) {
    return allCollateral;
  }
  return childOptions.value;
});

const resolveChildrenOptionsForGroup = (groupId: unknown) => {
  const numericGroupId = Number(groupId);

  if (!Number.isNaN(numericGroupId)) {
    const groupOptions = childrenOptionsByGroup.value[numericGroupId];
    if (Array.isArray(groupOptions) && groupOptions.length > 0) {
      return groupOptions;
    }
  }

  return fallbackChildrenOptions.value;
};
// Headers configuration with custom JSON support
const headers = [
  {
    title: 'نوع گروه',
    key: 'groupId',
    sortable: true,
    width: 200,
  },
  {
    title: 'عنوان گروه',
    key: 'name',
    sortable: true,
    width: 200,
  },
  {
    title: 'زیر مجموعه ها',
    key: 'children',
    sortable: true,
    width: 200,
    nestedKey: 'children.description',
    // Custom formatter example
    formatter: (_value: any, item: any) => {
      if (!Array.isArray(item?.children) || item.children.length === 0) {
        return ' - ';
      }
      return item.children
        .map((child: { name?: string; description?: string }) => child?.description ?? '')
        .filter(Boolean)
        .join(' - ');
    },
    autocompleteItems: (context?: Record<string, any>) => resolveChildrenOptionsForGroup(context?.groupId),
    autocompleteItemTitle: 'description',
    autocompleteItemValue: 'collateralTypeCode',
    autocompleteMultiple: true,
    autocompleteReturnObject: true,
    defaultValue: (context: Record<string, any>) => {
      const existing = Array.isArray(context?.children) ? context.children : [];
      if (existing.length > 0) {
        return existing;
      }
      return [];
    }
  }
];

</script>
