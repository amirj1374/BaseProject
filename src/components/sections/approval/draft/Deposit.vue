<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';
import type { DepositAccount } from '@/types/approval/approvalType';

const isDialogActive = ref(false);
const valid = ref<boolean | null>(false);
const error = ref<string | null>(null);
const approvalStore = useApprovalStore();
const items = ref<DepositAccount[]>([]);
const selected = ref<DepositAccount | null>(null);
const loading = ref(false);

const fetchAccounts = async () => {
  loading.value = true;
  try {
    const res = await api.approval.getAllDeposit("5253");
    console.log(res.data);
    if (res.status === 200) {
      items.value = res.data;
    }
  } catch (err) {
    console.error('API error:', err);
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  loading.value = true;
  try {
    const res = await api.approval.saveDeposit(approvalStore.getLoanRequestId, selected.value );
    if (res.status === 200) {
      items.value = res.data;
      isDialogActive.value = false;
      valid.value = true;
    }
  } catch (err) {
    console.error('API error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAccounts();
});
</script>

<template>
  <v-btn size="large" :base-color="valid ? 'lightsuccess' : 'lighterror'" @click="isDialogActive = true">
    انتخاب سپرده
    <AlertCircleIcon v-if="!valid" style="margin-right: 20px" size="20" />
    <SquareRoundedCheckFilledIcon v-if="valid" style="margin-right: 20px" size="20" />
  </v-btn>
  <v-dialog min-width="full" min-height="full"  v-model="isDialogActive">
    <v-card title="انتخاب سپرده">
      <v-row style="margin: unset; display: flex; align-items: center; justify-content: center">
        <v-col cols="12" md="8">
          <v-autocomplete
            v-model="selected"
            :items="items"
            item-title="accountNo"
            item-value="accountNo"
            return-object
            :loading="loading"
            label="انتخاب حساب"
            variant="outlined"
            dense
            clearable
            multiple
            :max="2"
          >
            <!-- Custom item rendering in dropdown -->
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="item.raw.accountTitle"
                :subtitle="`${item.raw.accountNo}`"
              >
                <template v-slot:append>
                  <span>مانده موجودی : {{ item.raw.finalBalance }}</span>
                  <span>---</span>
                  <span>نوع ارز : {{ item.raw.currency }}</span>
                </template>
              </v-list-item>
            </template>

            <!-- Custom selected value rendering -->
            <template #selection="{ item }">
              <span>
                {{ item.raw.accountTitle }} - {{ item.raw.accountNo }}
              </span>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
      <v-card-actions style="display: flex; justify-content: space-evenly">
        <v-btn color="error" variant="elevated" text="انصراف" @click="isDialogActive = false"></v-btn>
        <v-btn color="primary" variant="elevated" text="ذخیره" @click="handleSave" />
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar v-if="error" v-model="error" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
</template>
