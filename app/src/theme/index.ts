// src/theme/index.ts
import { Platform } from 'react-native';

// ── LIGHT PALETTE ─────────────────────────────────────────────
export const lightColors = {
  cream: '#faf9f7',
  white: '#ffffff',
  black: '#0a0a0a',
  charcoal: '#1a1a1a',
  mid: '#6b6b6b',
  light: '#c8c4bc',
  accent: '#8b7355',
  accentLight: '#d4c4a8',
  accentDark: '#6b5840',
  border: 'rgba(0,0,0,0.09)',
  borderStrong: 'rgba(0,0,0,0.18)',
  // Semantic
  surface: '#ffffff',
  background: '#faf9f7',
  error: '#c0392b',
  success: '#27ae60',
  overlay: 'rgba(0,0,0,0.5)',
  // Tab bar
  tabBar: '#ffffff',
  tabBarBorder: 'rgba(0,0,0,0.09)',
  tabActive: '#0a0a0a',
  tabInactive: '#c8c4bc',
};

// ── DARK PALETTE ──────────────────────────────────────────────
export const darkColors = {
  cream: '#111110',
  white: '#1c1c1a',
  black: '#f5f4f0',
  charcoal: '#e8e6e0',
  mid: '#8a8880',
  light: '#4a4845',
  accent: '#c4a882',
  accentLight: '#4a3d2e',
  accentDark: '#d4b896',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  // Semantic
  surface: '#1c1c1a',
  background: '#111110',
  error: '#e74c3c',
  success: '#2ecc71',
  overlay: 'rgba(0,0,0,0.7)',
  // Tab bar
  tabBar: '#1c1c1a',
  tabBarBorder: 'rgba(255,255,255,0.08)',
  tabActive: '#f5f4f0',
  tabInactive: '#4a4845',
};

// Default export (light — for legacy imports)
export const colors = lightColors;

// ── FONTS ─────────────────────────────────────────────────────
export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

// ── SPACING ───────────────────────────────────────────────────
export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64,
};

// ── RADIUS ────────────────────────────────────────────────────
export const radius = { sm: 4, md: 8, lg: 16, full: 999 };

// ── TYPOGRAPHY ────────────────────────────────────────────────
// Use makeTypography(colors) so text colors adapt to theme
export function makeTypography(c: typeof lightColors) {
  return {
    hero: { fontFamily: fonts.serif, fontSize: 48, fontWeight: '400' as const, lineHeight: 52, color: c.black },
    h1: { fontFamily: fonts.serif, fontSize: 32, fontWeight: '400' as const, lineHeight: 38, color: c.black },
    h2: { fontFamily: fonts.serif, fontSize: 24, fontWeight: '400' as const, lineHeight: 30, color: c.black },
    h3: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '400' as const, lineHeight: 26, color: c.black },
    body: { fontFamily: fonts.sans, fontSize: 14, fontWeight: '300' as const, lineHeight: 22, color: c.charcoal },
    bodySmall: { fontFamily: fonts.sans, fontSize: 12, fontWeight: '300' as const, lineHeight: 18, color: c.mid },
    label: { fontFamily: fonts.sans, fontSize: 10, fontWeight: '400' as const, letterSpacing: 3, textTransform: 'uppercase' as const, color: c.mid },
    caption: { fontFamily: fonts.sans, fontSize: 11, fontWeight: '300' as const, color: c.light },
  };
}

export const typography = makeTypography(lightColors);

// ── SHADOWS ───────────────────────────────────────────────────
export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 4 },
};
