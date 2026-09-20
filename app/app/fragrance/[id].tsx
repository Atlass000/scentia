// app/fragrance/[id].tsx
import { useEffect, useRef } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Share, Animated, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useFinderStore, useAuthStore, useFavoritesStore } from '../../src/store';
import { saveFavorite, removeFavorite } from '../../src/services/fragranceService';
import { getAffiliateLinks } from '../../src/services/affiliateService';
import { colors, spacing, typography } from '../../src/theme';

function Stars({ count, size = 12 }: { count: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <View key={i} style={{ width: size, height: size, backgroundColor: i < count ? colors.black : colors.border, transform: [{ rotate: '45deg' }] }} />
      ))}
    </View>
  );
}

export default function FragranceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { results } = useFinderStore();
  const { user } = useAuthStore();
  const { isFavorite, addFavorite, removeFavorite: removeFromStore } = useFavoritesStore();

  const fragrance = results[parseInt(id || '0', 10)];
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!fragrance) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.notFound}>
          <Text style={s.notFoundText}>Fragrance not found</Text>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.backLink}>← Go back</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const favorited = isFavorite(fragrance.name, fragrance.house);
  const affiliateLinks = getAffiliateLinks(fragrance.name, fragrance.house);

  async function handleFavorite() {
    if (!user) { Toast.show({ type: 'info', text1: 'Sign in to save fragrances' }); return; }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (favorited && fragrance.id) {
      await removeFavorite(user.uid, fragrance.id);
      removeFromStore(fragrance.id);
      Toast.show({ type: 'success', text1: 'Removed from favorites' });
    } else {
      const savedId = await saveFavorite(user.uid, fragrance);
      addFavorite({ ...fragrance, id: savedId });
      Toast.show({ type: 'success', text1: '♡ Saved to favorites' });
    }
  }

  async function handleShare() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `I just discovered ${fragrance.name} by ${fragrance.house} on Scentia. ${fragrance.description}\n\nNotes: ${fragrance.topNotes} → ${fragrance.heartNotes} → ${fragrance.baseNotes}`,
        title: `${fragrance.name} — Scentia`,
      });
    } catch {}
  }

  const longevityLabels = ['', 'Evanescent', 'Light', 'Moderate', 'Long lasting', 'Very long lasting'];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header bar */}
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
          <Text style={s.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={s.headerActions}>
          <TouchableOpacity onPress={handleShare} style={s.actionBtn}>
            <Text style={s.actionBtnText}>Share ↗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleFavorite}
            style={[s.actionBtn, favorited && s.actionBtnActive]}
          >
            <Text style={[s.actionBtnText, favorited && s.actionBtnTextActive]}>
              {favorited ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        style={{ opacity: fade }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroType}>{fragrance.type}</Text>
          <Text style={s.heroName}>{fragrance.name}</Text>
          <Text style={s.heroHouse}>{fragrance.house}</Text>
        </View>

        {/* Longevity */}
        <View style={s.section}>
          <View style={s.longevityRow}>
            <Text style={s.label}>Longevity</Text>
            <Stars count={fragrance.longevity} />
            <Text style={s.longevityText}>{longevityLabels[fragrance.longevity]}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Note pyramid */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Note Pyramid</Text>
          <View style={s.pyramidViz}>
            {[['Top', fragrance.topNotes], ['Heart', fragrance.heartNotes], ['Base', fragrance.baseNotes]].map(([tier, notes], i) => (
              <View key={tier} style={[s.pyramidRow, { paddingHorizontal: (2 - i) * 16 }]}>
                <View style={s.pyramidBar}>
                  <Text style={s.pyramidTier}>{tier}</Text>
                  <Text style={s.pyramidNotes}>{notes}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={s.divider} />

        {/* Main accords */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Main Accords</Text>
          {fragrance.accords.map(a => (
            <View key={a.name} style={s.accordRow}>
              <Text style={s.accordName}>{a.name}</Text>
              <View style={s.accordTrack}>
                <View style={[s.accordFill, { width: `${a.percentage}%` as any }]} />
              </View>
              <Text style={s.accordNum}>{a.percentage}</Text>
            </View>
          ))}
        </View>

        <View style={s.divider} />

        {/* Perfumer's note */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Perfumer's Note</Text>
          <Text style={s.description}>{fragrance.description}</Text>
        </View>

        <View style={s.divider} />

        {/* Where to buy */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Find this fragrance</Text>
          {affiliateLinks.map(link => (
            <TouchableOpacity
              key={link.store}
              style={s.buyRow}
              onPress={() => Linking.openURL(link.url)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={s.buyStore}>{link.store}</Text>
                <Text style={s.buyLabel}>{link.label}</Text>
              </View>
              <Text style={s.buyArrow}>→</Text>
            </TouchableOpacity>
          ))}
          <Text style={s.affiliateNote}>* Affiliate links — Scentia earns a small commission.</Text>
        </View>

        <View style={s.divider} />

        {/* Community reviews */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Community Reviews</Text>
          {fragrance.reviews.map((r, i) => (
            <View key={i} style={[s.review, i < fragrance.reviews.length - 1 && s.reviewBorder]}>
              <View style={s.reviewTop}>
                <Text style={s.reviewer}>{r.reviewer}</Text>
                <Stars count={r.rating} size={9} />
              </View>
              <Text style={s.reviewText}>"{r.text}"</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: colors.cream, borderBottomWidth: 1, borderBottomColor: colors.border },
  closeBtn: { padding: 8 },
  closeBtnText: { fontSize: 16, color: colors.mid },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 14 },
  actionBtnActive: { backgroundColor: colors.black, borderColor: colors.black },
  actionBtnText: { fontSize: 12, color: colors.charcoal },
  actionBtnTextActive: { color: colors.white },
  scroll: { paddingBottom: 40 },
  hero: { padding: spacing.xl, paddingBottom: spacing.lg, backgroundColor: colors.white },
  heroType: { fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: colors.accent, marginBottom: 10 },
  heroName: { fontFamily: 'Georgia', fontSize: 38, color: colors.black, lineHeight: 44, marginBottom: 6 },
  heroHouse: { fontSize: 14, color: colors.mid },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: colors.mid, marginBottom: 16 },
  divider: { height: 1, backgroundColor: colors.border },
  longevityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  label: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: colors.mid },
  longevityText: { fontSize: 12, color: colors.mid, fontStyle: 'italic' },
  // Pyramid
  pyramidViz: { gap: 6 },
  pyramidRow: {},
  pyramidBar: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: spacing.md, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  pyramidTier: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: colors.light, minWidth: 36, paddingTop: 2 },
  pyramidNotes: { flex: 1, fontSize: 13, color: colors.charcoal, fontStyle: 'italic', lineHeight: 18 },
  // Accords
  accordRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  accordName: { fontSize: 12, color: colors.mid, minWidth: 72 },
  accordTrack: { flex: 1, height: 2, backgroundColor: colors.border },
  accordFill: { height: '100%', backgroundColor: colors.black },
  accordNum: { fontFamily: 'Georgia', fontSize: 16, color: colors.mid, minWidth: 30, textAlign: 'right' },
  description: { fontSize: 14, color: colors.mid, lineHeight: 22, fontStyle: 'italic', borderLeftWidth: 2, borderLeftColor: colors.accentLight, paddingLeft: 16 },
  // Buy
  buyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  buyStore: { fontSize: 14, color: colors.charcoal, marginBottom: 2 },
  buyLabel: { fontSize: 11, color: colors.mid },
  buyArrow: { fontSize: 18, color: colors.mid },
  affiliateNote: { fontSize: 10, color: colors.light, marginTop: 10 },
  // Reviews
  review: { paddingVertical: 14 },
  reviewBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewer: { fontSize: 12, color: colors.charcoal },
  reviewText: { fontSize: 13, color: colors.mid, lineHeight: 20, fontStyle: 'italic' },
  // Not found
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  notFoundText: { fontFamily: 'Georgia', fontSize: 20, color: colors.charcoal },
  backLink: { fontSize: 13, color: colors.accent },
});
