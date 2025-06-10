<template>
    <div class="facilities-section">
      <div class="section-header">
        <h4 class="section-title">تضامین جواز سبز</h4>
        <v-btn color="secondary" @click="openDialog" :disabled="loading"> افزودن تضامین جواز سبز</v-btn>    </div>
  
      <v-data-table-virtual
        :headers="headers"
        :items="greenLicense"
        :loading="loading"
        no-data-text="رکوردی یافت نشد"
        density="comfortable"
        hover
        hide-default-footer
        class="facilities-table elevation-1"
      >
      <template #item.approvalType="{ item }">
      {{ ApprovalTypeOptions.find(opt => opt.value === item.approvalType)?.title || '-' }}
    </template>
    <template #item.currency="{ item }">
      {{ baseStore.currency.find(cur => cur.code === item.currency)?.description || '-' }}
    </template>
    <template #item.amount="{ item }">
      {{ formatNumberWithCommas(item.amount) }}
    </template>
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn size="small" variant="text" @click="editItem(item)">
              <IconPencil color="blue" size="20" />
            </v-btn>
            <v-btn size="small" variant="text" @click="deleteItem(item)">
              <IconTrash color="red" size="20" />
            </v-btn>
          </div>
        </template>
      </v-data-table-virtual>
  
      <v-dialog v-model="dialog" max-width="800px">
        <v-card>
          <v-card-title class="d-flex align-center py-5 px-5">
            <span class="text-h3">{{ isEditing ? 'ویرایش تضامین جواز سبز' : 'افزودن تضامین جواز سبز' }}</span>
            <v-spacer></v-spacer>
            <v-btn size="small" variant="text" @click="closeDialog">
              <IconX color="red" size="20" />
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="isFormValid">
              <v-row>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="formData.approvalType"
                    :items="ApprovalTypeOptions || []"
                    label="نوع مصوبه"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-autocomplete
                    v-model="formData.currency"
                    label="نوع ارز"
                    variant="outlined"
                    clearable
                    density="comfortable"
                    item-title="description"
                    item-value="code"
                    :items="baseStore.currency"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <MoneyInput
                    v-model="formData.amount"
                    label="مبلغ"
                    placeholder="0"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    suffix="میلیون ریال"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-btn 
                    color="primary" 
                    variant="tonal" 
                    @click="showCollateralInputDialog = true" 
                    class="mb-4"
                  > 
                    افزودن وثیقه 
                  </v-btn>
                </v-col>
              </v-row>
              <v-data-table-virtual
                v-if="collateralTableItems.length > 0"
                :headers="[
                  { title: 'نوع وثیقه', key: 'collateral.description', sortable: true },
                  { title: 'مبلغ وثیقه', key: 'amount', sortable: true, align: 'end' },
                  { title: 'درصد ارزش گذاری', key: 'percent', sortable: true, align: 'end' },
                  { title: 'ارزش معادل وثیقه', key: 'equivalentValue', sortable: true, align: 'end' },
                  { title: 'عملیات', key: 'actions', sortable: false, align: 'center' }
                ]"
                :items="collateralTableItems"
                density="compact"
                class="elevation-1 mb-4"
                hide-default-footer
                no-data-text="هیچ وثیقه ای اضافه نشده است."
              >
                <template v-slot:item.amount="{ item }">
                  {{ formatNumberWithCommas(item.amount) }}
                </template>
                <template v-slot:item.percent="{ item }"> 
                  {{ item.percent }}% 
                </template>
                <template v-slot:item.equivalentValue="{ item }">
                  {{ item.equivalentValue.toLocaleString() }}
                </template>
                <template v-slot:item.actions="{ index }">
                  <v-tooltip location="top" text="حذف وثیقه">
                    <template v-slot:activator="{ props: tooltipProps }">
                      <v-btn 
                        variant="text"
                        size="small" 
                        color="error" 
                        v-bind="tooltipProps" 
                        @click="removeCollateralItem(index)"
                      >
                        ❌
                      </v-btn>
                    </template>
                  </v-tooltip>
                </template>
              </v-data-table-virtual>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <div style="display: flex; justify-content: space-evenly; width: 100%;">
              <v-btn color="primary" @click="saveGreenLicense" :loading="loading" :disabled="!isFormValid">
              {{ 'ذخیره' }}
            </v-btn>
            <v-btn color="error" variant="text" @click="closeDialog"> انصراف</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- CollateralInputDialog component -->
      <CollateralInputDialog 
        v-model="showCollateralInputDialog" 
        :collateral-options="baseStore.collateral"
        @save="onCollateralDialogSave" 
      />
  
      <!-- Confirmation Dialog -->
      <v-dialog v-model="showDeleteConfirm" max-width="400">
        <v-card>
          <v-card-title class="text-h5">
            حذف وثیقه
          </v-card-title>
          <v-card-text>
            آیا از حذف این وثیقه اطمینان دارید؟
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              variant="text"
              @click="confirmDeleteCollateral"
            >
              حذف
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="cancelDeleteCollateral"
            >
              انصراف
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Error Snackbar -->
      <v-snackbar v-model="showError" color="error" timeout="3000">
        {{ error }}
      </v-snackbar>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted, computed, watch } from 'vue';
  import { IconTrash, IconX, IconPencil } from '@tabler/icons-vue';
  import { ApprovalTypeOptions } from '@/constants/enums/approval';
  import { useBaseStore } from '@/stores/base';
  import { api } from '@/services/api';
  import MoneyInput from '@/components/shared/MoneyInput.vue';
  import { useApprovalStore } from '@/stores/approval';
  import type { CollateralDto, GreenLicense } from '@/types/approval/approvalType';
  import CollateralInputDialog from '@/components/approval/CollateralInputDialog.vue';
  import { formatNumberWithCommas } from '@/utils/number-formatter';
  
  const baseStore = useBaseStore();
  const approvalStore = useApprovalStore();
  const dialog = ref(false);
  const form = ref();
  const isFormValid = ref(false);
  const greenLicense = ref<GreenLicense[]>([]);
  const isEditing = ref(false);
  const editingId = ref<number | null>(null);
  const showCollateralInputDialog = ref(false);
  const showDeleteConfirm = ref(false);
  const collateralToDelete = ref<number | null>(null);
  const error = ref('');
  const showError = ref(false);
  const selectedCollaterals = ref<Array<{
    collateral: CollateralDto;
    amount: number;
    percent: number;
  }>>([]);
  const collateralTableItems = computed(() =>
    selectedCollaterals.value.map(item => ({
      ...item,
      equivalentValue: (item.amount * item.percent) / 100
    }))
  );
  
  const props = defineProps<{
    loading?: boolean;
  }>();
  const emit = defineEmits<{
    (e: 'save', data: GreenLicense): void;
    (e: 'delete', item: GreenLicense): void;
    (e: 'edit', item: GreenLicense): void;
    (e: 'update:greenLicense', data: GreenLicense[]): void;
  }>();
  
  const formData = reactive({
    approvalType: '',
    currency: '',
    amount: '',
    collateral: true,
  });
  
  const headers = [
    { title: 'نوع مصوبه', key: 'approvalType', width: '100px' },
    { title: 'نوع ارز', key: 'currency', width: '100px' },
    { title: 'مبلغ', key: 'amount', width: '150px' },
    { title: 'عملیات', key: 'actions', align: 'center', width: '100px' }
  ];
  
  const onCollateralDialogSave = (data: { collateral: CollateralDto | null; amount: string; percent: string }) => {
    if (!data.collateral) {
      error.value = 'نوع وثیقه الزامی است';
      showError.value = true;
      return;
    }
    try {
      const amountValue = parseFloat(data.amount.replace(/,/g, ''));
      const percentValue = parseFloat(data.percent);
      if (isNaN(amountValue) || amountValue <= 0) throw new Error('مبلغ وثیقه باید عدد مثبت باشد');
      if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) throw new Error('درصد ارزش گذاری باید بین 0 تا 100 باشد');
      const newCollateralEntry = { collateral: data.collateral, amount: amountValue, percent: percentValue };
      selectedCollaterals.value = [...selectedCollaterals.value, newCollateralEntry];
      showCollateralInputDialog.value = false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'خطا در افزودن وثیقه';
      showError.value = true;
    }
  };
  
  const removeCollateralItem = (index: number) => {
    collateralToDelete.value = index;
    showDeleteConfirm.value = true;
  };
  
  const confirmDeleteCollateral = () => {
    if (collateralToDelete.value === null) return;
    try {
      const deletedCollateral = selectedCollaterals.value[collateralToDelete.value];
      selectedCollaterals.value = selectedCollaterals.value.filter((_, i) => i !== collateralToDelete.value);
      error.value = `وثیقه ${deletedCollateral.collateral.description} با موفقیت حذف شد`;
      showError.value = true;
    } catch (err) {
      error.value = 'خطا در حذف وثیقه';
      showError.value = true;
    } finally {
      collateralToDelete.value = null;
      showDeleteConfirm.value = false;
    }
  };
  
  const cancelDeleteCollateral = () => {
    collateralToDelete.value = null;
    showDeleteConfirm.value = false;
  };

  function openDialog() {
    isEditing.value = false;
    editingId.value = null;
    dialog.value = true;
  }
  
  function closeDialog() {
    dialog.value = false;
    resetForm();
  }
  
  function resetForm() {
    formData.amount = '';
    selectedCollaterals.value = [];
    form.value?.reset();
  }
  
  function editItem(item: GreenLicense) {
    isEditing.value = true;
    editingId.value = item.id;
    formData.approvalType = item.approvalType;
    formData.currency = item.currency;
    formData.amount = item.amount;
    selectedCollaterals.value = item.collaterals ? item.collaterals : [];
    dialog.value = true;
  }
  
  function saveGreenLicense() {
    if (!isFormValid.value) return;
    const facilityData: GreenLicense = {
      id: editingId.value || Date.now(),
      ...formData,
      collaterals: selectedCollaterals.value
    };
    if (isEditing.value) {
      const index = greenLicense.value.findIndex(item => item.id === editingId.value);
      if (index !== -1) {
        greenLicense.value[index] = facilityData;
      }
      emit('edit', facilityData);
    } else {
      greenLicense.value = [...greenLicense.value, facilityData];
      emit('save', facilityData);
    }
    emit('update:greenLicense', greenLicense.value);
    closeDialog();
  }
  
  function deleteItem(item: GreenLicense) {
    greenLicense.value = greenLicense.value.filter(i => i.id !== item.id);
    emit('delete', item);
    emit('update:greenLicense', greenLicense.value);
  }

  onMounted(() => {
    if (approvalStore.loanRequestDetailList?.greenLicense) {
      greenLicense.value = [approvalStore.loanRequestDetailList.greenLicense];
      emit('update:greenLicense', greenLicense.value);
    }
  });
  
  watch(greenLicense, (newVal) => {
    emit('update:greenLicense', newVal);
  }, { deep: true });
  
  defineExpose({ greenLicense });
  </script>
  
  <style lang="scss">
  @import '@/assets/scss/components/approval-sections';

  .facilities-section {
    @extend .approval-section;
    
    .facilities-table {
      @extend .approval-table;
    }
  }
  </style>
  