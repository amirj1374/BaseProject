<script setup lang="ts">
</script>

<template>
  <div class="total-income">
    <v-card elevation="0" class="bubble-shape-sm overflow-hidden bubble-warning">
      <v-card-text class="pa-5">
        <div class="d-flex align-center ga-4">
          <v-btn color="lightsecondary" icon rounded="sm" variant="flat">
            <BuildingStoreIcon stroke-width="1.5" width="25" class="text-secondary" />
          </v-btn>
          <div>
            <h4 class="text-h4 font-weight-medium">700,000 ریال</h4>
            <span class="text-subtitle-2 text-disabled font-weight-medium">مبلغ کل پرداختنی</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card elevation="0" class="bg-primary overflow-hidden bubble-shape-sm bubble-primary">
      <v-card-text class="pa-5">
        <div class="d-flex align-center ga-4">
          <v-btn color="darkprimary" icon rounded="sm" variant="flat">
            <TableIcon stroke-width="1.5" width="25" />
          </v-btn>
          <div>
            <h4 class="text-h4 font-weight-medium">1,000,000 ریال</h4>
            <span class="text-subtitle-2 text-medium-emphasis text-white">مبلغ کل محقق شده</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-card elevation="0" class="bubble-shape-sm overflow-hidden bubble-warning">
      <v-card-text class="pa-5">
        <div class="d-flex align-center ga-4">
          <v-btn color="lightsecondary" icon rounded="sm" variant="flat">
            <BuildingStoreIcon stroke-width="1.5" width="25" class="text-secondary" />
          </v-btn>
          <div>
            <h4 class="text-h4 font-weight-medium">500,000 ریال</h4>
            <span class="text-subtitle-2 text-disabled font-weight-medium">مبلغ کل پرداخت شده</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<style scoped>
.total-income {
  display: flex;
  gap: 1rem;
}
</style>
