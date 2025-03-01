<script lang="ts" setup>
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import Loading from '@/components/Loading.vue';

interface CustomerDTO {
  nationalCode: string;
}

interface InsertPersonPayload {
  personType: number;
  customerDTO: CustomerDTO;
  approvalRequestId: number
}

const loading = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const data = ref(<any>[]);
const items = [
  { title: 'مسئول', value: 1 },
  { title: 'مشتری', value: 2 },
  { title: 'ضامن', value: 3 },
];
const header = [
  { title: 'نام', align: 'center', key: 'firstName', width: '150px' },
  { title: 'نام خانوادگی', align: 'center', key: 'lastName', width: '150px' },
  { title: 'کدملی', align: 'center', key: 'nationalCode', width: '150px' },
  { title: 'نوع مشتری', align: 'center', key: 'personType', width: '150px' },
  { title: 'گروه مشتری', align: 'center', key: 'personRelationType', width: '150px' },
  { title: 'نام شرکت', align: 'center', key: 'customerType', width: '120px' },
  { title: 'آدرس', align: 'center', key: 'address', width: '200px' },
  { title: 'کدپستی', align: 'center', key: 'postalCode', width: '120px' },
  { title: 'شماره تماس', align: 'center', key: 'name', width: '150px' },
  { title: 'نام شعبه', align: 'center', key: 'branchName', width: '150px' },
  { title: 'کد شعبه', align: 'center', key: 'branchCode', width: '120px' },
];

const formData = ref({
  personType: null,
  nationalCode: ''
});

const isFormValid = computed(() => {
  return formData.value.nationalCode.length === 10 && formData.value.personType !== null;
});
const callApi = async () => {
  if (!isFormValid.value) {
    error.value = 'لطفا فرم های بالا رو کامل کنید';
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const payload: InsertPersonPayload = {
      personType: Number(formData.value.personType),
      customerDTO: {
        nationalCode: formData.value.nationalCode,
      },
      approvalRequestId: 1052
    };
    const response = await api.transaction.insertPersonByNationalCode(payload);
    data.value = response;  // Assume response data is in the format you need
    if (response.status === 200) {
      canSubmit.value = true;
    } else {
      error.value = `Error: ${response.statusText}`;
    }
  } catch (err: any) {
    error.value = err.message || 'خطای سرور.';
  } finally {
    loading.value = false;
  }
}
const submitData = async () => {
  if (canSubmit.value === true) {
    return Promise.resolve();
  } else {
    return  Promise.reject('شما مجاز به ادامه فرآیند نیستید');
  }
};

defineExpose({ submitData });
</script>


<template>
  <v-card variant="flat">
      <form @submit.prevent="submitData">
          <v-row>
            <!-- National Code Input -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.nationalCode"
                label="کد ملی"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <!-- Person Type Select -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.personType"
                :items="items"
                item-title="title"
                item-value="value"
                label="نوع شخص"
                variant="outlined"
                persistent-hint
                single-line
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" md="12" class="text-center">
                <v-btn @click="callApi" type="primary">
                  جستجو
                </v-btn>
            </v-col>
            <v-col cols="12" md="12">
              <div class="table-scroll">
                <v-data-table
                  :headers="header"
                  :items="data"
                  hide-default-footer
                  no-data-text="رکوردی وجود ندارد"
                  sticky
                ></v-data-table>
              </div>
            </v-col>
          </v-row>
        <v-snackbar v-if="error" v-model="error" color="error" timeout="5500">
          {{ error }}
        </v-snackbar>
      </form>
  </v-card>
</template>

<style scoped>
.table-scroll {
  overflow-x: auto;
  max-width: 100%;
}
.error {
  color: red;
  margin-top: 0.5em;
}
</style>
