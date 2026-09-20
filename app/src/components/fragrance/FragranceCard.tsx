// src/components/fragrance/FragranceCard.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useAuthStore, useFavoritesStore } from '../../store';
import { saveFavorite, removeFavorite } from '../../services/fragranceService';
import { getAffiliateLinks, trackAffiliateClick } from '../../services/affiliateService';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import type { Fragrance } from '../../services/fragranceService';
import { colors, spacing, typography } from '../../theme';

interface Props { fragrance: Fragrance; compact?: boolean; showRemove?: boolean; }

function Stars({ count, size = 10 }: { count: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <View key={i} style={{ width: size, height: size, backgroundColor: i < count ? colors.black : colors.border, transform: [{ rotate: '45deg' }] }} />
      ))}
    </View>
  );
}

export default function FragranceCard({ fragrance, compact = false }: Props) {
  const { user } = useAuthStore();
  const { isFavorite, addFavorite, removeFavorite: removeFromStore, favorites } = useFavoritesStore();
  const { maxFavorites, isPremium } = usePlanLimits();
  const [saving, setSaving] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const favorited = isFavorite(fragrance.name, fragrance.house);
  const affiliateLinks = getAffiliateLinks(fragrance.name, fragrance.house);

  async function handleFavorite() {
    if (!user) { Toast.show({ type: 'info', text1: 'Sign in to save fragrances' }); return; }
    if (!isPremium && !favorited && favorites.length >= maxFavorites) {
      Alert.alert('Limit reached', `Free plan: ${maxFavorites} favorites max.\nUpgrade to Premium for unlimited.`,
        [{ text: 'Later', style: 'cancel' }, { text: 'Upgrade', onPress: () => {} }]);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaving(true);
    try {
      if (favorited && fragrance.id) {
        await removeFavorite(user.uid, fragrance.id);
        removeFromStore(fragrance.id);
        Toast.show({ type: 'success', text1: 'Removed from favorites' });
      } else {
        const id = await saveFavorite(user.uid, fragrance);
        addFavorite({ ...fragrance, id });
        Toast.show({ type: 'success', text1: '♡ Saved to favorites' });
      }
    } catch { Toast.show({ type: 'error', text1: 'Could not save' }); }
    finally { setSaving(false); }
  }

  async function openBuyLink(store: string, url: string) {
    await trackAffiliateClick(fragrance.name, store, user?.uid);
    Linking.openURL(url);
  }

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.type}>{fragrance.type}</Text>
          <Text style={s.name}>{fragrance.name}</Text>
          <Text style={s.house}>{fragrance.house}</Text>
        </View>
        <TouchableOpacity style={[s.heart, favorited && s.heartActive]} onPress={handleFavorite} disabled={saving}>
          <Text style={[s.heartIcon, favorited && s.heartIconActive]}>{favorited ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.longevityRow}>
        <Text style={s.label}>Longevity</Text>
        <Stars count={fragrance.longevity} />
        <Text style={s.longevityWord}>{fragrance.longevityLabel}</Text>
      </View>

      {!compact && <>
        <View style={s.pyramid}>
          <Text style={s.label}>Note Pyramid</Text>
          {[['Top', fragrance.topNotes], ['Heart', fragrance.heartNotes], ['Base', fragrance.baseNotes]].map(([t, n]) => (
            <View key={t} style={s.tier}><Text style={s.tierName}>{t}</Text><Text style={s.tierNotes}>{n}</Text></View>
          ))}
        </View>

        <View style={s.accords}>
          <Text style={s.label}>Main Accords</Text>
          {fragrance.accords.map(a => (
            <View key={a.name} style={s.accordRow}>
              <Text style={s.accordName}>{a.name}</Text>
              <View style={s.accordTrack}><View style={[s.accordFill, { width: `${a.percentage}%` as any }]} /></View>
              <Text style={s.accordNum}>{a.percentage}</Text>
            </View>
          ))}
        </View>

        <Text style={s.desc}>{fragrance.description}</Text>

        {/* ── AFFILIATE BUY BUTTONS ── */}
        <View style={s.buySection}>
          <TouchableOpacity style={s.buyToggle} onPress={() => setShowBuy(v => !v)} activeOpacity={0.85}>
            <Text style={s.buyToggleText}>{showBuy ? '↑ Hide options' : 'Find this fragrance →'}</Text>
          </TouchableOpacity>
          {showBuy && (
            <View style={s.buyList}>
              {affiliateLinks.map(link => (
                <TouchableOpacity key={link.store} style={s.buyItem} onPress={() => openBuyLink(link.store, link.url)} activeOpacity={0.8}>
                  <View>
                    <Text style={s.buyItemLabel}>{link.label}</Text>
                    <Text style={s.buyItemSub}>via {link.store}</Text>
                  </View>
                  <Text style={s.buyArrow}>→</Text>
                </TouchableOpacity>
              ))}
              <Text style={s.disclosure}>* Affiliate links — Scentia earns a small commission at no extra cost to you.</Text>
            </View>
          )}
        </View>

        <View style={s.reviews}>
          <Text style={s.label}>Community Reviews</Text>
          {fragrance.reviews.map((r, i) => (
            <View key={i} style={[s.review, i < fragrance.reviews.length - 1 && s.reviewBorder]}>
              <View style={s.reviewTop}>
                <Text style={s.reviewer}>{r.reviewer}</Text>
                <Stars count={r.rating} size={8} />
              </View>
              <Text style={s.reviewText}>"{r.text}"</Text>
            </View>
          ))}
        </View>
      </>}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  type: { fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: colors.accent, marginBottom: 6 },
  name: { fontFamily: 'Georgia', fontSize: 22, color: colors.black, marginBottom: 2 },
  house: { fontSize: 12, color: colors.mid },
  heart: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  heartActive: { backgroundColor: colors.black, borderColor: colors.black },
  heartIcon: { fontSize: 18, color: colors.mid },
  heartIconActive: { color: colors.white },
  longevityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.md, flexWrap: 'wrap' },
  label: { fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: colors.mid, marginBottom: 10 },
  longevityWord: { fontSize: 11, color: colors.mid, fontStyle: 'italic' },
  pyramid: { marginBottom: spacing.md },
  tier: { flexDirection: 'row', gap: 10, marginBottom: 7 },
  tierName: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: colors.light, minWidth: 38, paddingTop: 2 },
  tierNotes: { flex: 1, fontSize: 12, color: colors.charcoal, fontStyle: 'italic', lineHeight: 18 },
  accords: { marginBottom: spacing.md },
  accordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 9 },
  accordName: { fontSize: 11, color: colors.mid, minWidth: 64 },
  accordTrack: { flex: 1, height: 2, backgroundColor: colors.border },
  accordFill: { height: '100%', backgroundColor: colors.black },
  accordNum: { fontFamily: 'Georgia', fontSize: 14, color: colors.mid, minWidth: 28, textAlign: 'right' },
  desc: { fontSize: 13, color: colors.mid, lineHeight: 20, fontStyle: 'italic', borderLeftWidth: 2, borderLeftColor: colors.accentLight, paddingLeft: 14, marginBottom: spacing.md },
  buySection: { marginBottom: spacing.md },
  buyToggle: { backgroundColor: colors.black, paddingVertical: 14, alignItems: 'center' },
  buyToggleText: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: colors.white },
  buyList: { borderWidth: 1, borderTopWidth: 0, borderColor: colors.border },
  buyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  buyItemLabel: { fontSize: 13, color: colors.charcoal },
  buyItemSub: { fontSize: 11, color: colors.mid, marginTop: 2 },
  buyArrow: { fontSize: 16, color: colors.mid },
  disclosure: { fontSize: 9, color: colors.light, padding: spacing.md, lineHeight: 14 },
  reviews: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  review: { paddingBottom: 12, marginBottom: 12 },
  reviewBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  reviewer: { fontSize: 11, color: colors.charcoal },
  reviewText: { fontSize: 12, color: colors.mid, lineHeight: 18, fontStyle: 'italic' },
});
