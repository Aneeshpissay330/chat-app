import { Platform } from 'react-native';
import {
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
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

// Common brand colors
export const colors = {
  primary: '#4B6CFF',
  primaryVariant: '#3A8DFF',
  secondary: '#9C42FF',
  secondaryVariant: '#C56FFF',
  background: '#FFFFFF',
  darkBackground: '#121212',
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
    onSecondaryContainer: '#FFFFFF',
    onBackground: '#121212',
    surface: '#FFFFFF',
    onSurface: '#1E1E1E',
    surfaceVariant: '#E0E0E0',
    onSurfaceVariant: '#444444',
    outline: '#B0B0B0',
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
    onSecondary: '#FFFFFF',
    secondaryContainer: colors.secondaryVariant,
    onSecondaryContainer: '#FFFFFF',
    onBackground: '#FFFFFF',
    surface: '#1A1A1A',
    onSurface: '#FFFFFF',
    surfaceVariant: '#2C2C2C',
    onSurfaceVariant: '#DDDDDD',
    outline: '#666666',
  },
};
