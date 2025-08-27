import type { ThemeTypes } from '@/types/themeTypes/ThemeType';

const DarkPurpleTheme: ThemeTypes = {
  name: 'DarkPurpleTheme',
  dark: true,
  variables: {
    'border-color': '#1e88e5',
    'carousel-control-size': 10
  },
  colors: {
    primary: '#1e88e5',
    secondary: '#5e35b1',
    info: '#03c9d7',
    success: '#00c853',
    accent: '#FFAB91',
    warning: '#ffc107',
    error: '#f44336',
    lightprimary: '#1B2A3A',
    lightsecondary: '#2A1B3A',
    lightsuccess: '#1B3A1B',
    lighterror: '#3A1B1B',
    lightwarning: '#3A2F1B',
    darkText: '#FFFFFF',
    lightText: '#B0B0B0',
    darkprimary: '#42A5F5',
    darksecondary: '#7B1FA2',
    borderLight: '#404040',
    inputBorder: '#606060',
    containerBg: '#1A1A1A',
    surface: '#121212',
    'on-surface-variant': '#E0E0E0',
    facebook: '#4267b2',
    twitter: '#1da1f2',
    linkedin: '#0e76a8',
    gray100: '#2A2A2A',
    primary200: '#1B2A3A',
    secondary200: '#2A1B3A',
    white: '#FFFFFF'
  }
};

export { DarkPurpleTheme };
