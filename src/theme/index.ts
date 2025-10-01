// theme.ts
import { Platform } from "react-native";
import {
  MD3LightTheme,
  configureFonts,
//   MD3Typescale,
//   ThemeProp,
} from "react-native-paper";
import { MD3Typescale, ThemeProp } from "react-native-paper/lib/typescript/types";

// ---- Android: map weights to specific files ----
const androidFamilies = {
  "100": "Manrope-ExtraLight",
  "200": "Manrope-ExtraLight",
  "300": "Manrope-Light",
  "400": "Manrope-Regular",
  "500": "Manrope-Medium",
  "600": "Manrope-SemiBold",
  "700": "Manrope-Bold",
  "800": "Manrope-ExtraBold",
  "900": "Manrope-ExtraBold",
} as const;

type WeightKey = keyof typeof androidFamilies;

// Use the MD3 type so entries aren’t `{}`.
const baseFonts = MD3LightTheme.fonts as MD3Typescale;

// Properly type the Object.entries result
type FontEntry = [keyof MD3Typescale, MD3Typescale[keyof MD3Typescale]];
const entries = Object.entries(baseFonts) as FontEntry[];

const fonts = configureFonts({
  isV3: true,
  config: Object.fromEntries(
    entries.map(([k, v]) => {
      // v is now typed; `fontWeight` may be string | number | undefined in MD3
      const w = String((v as any)?.fontWeight ?? "400") as WeightKey;

      if (Platform.OS === "android") {
        return [
          k,
          {
            ...(v as any),
            fontFamily: androidFamilies[w] ?? "Manrope-Regular",
            // Keep this "normal" so Android uses the file we set
            fontWeight: "normal",
          },
        ];
      }

      if (Platform.OS === "web") {
        return [k, { ...(v as any), fontFamily: "Manrope, sans-serif" }];
      }

      // iOS: one family + weights works
      return [k, { ...(v as any), fontFamily: "Manrope" }];
    })
  ) as MD3Typescale,
});

export const colors = {
  background: "#F5F7FA",
  primary: '#4B6CFF',
  primaryVariant: '#3A8DFF',
  secondary: '#9C42FF',
  secondaryVariant: '#C56FFF',
};

export const theme: ThemeProp = {
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
    // You should also override neutrals / background / surface etc.
    onBackground: '#121212',     // text on background
    surface: '#FFFFFF',
    onSurface: '#1E1E1E',
    surfaceVariant: '#E0E0E0',
    onSurfaceVariant: '#444444',
    outline: '#B0B0B0',
  },
};
