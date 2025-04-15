<script lang="ts" setup>
import type { ContractTypeDto, CurrenciesDto } from '@/types/approval/approvalType';
import { onMounted, ref } from 'vue';
import { api } from '@/services/api'; // adjust the path as needed

const contractType = ref<ContractTypeDto[]>([]);
const isDialogActive = ref(false)
// define props
const props = defineProps<{
  currencies: CurrenciesDto[]
}>()

onMounted(async () => {
  const currenciesRes = await api.approval.getContractType('ContractCode');
  contractType.value = currenciesRes.data.generalParameterList

})

</script>

<template>
  <v-btn @click="isDialogActive = true" >تسهیلات</v-btn>
  <v-dialog max-width="1200" v-model="isDialogActive">
      <v-card title="تسهیلات">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-autocomplete
                clearable
                label="نوع ارز"
                :items="props.currencies"
                variant="outlined"
                item-title="description"
                item-value="code"
              ></v-autocomplete>
            </v-col>
            <v-col cols="12" md="4">
              <v-autocomplete
                :items="contractType"
                item-title="longTitle"
                item-value="35357"
                label="نوع عقد"
                variant="outlined"
                persistent-hint
                single-line
                clearable
              ></v-autocomplete>
            </v-col>
<!--            <v-col cols="12" md="4">-->
<!--              <v-select-->
<!--                :items="approval"-->
<!--                item-title="title"-->
<!--                item-value="value"-->
<!--                label="نوع محصول"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--            </v-col>-->
<!--            <v-col cols="12" md="4">-->
<!--              <v-select-->
<!--                v-model="facilitiesSelectedRefundType"-->
<!--                :items="refundType"-->
<!--                item-title="title"-->
<!--                item-value="value"-->
<!--                label="نحوه بازپرداخت"-->
<!--                variant="outlined"-->
<!--                persistent-hint-->
<!--                single-line-->
<!--                clearable-->
<!--              ></v-select>-->
<!--            </v-col>-->
<!--            <v-col  cols="12" md="4">-->
<!--              <v-text-field v-model="selectedPrice" label="مبلغ" variant="outlined" density="comfortable" />-->
<!--            </v-col>-->
<!--            <v-col  cols="12" md="4">-->
<!--              <v-text-field v-model="selectedPrice" label="درصد سپرده نقدی" variant="outlined" density="comfortable" />-->
<!--            </v-col>-->
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="انصراف"
            @click="isDialogActive = false"
          ></v-btn>
          <v-btn
            text="ذخیره"
            @click="isDialogActive = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
  </v-dialog>
</template>