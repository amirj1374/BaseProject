import { api } from '@/services/api';
import { useBaseStore } from '@/stores/base';
import { useCustomerInfoStore } from '@/stores/customerInfo';
import { useCustomizerStore } from '@/stores/customizer';
import type { AppInitializationResult } from './appInitializer';
import { AppInitializer } from './appInitializer';

const validThemes = [
  'ModernTheme',
  'PurpleTheme',
  'SteelTealGreen',
  'OrangeTheme',
  'TealTheme',
  'SilverTheme',
  'RedTheme',
  'DarkModernTheme',
  'DarkPurpleTheme',
  'DarkSteelTealGreen',
  'DarkOrangeTheme',
  'DarkTealTheme',
  'DarkSilverTheme',
  'DarkRedTheme'
] as const;

const validLayoutTypes = ['SideBar', 'NavBar'] as const;
const validFontThemes = ['vazir', 'yekanLight', 'iranSans', 'kalamehLight'] as const;
const validThemeModes = ['light', 'dark'] as const;

const validateTheme = (theme: string): string => {
  return validThemes.includes(theme as (typeof validThemes)[number]) ? theme : 'PurpleTheme';
};

const validateLayoutType = (layout: string): string => {
  return validLayoutTypes.includes(layout as (typeof validLayoutTypes)[number]) ? layout : 'SideBar';
};

const validateFontTheme = (font: string): string => {
  return validFontThemes.includes(font as (typeof validFontThemes)[number]) ? font : 'vazir';
};

const validateThemeMode = (mode: string): string => {
  return validThemeModes.includes(mode as (typeof validThemeModes)[number]) ? mode : 'light';
};

const validateInputBg = (inputBg: boolean): boolean => {
  return typeof inputBg === 'boolean' ? inputBg : false;
};

class SamapAppInitializer extends AppInitializer {
  constructor() {
    super();
  }

  protected override async runInitialization(): Promise<AppInitializationResult> {
    if (import.meta.env.DEV) {
      console.log('[SamapAppInitializer] runInitialization start');
    }
    const customerInfoStore = useCustomerInfoStore();
    const customizerStore = useCustomizerStore();
    const baseStore = useBaseStore();

    customizerStore.SET_LOADING(true);
    customerInfoStore.clearError();

    const baseDataPromise = Promise.all([
      api.approval.fetchCurrencies(),
      api.approval.getCollateral(),
      api.approval.getRegions(),
      (async () => {
        if (import.meta.env.DEV) {
          console.log('[SamapAppInitializer] Fetching department level');
        }
        return api.user.getDepartmentsLevel();
      })()
    ]);

    if (import.meta.env.DEV) {
      console.log('[SamapAppInitializer] Fetching user info');
    }
    const userInfo = await api.user.getUserInfo();
    customerInfoStore.setUserInfo(userInfo.data);

    if (userInfo.data.customizer) {
      const { customizer } = userInfo.data;
      customizerStore.actTheme = validateTheme(customizer.actTheme);
      customizerStore.fontTheme = validateFontTheme(customizer.fontTheme);
      customizerStore.inputBg = validateInputBg(customizer.inputBg);
      customizerStore.themeMode = validateThemeMode(customizer.themeMode);
      customizerStore.layoutType = validateLayoutType(customizer.layoutType || 'SideBar');
    }

    const [currency, collateral, regions, departmentLevel] = await baseDataPromise;
    baseStore.setCurrencyList(currency.data);
    baseStore.setCollateralList(collateral.data);
    baseStore.setRegionsList(regions.data);
    baseStore.setDepartmentLevel(departmentLevel.data);

    if (import.meta.env.DEV) {
      console.log('[SamapAppInitializer] runInitialization completed');
    }
    return userInfo.data as AppInitializationResult;
  }

  protected override handleInitializationError(error: unknown): void {
    const customerInfoStore = useCustomerInfoStore();
    const message = error instanceof Error ? error.message : 'Failed to load application data';
    customerInfoStore.setError(message);
    super.handleInitializationError(error);
  }

  protected override onInitializationFinally(): void {
    const customizerStore = useCustomizerStore();
    customizerStore.SET_LOADING(false);
  }
}

const samapAppInitializer = new SamapAppInitializer();

export const initializeApp = () => samapAppInitializer.initializeApp();
export const startInitialization = () => samapAppInitializer.startInitialization();
export const isAppInitialized = () => samapAppInitializer.isAppInitialized();
export const waitForInitialization = () => samapAppInitializer.waitForInitialization();
export const reinitializeApp = () => samapAppInitializer.reinitialize();

