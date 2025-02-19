<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import vuetify from '@/plugins/vuetify';
import { useCustomizerStore } from '@/stores/customizer';
const customizerStore = ref(useCustomizerStore()); // = DarkOrangeTheme
const currentTheme = ref(vuetify.theme.themes.value[customizerStore.value.getActTheme]);

const select = ref({ state: 'امروز', abbr: 'FL' });
const items = [
  { state: 'روزانه', abbr: 'FL' },
  { state: 'ماهانه', abbr: 'GA' },
  { state: 'سالانه', abbr: 'NE' }
];
// Watch for theme changes and update currentTheme dynamically
watch(() => customizerStore.value.getActTheme, (newTheme) => {
  currentTheme.value = vuetify.theme.themes.value[newTheme];
});
// chart 1
const chartOptions1 = computed(() => {
  return {
    chart: {
      type: 'bar',
      height: 480,
      fontFamily: `inherit`,
      foreColor: currentTheme.value.colors.secondary,
      stacked: true,

    },
    colors: [currentTheme.value.colors.secondary200, currentTheme.value.colors.primary, currentTheme.value.colors.secondary, currentTheme.value.colors.secondary200],
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%'
      }
    },
    xaxis: {
      type: 'category',
      categories: ['بانک پارسیان', 'بانک ملت', 'بانک ملی', 'بانک تجارت', 'بانک صادرات', 'بانک سامان', 'بانک پاسارگاد']
    },
    legend: {
      show: true,
      fontFamily: `'vazir', sans-serif`,
      position: 'bottom',
      offsetX: 7,
      labels: {
        useSeriesColors: false
      },
      markers: {
        width: 16,
        height: 16,
        radius: 5
      },
      itemMargin: {
        horizontal: 15,
        vertical: 8
      }
    },
    fill: {
      type: 'solid'
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      show: true
    },
    tooltip: {
      theme: 'dark'
    }
  };
});

// chart 1
const lineChart1 = {
  series: [
    {
      name: 'موجودی کل',
      data: [35, 125, 35, 35, 35, 80, 35]
    },
    {
      name: 'موجودی خالص',
      data: [35, 15, 15, 35, 65, 40, 80]
    },
    {
      name: 'سود',
      data: [35, 145, 35, 35, 20, 105, 100]
    }
  ]
};
</script>

<template>
  <v-card elevation="0">
    <v-card variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="9">
            <span class="text-subtitle-2 text-disabled font-weight-bold">دارایی های نزد هر بانک</span>
            <h3 class="text-h3 mt-1">1,000,515,555 ریال</h3>
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              color="primary"
              variant="outlined"
              hide-details
              v-model="select"
              :items="items"
              item-title="state"
              item-value="abbr"
              label="Select"
              persistent-hint
              return-object
              single-line
            >
            </v-select>
          </v-col>
        </v-row>
        <div class="mt-4">
          <apexchart type="bar" height="480" :options="chartOptions1" :series="lineChart1.series"></apexchart>
        </div>
      </v-card-text>
    </v-card>
  </v-card>
</template>
