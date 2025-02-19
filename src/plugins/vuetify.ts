import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { icons } from './mdi-icon'; // Import icons from separate file
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { PurpleTheme } from '@/theme/lightThemes/PurpleTheme';
import { RedTheme } from '@/theme/lightThemes/RedTheme';
import { OrangeTheme } from '@/theme/lightThemes/OrangeTheme';
import { SteelTealGreen } from '@/theme/lightThemes/SteelTealGreen';
import { DarkOrangeTheme } from '@/theme/darkThemes/DarkOrangeTheme';
import { DarkPurpleTheme } from '@/theme/darkThemes/DarkPurpleTheme';
import { DarkRedTheme } from '@/theme/darkThemes/DarkRedTheme';
import { DarkSteelTealGreen } from '@/theme/darkThemes/DarkSteelTealGreen';


export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      ...icons
    },
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'SteelTealGreen',
    themes: {
      RedTheme,
      SteelTealGreen,
      OrangeTheme,
      PurpleTheme,
      DarkOrangeTheme,
      DarkPurpleTheme,
      DarkRedTheme,
      DarkSteelTealGreen
    }
  },
  defaults: {
    VBtn: {},
    VCard: {
      rounded: 'md'
    },
    VTextField: {
      rounded: 'lg'
    },
    VTooltip: {
      // set v-tooltip default location to top
      location: 'top'
    }
  }
});
