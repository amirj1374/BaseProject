<template>
  <div class="sign-list">
    <v-card>
      <v-card-title>جزئیات امضا</v-card-title>
      <v-card-text>
        <v-alert v-if="rows.length === 0" type="warning" density="comfortable" class="mb-4">
          داده‌ای برای نمایش وجود ندارد
        </v-alert>

        <v-data-table
          v-else
          :headers="headers"
          :items="rows"
          density="comfortable"
          :items-per-page="5"
          :hide-default-footer="true"
        >
          <template #item.isAgreed="{ value }">
            <v-chip :color="value === true ? 'success' : value === false ? 'error' : 'grey'" size="small" variant="tonal">
              {{ value === true ? 'بله' : value === false ? 'خیر' : 'نامشخص' }}
            </v-chip>
          </template>
          <template #item.actionDone="{ value }">
            <v-chip :color="value === true ? 'success' : value === false ? 'warning' : 'grey'" size="small" variant="tonal">
              {{ value === true ? 'انجام شد' : value === false ? 'انجام نشده' : 'نامشخص' }}
            </v-chip>
          </template>
          <template #item.actionDoneAt="{ value }">
            <span>{{ DateConverter.toShamsi(value) || '-' }}</span>
          </template>
          <template #no-data>
            <div class="py-6 text-center">رکوردی یافت نشد</div>
          </template>

        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { DateConverter } from '@/utils/date-convertor';
import { computed } from 'vue';

interface SignRow {
  actionDone?: boolean | null;
  actionDoneAt?: string | null;
  comment?: string | null;
  isAgreed?: boolean | null;
  name?: string;
  username?: string;
}

const props = defineProps<{
  item?: SignRow | SignRow[] | null;
  items?: SignRow[];
  onSuccess?: () => void;
}>();

const headers = [
  { title: 'نام کاربری', key: 'username', sortable: false },
  { title: 'نام', key: 'name', sortable: false },
  { title: 'توضیحات', key: 'comment', sortable: false },
  { title: 'موافقت', key: 'isAgreed', sortable: false },
  { title: 'وضعیت اقدام', key: 'actionDone', sortable: false },
  { title: 'تاریخ اقدام', key: 'actionDoneAt', sortable: false },
];

const rows = computed<SignRow[]>(() => {
  if (Array.isArray(props.items)) return props.items;

  const item = props.item as any;
  if (item?.commiteInquiries && Array.isArray(item.commiteInquiries)) {
    return item.commiteInquiries;
  }

  if (Array.isArray(item)) return item;
  if (item) return [item];
  return [];
});
</script>

<style scoped>
.sign-list {
  padding: 8px;
}
</style>