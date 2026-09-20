// app/(tabs)/index.tsx
import { useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store';
import { getPopularFragrances } from '../../src/services/fragranceService';
import { useTheme } from '../../src/hooks/useTheme';
import FragranceCard from '../../src/components/fragrance/FragranceCard';

export default function HomeScreen() {
  const { profile } = useAuthStore();
  const { colors: c, spacing: sp, typography: t, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: popular = [] } = useQuery({
    queryKey: ['popular'],
    queryFn: () => getPopularFragrances(4),
  });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, delay: 100, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <Animated.View style={[{ opacity: fadeAnim }, styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <View>
            <Text style={{ fontFamily: 'Georgia', fontSize: 26, color: c.black, marginBottom: 4 }}>
              {profile?.displayName ? `Hello, ${profile.displayName.split(' ')[0]}.` : 'Hello.'}
            </Text>
            <Text style={{ fontSize: 13, color: c.mid }}>Discover your next signature scent.</Text>
          </View>
          <View style={[styles.logoMark, { backgroundColor: c.black }]}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 20, color: c.surface, fontStyle: 'italic' }}>S</Text>
          </View>
        </Animated.View>

        {/* Hero CTA */}
        <Animated.View style={[{ opacity: fadeAnim }, styles.heroCta, { margin: sp.lg, marginTop: sp.md, backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 12 }}>
            Fragrance Finder
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 30, color: c.black, lineHeight: 36, marginBottom: 12 }}>
            Compose your{'\n'}<Text style={{ fontStyle: 'italic', color: c.accent }}>signature.</Text>
          </Text>
          <Text style={{ fontSize: 13, color: c.mid, lineHeight: 20, marginBottom: 24 }}>
            Select notes, set intensity, and let Scentia find your perfect fragrance.
          </Text>
          <TouchableOpacity
            style={[styles.heroBtn, { backgroundColor: c.black }]}
            onPress={() => router.push('/(tabs)/finder')}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.surface }}>
              Begin Discovery
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats */}
        <View style={[styles.statsRow, { marginHorizontal: sp.lg, marginBottom: sp.lg, backgroundColor: c.border }]}>
          {[['4K+', 'Fragrances'], ['240', 'Houses'], ['180', 'Notes']].map(([num, lbl]) => (
            <View key={lbl} style={[styles.statBox, { backgroundColor: c.surface }]}>
              <Text style={{ fontFamily: 'Georgia', fontSize: 24, color: c.black, marginBottom: 4 }}>{num}</Text>
              <Text style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: c.light }}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* Popular */}
        {popular.length > 0 && (
          <View style={{ paddingHorizontal: sp.lg, marginBottom: sp.xl }}>
            <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 10 }}>Trending Now</Text>
            <Text style={{ fontFamily: 'Georgia', fontSize: 26, color: c.black, marginBottom: sp.lg }}>
              Popular{'\n'}<Text style={{ fontStyle: 'italic', color: c.accent }}>this week.</Text>
            </Text>
            <View style={{ gap: 12 }}>
              {popular.map((frag, i) => <FragranceCard key={i} fragrance={frag} compact />)}
            </View>
          </View>
        )}

        {/* Premium upsell */}
        {profile?.subscription === 'free' && (
          <TouchableOpacity
            style={[styles.premiumCard, { margin: sp.lg, backgroundColor: isDark ? '#1a1a18' : c.black, borderColor: c.border, borderWidth: 1 }]}
            onPress={() => router.push('/checkout')}
            activeOpacity={0.9}
          >
            <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accentLight, marginBottom: 12 }}>
              Premium
            </Text>
            <Text style={{ fontFamily: 'Georgia', fontSize: 24, color: isDark ? c.black : '#ffffff', lineHeight: 30, marginBottom: 12 }}>
              Unlimited searches,{'\n'}exclusive catalog.
            </Text>
            <Text style={{ fontSize: 12, color: isDark ? c.mid : 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
              $9.99 / month
            </Text>
            <View style={[styles.premiumBtn, { borderColor: isDark ? c.border : 'rgba(255,255,255,0.2)' }]}>
              <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: isDark ? c.black : '#ffffff' }}>
                Upgrade Now →
              </Text>
            </View>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, borderBottomWidth: 1 },
  logoMark: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  heroCta: { borderWidth: 1, padding: 28 },
  heroBtn: { paddingVertical: 16, alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 1 },
  statBox: { flex: 1, paddingVertical: 20, alignItems: 'center' },
  premiumCard: { padding: 32 },
  premiumBtn: { borderWidth: 1, paddingVertical: 14, alignItems: 'center' },
});
