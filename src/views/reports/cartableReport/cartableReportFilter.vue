<template>
  <div class="filter-cartable">
    <v-row>
      <!-- Date Range Filter -->
      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="filterModel.regionBranchCode"
          :items="baseStore.regions"
          label="منطقه"
          item-value="code"
          item-title="name"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          clearable
          @update:model-value="
            (val: RegionsDto | null) => {
              filterModel.branchCode = '';
              fetchBranchs(val);
            }
          "
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="filterModel.branchCode"
          :items="branchList"
          label="شعبه"
          item-value="code"
          item-title="name"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          clearable
        />
      </v-col>
    </v-row>

    <!-- Filter Actions -->
    <v-row class="mt-4">
      <v-col cols="12" class="d-flex justify-center gap-2">
        <v-btn color="error" variant="outlined" @click="clearFilters"> پاک کردن فیلترها </v-btn>
        <v-btn color="primary" @click="applyFilters"> اعمال فیلتر </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';
import { useBaseStore } from '@/stores/base';
import type { BranchDto, ContractType, RegionsDto } from '@/types/approval/approvalType';
import { api } from '@/services/api';
const branchList = ref<BranchDto[]>([]);
const baseStore = useBaseStore();

async function fetchBranchs(newRegion: String | null) {
  console.log(newRegion);
  if (!newRegion) return;
  try {
    const res = await api.approval.getBranch(newRegion);
    branchList.value = res.data || [];
  } catch (err) {
    console.error('Error fetching branchs:', err);
  }
}

interface FilterModel {
  branchCode: string;
  regionBranchCode: string;
}

const props = defineProps<{
  modelValue?: Partial<FilterModel>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FilterModel];
  apply: [value: FilterModel];
}>();

// Filter model
const filterModel = reactive<FilterModel>({
  regionBranchCode: '',
  branchCode: '',
});

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.assign(filterModel, newValue);
    }
  },
  { immediate: true, deep: true }
);

// Clear all filters
const clearFilters = () => {
  Object.keys(filterModel).forEach((key) => {
    filterModel[key as keyof FilterModel] = '';
  });
  emit('update:modelValue', { ...filterModel });
  emit('apply', { ...filterModel });
};

// Apply filters
const applyFilters = () => {
  emit('update:modelValue', { ...filterModel });
  emit('apply', { ...filterModel });
};
</script>

<style scoped>
.filter-cartable {
  padding: 16px;
}

.gap-2 {
  gap: 8px;
}
</style>
