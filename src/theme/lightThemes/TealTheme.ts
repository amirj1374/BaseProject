import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const TealTheme: ThemeTypes = {
  name: 'TealTheme',
  dark: false,
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
    lightprimary: '#e0f2f1',
    lightsecondary: '#e0f2f1',
    lightsuccess: '#b9f6ca',
    lighterror: '#f9d8d8',
    lightwarning: '#fff8e1',
    darkText: '#212121',
    lightText: '#616161',
    darkprimary: '#004d40',
    darksecondary: '#00796b',
    borderLight: '#d0d0d0',
    inputBorder: '#787878',
    containerBg: '#e0f2f1',
    surface: '#fff',
    'on-surface-variant': '#fff',
    facebook: '#4267b2',
    twitter: '#1da1f2',
    linkedin: '#0e76a8',
    gray100: '#fafafa',
    primary200: '#b2dfdb',
    secondary200: '#b2dfdb',
    white: '#FFFFFF'
  }
};

export { TealTheme };
