import { Platform } from 'react-native';
import {
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import { MD3Typescale, ThemeProp } from 'react-native-paper/lib/typescript/types';

// ---- Android font family map ----
const androidFamilies = {
  '100': 'Manrope-ExtraLight',
  '200': 'Manrope-ExtraLight',
  '300': 'Manrope-Light',
  '400': 'Manrope-Regular',
  '500': 'Manrope-Medium',
  '600': 'Manrope-SemiBold',
  '700': 'Manrope-Bold',
  '800': 'Manrope-ExtraBold',
  '900': 'Manrope-ExtraBold',
} as const;

type WeightKey = keyof typeof androidFamilies;

const baseFonts = MD3LightTheme.fonts as MD3Typescale;
type FontEntry = [keyof MD3Typescale, MD3Typescale[keyof MD3Typescale]];

const entries = Object.entries(baseFonts) as FontEntry[];

const fonts = configureFonts({
  isV3: true,
  config: Object.fromEntries(
    entries.map(([k, v]) => {
      const w = String((v as any)?.fontWeight ?? '400') as WeightKey;

      if (Platform.OS === 'android') {
        return [
          k,
          {
            ...(v as any),
            fontFamily: androidFamilies[w] ?? 'Manrope-Regular',
            fontWeight: 'normal',
          },
        ];
      }

      if (Platform.OS === 'web') {
        return [k, { ...(v as any), fontFamily: 'Manrope, sans-serif' }];
      }

      return [k, { ...(v as any), fontFamily: 'Manrope' }];
    })
  ) as MD3Typescale,
});

// Updated brand colors aligned with the soft-violet design system
export const colors = {
  primary: '#7A6FF0', // soft violet (main accent)
  primaryVariant: '#6A5EF0',
  secondary: '#B7A9F6', // lighter violet for secondary accents
  secondaryVariant: '#D9CCFF',
  background: '#F8F8FB', // soft off-white background for light theme
  surface: '#FFFFFF',
  darkBackground: '#0F1724', // deep charcoal for dark surfaces
  textPrimary: '#1E1E28',
  textSecondary: '#8A8A9E',
  danger: '#FF5F56',
};

// ✅ Exported Light Theme
export const lightTheme: ThemeProp = {
  ...MD3LightTheme,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    background: colors.background,
    primary: colors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: colors.primaryVariant,
    onPrimaryContainer: '#FFFFFF',
    secondary: colors.secondary,
    onSecondary: '#FFFFFF',
    secondaryContainer: colors.secondaryVariant,
    onSecondaryContainer: '#1E1E28',
    surface: colors.surface,
    onSurface: colors.textPrimary,
    surfaceVariant: '#F1F0F6',
    onSurfaceVariant: colors.textSecondary,
    outline: '#D0CFDA',
    error: colors.danger,
    onError: '#FFFFFF',
  },
};

// ✅ Exported Dark Theme
export const darkTheme: ThemeProp = {
  ...MD3DarkTheme,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    background: colors.darkBackground,
    primary: colors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: colors.primaryVariant,
    onPrimaryContainer: '#FFFFFF',
    secondary: colors.secondary,
    onSecondary: '#000000',
    secondaryContainer: colors.secondaryVariant,
    onSecondaryContainer: '#000000',
    surface: '#141416',
    onSurface: '#FFFFFF',
    surfaceVariant: '#1F1C2E',
    onSurfaceVariant: '#CCCCCC',
    outline: '#444444',
    error: colors.danger,
    onError: '#FFFFFF',
  },
};

// Re-export a typed useTheme hook so consumers can import from the project's theme module
export type AppTheme = ThemeProp;

export const useTheme = (): AppTheme => usePaperTheme() as AppTheme;
