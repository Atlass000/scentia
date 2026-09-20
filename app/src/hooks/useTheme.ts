// src/hooks/useTheme.ts
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, makeTypography, spacing, fonts, shadows } from '../theme';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const c = isDark ? darkColors : lightColors;
  const t = makeTypography(c);

  return {
    isDark,
    colors: c,
    typography: t,
    spacing,
    fonts,
    shadows,
    // Shorthand style helpers used throughout the app
    styles: {
      screen: { flex: 1, backgroundColor: c.background },
      surface: { backgroundColor: c.surface },
      border: { borderColor: c.border },
      text: { color: c.charcoal },
      textMid: { color: c.mid },
      textAccent: { color: c.accent },
    },
  };
}

export type AppTheme = ReturnType<typeof useTheme>;
