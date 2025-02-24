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
}

const loading = ref(false);
const canSubmit = ref(false);
const error = ref<string | null>(null);
const data = ref([]);
const items = [
  { title: 'مسئول', value: 1 },
  { title: 'مشتری', value: 2 },
  { title: 'ضامن', value: 3 },
];
const header = [
  {
    title: 'نام',
    align: 'start',
    key: 'firstName',
  },
  {
    title: 'نام خانوادگی',
    align: 'start',
    key: 'lastName',
  },
  {
    title: 'کدملی / شناسه ملی',
    align: 'start',
    key: 'nationalCode',
  },
  {
    title: 'نوع مشتری',
    align: 'start',
    key: 'personType',
  },
  {
    title: 'گروه مشتری',
    align: 'start',
    key: 'personRelationType',
  },
  {
    title: 'نام شرکت',
    align: 'start',
    key: 'customerType',
  },
  {
    title: 'آدرس',
    align: 'start',
    key: 'address',
  },
  {
    title: 'کدپستی',
    align: 'start',
    key: 'postalCode\n',
  },
  {
    title: 'شماره تماس',
    align: 'start',
    key: 'name',
  },
  {
    title: 'نام شعبه',
    align: 'start',
    key: 'branchName',
  },
  {
    title: 'کد شعبه',
    align: 'start',
    key: 'branchCode',
  },

]

const formData = ref({
  personType: null,
  nationalCode: ''
});

const isFormValid = computed(() => {
  return formData.value.nationalCode.length === 10 && formData.value.personType !== null;
});
const callApi = async () => {
  if (!isFormValid.value) {
    error.value = 'Please fill all required fields correctly.';
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
        <v-container>
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
              <v-data-table
                :headers="header"
                :items="data"
                item-value="name"
                hide-default-footer
              ></v-data-table>
            </v-col>
          </v-row>
        </v-container>
        <v-snackbar v-if="error" v-model="error" color="error" timeout="3000">
          {{ error }}
        </v-snackbar>
      </form>
  </v-card>
</template>

<style scoped>
.error {
  color: red;
  margin-top: 0.5em;
}
</style>
