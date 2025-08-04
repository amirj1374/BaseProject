<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';

const customizer = useCustomizerStore();

// Font Family options
const fontFamily = ref(['vazir', 'yekanLight', 'iranSans', 'kalamehLight']);

// Theme color palette options
const colorPalette = ref([
  {
    themeName: 'OrangeTheme',
    primary: '#C77E23',
    secondary: '#16595A',
    dark: false
  },
  {
    themeName: 'SteelTealGreen',
    primary: '#607D8B',
    secondary: '#009688',
    dark: false
  },
  {
    themeName: 'PurpleTheme',
    primary: '#1e88e5',
    secondary: '#5e35b1',
    dark: false
  },
  {
    themeName: 'RedTheme',
    primary: '#203461',
    secondary: '#EC407A',
    dark: false
  },
  {
    themeName: 'DarkOrangeTheme',
    primary: '#C77E23',
    secondary: '#16595A',
    dark: true
  },
  {
    themeName: 'DarkSteelTealGreen',
    primary: '#607D8B',
    secondary: '#009688',
    dark: true
  },
  {
    themeName: 'DarkPurpleTheme',
    primary: '#1e88e5',
    secondary: '#5e35b1',
    dark: true
  },
  {
    themeName: 'DarkRedTheme',
    primary: '#203461',
    secondary: '#EC407A',
    dark: true
  }
]);

// Filtered themes for light and dark
const lightThemes = colorPalette.value.filter(theme => !theme.dark);
const darkThemes = colorPalette.value.filter(theme => theme.dark);

// Initial tabs
const tab = ref('style');

// Watch for changes in the fontTheme state from Pinia store
watch(
  () => customizer.fontTheme,
  (newFont) => {
    // Set the new font value in the CSS custom property (global font)
    document.documentElement.style.setProperty('--font-theme', newFont);
  },
  { immediate: true } // This ensures that the font is set immediately on page load
);

// Watch for changes in the layoutType state from Pinia store
watch(
  () => customizer.layoutType,
  (newLayout) => {
    // Apply the new layout class to the body or root element
    document.body.className = ''; // Reset classes
    document.body.classList.add(`layout-${newLayout.toLowerCase()}`);
  },
  { immediate: true }
);

function clearOption() {
  customizer.inputBg = false;
  customizer.fontTheme = 'vazir';
  customizer.actTheme = 'DarkRedTheme';
  customizer.layoutType = 'SideBar'; // Reset layout to default
}
</script>

<!------------------------------------->
<!-- Customizer -->
<!------------------------------------->
<template>
  <v-navigation-drawer app temporary elevation="10" location="left" v-model="customizer.Customizer_drawer" width="350">
    <perfect-scrollbar style="height: 100%">
      <v-col cols="12" class="pa-0">
        <div class="pa-5 d-flex justify-space-between align-center">
          <div class="text-subtitle-1 font-weight-medium">تم های شخصی</div>
          <div>
            <v-btn color="error" variant="outlined" size="small" class="ml-2" @click="clearOption"> بازنشانی</v-btn>
            <v-btn
              variant="text"
              color="lightText"
              icon="$close"
              density="compact"
              @click.stop="customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)"
            ></v-btn>
          </div>
        </div>
      </v-col>
      <v-card>
        <v-tabs v-model="tab" bg-color="lightprimary" align-tabs="center" fixed-tabs color="primary">
          <v-tab prepend-icon="$text" value="font"></v-tab>
          <v-tab prepend-icon="$style" value="style"></v-tab>
        </v-tabs>

        <v-card-text>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="style">
              <div>
                <v-row class="ma-0">
                  <v-col cols="12" class="pa-0">
                    <!------------------------------------->
                    <!-- Light Themes -->
                    <!------------------------------------->
                    <v-card-item class="py-5">
                      <v-card-title class="text-subtitle-1 font-weight-medium mb-4">تم های روشن</v-card-title>
                      <v-card-text>
                        <div class="custom-theme-colors">
                          <div
                            v-for="color in lightThemes"
                            :key="color.themeName"
                            :class="['color-option', { selected: customizer.actTheme === color.themeName }]"
                            :style="{background: `conic-gradient(${color.primary} 50%, ${color.secondary} 50%)` }"
                            @click="customizer.SET_THEME(color.themeName)"
                          ></div>
                        </div>
                      </v-card-text>
                    </v-card-item>

                    <!------------------------------------->
                    <v-divider></v-divider>
                    <!------------------------------------->
                    <!-- Dark Themes -->
                    <!------------------------------------->
                    <v-card-item class="py-5">
                      <v-card-title class="text-subtitle-1 font-weight-medium mb-4">تم های تیره</v-card-title>
                      <v-card-text>
                        <div class="custom-theme-colors">
                          <div
                            v-for="color in darkThemes"
                            :key="color.themeName"
                            :class="['color-option', { selected: customizer.actTheme === color.themeName }]"
                            :style="{background: `conic-gradient(${color.primary} 50%, ${color.secondary} 50%)` }"
                            @click="customizer.SET_THEME(color.themeName)"
                          ></div>
                        </div>
                      </v-card-text>
                    </v-card-item>
                  </v-col>
                </v-row>
              </div>
            </v-tabs-window-item>

            <v-tabs-window-item value="font">
              <div>
                <v-row class="ma-0">
                  <v-col cols="12" class="pa-0">
                    <!------------------------------------->
                    <!-- Font Family -->
                    <!------------------------------------->
                    <v-card-item class="py-5">
                      <v-card-title class="text-subtitle-1 font-weight-medium mb-4">انتخاب فونت</v-card-title>
                      <v-card-text class="pa-0">
                        <v-radio-group v-model="customizer.fontTheme" hide-details class="custom-font">
                          <v-radio
                            v-for="font in fontFamily"
                            :key="font"
                            label="بانک پارسیان"
                            :value="font"
                            color="primary"
                            class="mb-5"
                            :style="{ fontFamily: font }"
                            @click="customizer.SET_FONT(font)"
                          ></v-radio>
                        </v-radio-group>
                      </v-card-text>
                    </v-card-item>
                    <!------------------------------------->
                    <!-- end Font Family -->
                    <!------------------------------------->
                    <v-divider></v-divider>
                  </v-col>
                </v-row>
              </div>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>

<style lang="scss">
.custom-theme-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: start;

  .color-option {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s;
    transform: rotate(45deg);

    &:hover {
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
      transform: scale(1.1) rotate(45deg);
    }

    &.selected {
      border: 3px solid var(--v-theme-primary); // Active color border

      &::after {
        content: '✔';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        color: white;
        font-size: 20px;
        font-weight: bold;
      }
    }
  }
}

.layout-toggle {
  display: flex;
  align-items: center;
}

.radio-group {
  gap: 10px; // Space between toggle buttons
}

.radio-btn {
  margin: 0;
  padding: 0;
}

// Custom Layout Button
.custom-layout {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #1976d2;
  border-radius: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  position: relative;
}

// Sidebar Layout (Left Sidebar)
.sidebar-layout::before {
  content: "";
  width: 40%;
  height: 80%;
  background-color: #1976d2;
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 5px;
}

// Navbar Layout (Top Navbar)
.navbar-layout::before {
  content: "";
  width: 80%;
  height: 30%;
  background-color: #1976d2;
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 5px;
}

// Selected State
.v-selection-control--dirty .custom-layout {
  border: 3px solid #1976d2;
  background-color: #ffffff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
</style>