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
            (val: string | null) => {
              filterModel.branchCode = '';
              fetchBranches(val);
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
          :rules="[required]"
          ref="branchAutocomplete"
        />
      </v-col>
    </v-row>

    <!-- Filter Actions -->
    <v-row class="mt-4">
      <v-col cols="12" class="d-flex justify-center gap-2">
        <v-btn color="error" variant="outlined" @click="clearFilters"> پاک کردن فیلترها </v-btn>
        <v-btn 
          color="primary" 
          @click="applyFilters"
          :disabled="!filterModel.branchCode"
        > 
          اعمال فیلتر 
        </v-btn>
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
const branchAutocomplete = ref();

const required = (v: any) => !!v || 'انتخاب شعبه الزامی است';

async function fetchBranches(newRegion: string | null) {
  console.log('fetchBranches called with:', newRegion);
  if (!newRegion) {
    console.log('No region selected, clearing branch list');
    branchList.value = [];
    return;
  }
  try {
    console.log('Calling api.approval.getBranch with:', newRegion);
    const res = await api.approval.getBranch(newRegion);
    console.log('Branch response:', res.data);
    branchList.value = res.data || [];
  } catch (err) {
    console.error('Error fetching branches:', err);
    branchList.value = [];
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

// Watch for region changes and fetch branches when region is set but no branches loaded
watch(
  () => filterModel.regionBranchCode,
  (newRegion, oldRegion) => {
    // If region is selected but branchList is empty, fetch branches
    if (newRegion && branchList.value.length === 0) {
      console.log('Region already selected but no branches loaded, fetching branches...');
      fetchBranches(newRegion);
    }
    // If region is cleared, clear branch list
    else if (!newRegion && oldRegion) {
      branchList.value = [];
    }
  },
  { immediate: true }
);

// Clear all filters
const clearFilters = () => {
  Object.keys(filterModel).forEach((key) => {
    filterModel[key as keyof FilterModel] = '';
  });
  branchList.value = []; // Clear branch list when clearing filters
  emit('update:modelValue', { ...filterModel });
  emit('apply', { ...filterModel });
};

// Apply filters
const applyFilters = async () => {
  // Validate branch selection
  const isValid = await branchAutocomplete.value?.validate();
  
  if (!isValid || !filterModel.branchCode) {
    console.log('Branch validation failed - cannot apply filters');
    return;
  }
  
  console.log('Applying filters with:', filterModel);
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
