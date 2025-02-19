import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const DarkOrangeTheme: ThemeTypes = {
  name: 'OrangeTheme',
  dark: false,
  variables: {
    'border-color': '#C77E23',
    'carousel-control-size': 10
  },
  colors: {
    primary: '#C77E23',
    secondary: '#16595A',
    info: '#03c9d7',
    success: '#00c853',
    accent: '#FFAB91',
    warning: '#ffc107',
    error: '#f44336',
    lightprimary: '#F8F0E5',
    lightsecondary: '#E3EBEB',
    lightsuccess: '#b9f6ca',
    lighterror: '#f9d8d8',
    lightwarning: '#fff8e1',
    darkText: '#212121',
    lightText: '#616161',
    darkprimary: '#C1761F',
    darksecondary: '#135152',
    borderLight: '#d0d0d0',
    inputBorder: '#787878',
    containerBg: '#E3EBEB',
    surface: '#fff',
    'on-surface-variant': '#fff',
    facebook: '#4267b2',
    twitter: '#1da1f2',
    linkedin: '#0e76a8',
    gray100: '#fafafa',
    primary200: '#F8F0E5',
    secondary200: '#F8F0E5',
    white: '#FFFFFF'
  }
};

export { DarkOrangeTheme };
