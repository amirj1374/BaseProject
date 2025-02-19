import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const DarkRedTheme: ThemeTypes = {
  name: 'RedTheme',
  dark: true,
  variables: {
    'border-color': '#1e88e5',
    'carousel-control-size': 10
  },
  colors: {
    primary: '#203461',
    secondary: '#EC407A',
    info: '#03c9d7',
    success: '#00c853',
    accent: '#FFAB91',
    warning: '#ffc107',
    error: '#f44336',
    lightprimary: '#070E13',
    lightsecondary: '#070E13',
    lightsuccess: '#b9f6ca',
    lighterror: '#f9d8d8',
    lightwarning: '#fff8e1',
    darkText: '#212121',
    lightText: '#8C9295',
    darkprimary: '#132145',
    darksecondary: '#E42A5D',
    borderLight: '#182435',
    inputBorder: '#182435',
    containerBg: '#12172F',
    surface: '#030614',
    'on-surface-variant': '#030614',
    facebook: '#4267b2',
    twitter: '#1da1f2',
    linkedin: '#0e76a8',
    gray100: '#fafafa',
    primary200: '#90caf9',
    secondary200: '#FDE8EF',
    white: '#a3b3ff'
  }
};

export { DarkRedTheme };
