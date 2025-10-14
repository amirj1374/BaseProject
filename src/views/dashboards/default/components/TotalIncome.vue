<script setup lang="ts">
import { IconBuildingStore, IconTableShare } from '@tabler/icons-vue';
</script>

<template>
  <div class="total-income">
    <v-card elevation="0" class="bubble-shape-sm overflow-hidden bubble-warning">
      <v-card-text class="pa-5">
        <div class="d-flex align-center ga-4">
          <v-btn color="lightsecondary" icon rounded="sm" variant="flat" class="ti-btn-secondary">
            <IconBuildingStore stroke-width="1.5" width="25" class="ti-icon" />
          </v-btn>
          <div>
            <h4 class="text-h4 font-weight-medium">700,000 ریال</h4>
            <span class="text-subtitle-2 text-disabled font-weight-medium">نام و نام خوادگی</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card elevation="0" class="bg-primary overflow-hidden bubble-shape-sm bubble-primary">
      <v-card-text class="pa-5">
        <div class="d-flex align-center ga-4">
          <v-btn color="darkprimary" icon rounded="sm" variant="flat" class="ti-btn-primary">
            <IconTableShare stroke-width="1.5" width="25" class="ti-icon" />
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
          <v-btn color="lightsecondary" icon rounded="sm" variant="flat" class="ti-btn-secondary">
            <IconBuildingStore stroke-width="1.5" width="25" class="ti-icon" />
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

/* Icon color inherits currentColor; control via button context */
.ti-icon {
  color: rgb(var(--v-theme-secondary));
}

/* Primary button icon default/hover */
.ti-btn-primary .ti-icon {
  color: rgb(var(--v-theme-on-primary));
}
.ti-btn-primary:hover {
  background-color: rgb(var(--v-theme-primary));
}
.ti-btn-primary:hover .ti-icon {
  color: rgb(var(--v-theme-on-primary));
}

/* Secondary (light) button icon default/hover */
.ti-btn-secondary .ti-icon {
  color: rgb(var(--v-theme-secondary));
}
.ti-btn-secondary:hover {
  background-color: rgb(var(--v-theme-secondary));
}
.ti-btn-secondary:hover .ti-icon {
  color: rgb(var(--v-theme-on-secondary));
}
</style>
