// src/components/common/EmptyState.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export default function EmptyState({ icon, title, subtitle, ctaLabel, onCta }: Props) {
  const { colors: c, spacing: sp } = useTheme();
  return (
    <View style={[s.container, { backgroundColor: c.background }]}>
      <Text style={[s.icon, { color: c.light }]}>{icon}</Text>
      <Text style={[s.title, { color: c.black }]}>{title}</Text>
      <Text style={[s.sub, { color: c.mid }]}>{subtitle}</Text>
      {ctaLabel && onCta && (
        <TouchableOpacity style={[s.btn, { backgroundColor: c.black }]} onPress={onCta} activeOpacity={0.85}>
          <Text style={[s.btnText, { color: c.surface }]}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Pre-built empty states for each screen
export const EMPTY_STATES = {
  favorites: {
    icon: '♡',
    title: 'No favorites yet',
    subtitle: 'Discover fragrances and save the ones that speak to you.',
    ctaLabel: 'Start Discovering',
  },
  searchHistory: {
    icon: '◷',
    title: 'No searches yet',
    subtitle: 'Your fragrance discovery journey starts here.',
    ctaLabel: 'Find My Scent',
  },
  results: {
    icon: '◎',
    title: 'No matches found',
    subtitle: 'Try selecting different notes or adjusting your intensity profile.',
    ctaLabel: 'Refine Search',
  },
  catalog: {
    icon: '◈',
    title: 'Catalog is empty',
    subtitle: 'The fragrance catalog is being updated. Check back soon.',
  },
  notifications: {
    icon: '◉',
    title: 'No notifications',
    subtitle: 'Enable notifications to receive your weekly fragrance picks.',
    ctaLabel: 'Enable Notifications',
  },
};

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  icon: { fontSize: 52, marginBottom: 24 },
  title: { fontFamily: 'Georgia', fontSize: 24, marginBottom: 12, textAlign: 'center' },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 36, maxWidth: 280 },
  btn: { paddingVertical: 16, paddingHorizontal: 48 },
  btnText: { fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
});
