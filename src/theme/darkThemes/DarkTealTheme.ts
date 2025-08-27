import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const DarkTealTheme: ThemeTypes = {
  name: 'DarkTealTheme',
  dark: true,
  variables: {
    'border-color': '#00695C',
    'carousel-control-size': 10
  },
  colors: {
    primary: '#00695C',
    secondary: '#4DB6AC',
    info: '#03c9d7',
    success: '#00c853',
    accent: '#FFAB91',
    warning: '#ffc107',
    error: '#f44336',
    lightprimary: '#1B2A2A',
    lightsecondary: '#1A2A2A',
    lightsuccess: '#1B3A1B',
    lighterror: '#3A1B1B',
    lightwarning: '#3A2F1B',
    darkText: '#FFFFFF',
    lightText: '#B0B0B0',
    darkprimary: '#008E76',
    darksecondary: '#64D8CB',
    borderLight: '#404040',
    inputBorder: '#606060',
    containerBg: '#1A1A1A',
    surface: '#121212',
    'on-surface-variant': '#E0E0E0',
    facebook: '#4267b2',
    twitter: '#1da1f2',
    linkedin: '#0e76a8',
    gray100: '#2A2A2A',
    primary200: '#1B2A2A',
    secondary200: '#1A2A2A',
    white: '#FFFFFF'
  }
};

export { DarkTealTheme };
