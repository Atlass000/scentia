// app/(tabs)/finder.tsx
import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useFinderStore, useAuthStore } from '../../src/store';
import { findFragrances } from '../../src/services/aiService';
import { saveSearchHistory } from '../../src/services/fragranceService';
import { NOTE_CATEGORIES, INTENSITY_DIMENSIONS } from '../../src/services/aiService';
import { usePlanLimits } from '../../src/hooks/usePlanLimits';
import SearchLoader from '../../src/components/common/SearchLoader';
import { colors, spacing, typography } from '../../src/theme';

export default function FinderScreen() {
  const [openCategory, setOpenCategory] = useState<string | null>('floral');
  const { selectedNotes, intensities, preference, season, toggleNote, setIntensity, setPreference, setSeason, setResults, setSearching, isSearching, getSearchParams } = useFinderStore();
  const { user } = useAuthStore();
  const { canSearch, searchesLeft, isPremium } = usePlanLimits();

  async function handleFind() {
    if (!canSearch) {
      Alert.alert(
        'Search limit reached',
        isPremium ? 'Daily limit reached. Try again tomorrow.' : `You have used all ${3} free searches this month.\nUpgrade to Essential ($4.99/mo) for 20 searches.`,
        [{ text: 'Later', style: 'cancel' }, { text: 'Upgrade', onPress: () => router.push('/checkout') }]
      );
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSearching(true);
    try {
      const params = getSearchParams();
      const results = await findFragrances(params);
      setResults(results);
      if (user) await saveSearchHistory(user.uid, params, results);
      router.push('/results');
    } catch (e: any) {
      const msg = e?.message?.includes('limit') ? e.message : 'Something went wrong. Please try again.';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setSearching(false);
    }
  }

  if (isSearching) return <SearchLoader />;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.eyebrow}>Fragrance Finder</Text>
          <Text style={s.title}>Compose your{'\n'}<Text style={s.italic}>signature.</Text></Text>
          {!isPremium && (
            <TouchableOpacity style={s.limitBadge} onPress={() => router.push('/checkout')}>
              <Text style={s.limitText}>{searchesLeft} free search{searchesLeft !== 1 ? 'es' : ''} left this month · Upgrade →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Step 1 */}
        <View style={s.step}>
          <View style={s.stepHead}><Text style={s.stepNum}>01</Text><View><Text style={s.stepTitle}>Choose Notes</Text><Text style={s.stepSub}>Tap to select what you love</Text></View></View>
          {NOTE_CATEGORIES.map(cat => (
            <View key={cat.id}>
              <TouchableOpacity style={s.catRow} onPress={() => setOpenCategory(openCategory === cat.id ? null : cat.id)} activeOpacity={0.7}>
                <Text style={s.catLabel}>{cat.emoji}  {cat.label}</Text>
                <Text style={s.catArrow}>{openCategory === cat.id ? '↑' : '↓'}</Text>
              </TouchableOpacity>
              {openCategory === cat.id && (
                <View style={s.noteGrid}>
                  {cat.notes.map(note => {
                    const sel = selectedNotes.includes(note);
                    return (
                      <TouchableOpacity key={note} style={[s.chip, sel && s.chipSel]} onPress={() => { toggleNote(note); Haptics.selectionAsync(); }} activeOpacity={0.8}>
                        <Text style={[s.chipText, sel && s.chipTextSel]}>{note}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          ))}
          {selectedNotes.length > 0 && (
            <View style={s.selRow}>
              <Text style={s.selCount}>{selectedNotes.length} selected</Text>
              <Text style={s.selList}>{selectedNotes.slice(0, 5).join(' · ')}{selectedNotes.length > 5 ? ` +${selectedNotes.length - 5}` : ''}</Text>
            </View>
          )}
        </View>

        {/* Step 2 */}
        <View style={s.step}>
          <View style={s.stepHead}><Text style={s.stepNum}>02</Text><View><Text style={s.stepTitle}>Set Intensity</Text><Text style={s.stepSub}>Dial in the character</Text></View></View>
          {INTENSITY_DIMENSIONS.map(dim => (
            <View key={dim.id} style={s.sliderRow}>
              <View style={s.sliderTop}><Text style={s.sliderLabel}>{dim.label}</Text><Text style={s.sliderVal}>{intensities[dim.id] ?? 5}</Text></View>
              <View style={s.sliderTrackWrap}>
                <Text style={s.sliderEnd}>{dim.low}</Text>
                <View style={s.sliderTrack}>
                  <View style={[s.sliderFill, { width: `${((intensities[dim.id] ?? 5) - 1) / 9 * 100}%` as any }]} />
                </View>
                <Text style={s.sliderEnd}>{dim.high}</Text>
              </View>
              <View style={s.sliderBtns}>
                {[1,2,3,4,5,6,7,8,9,10].map(v => (
                  <TouchableOpacity key={v} style={[s.sliderBtn, (intensities[dim.id] ?? 5) === v && s.sliderBtnSel]} onPress={() => setIntensity(dim.id, v)}>
                    <Text style={[s.sliderBtnText, (intensities[dim.id] ?? 5) === v && s.sliderBtnTextSel]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Step 3 */}
        <View style={s.step}>
          <View style={s.stepHead}><Text style={s.stepNum}>03</Text><View><Text style={s.stepTitle}>Preferences</Text><Text style={s.stepSub}>Fine-tune your match</Text></View></View>
          <Text style={s.prefLabel}>Type</Text>
          <View style={s.chipRow}>
            {(['both', 'niche', 'designer'] as const).map(p => (
              <TouchableOpacity key={p} style={[s.chip, preference === p && s.chipSel]} onPress={() => setPreference(p)} activeOpacity={0.8}>
                <Text style={[s.chipText, preference === p && s.chipTextSel]}>{p === 'both' ? 'Both' : p === 'niche' ? 'Niche Only' : 'Designer'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[s.prefLabel, { marginTop: spacing.lg }]}>Season</Text>
          <View style={s.chipRow}>
            {(['any', 'spring', 'summer', 'autumn', 'winter'] as const).map(ss => (
              <TouchableOpacity key={ss} style={[s.chip, season === ss && s.chipSel]} onPress={() => setSeason(ss)} activeOpacity={0.8}>
                <Text style={[s.chipText, season === ss && s.chipTextSel]}>{ss === 'any' ? 'All' : ss.charAt(0).toUpperCase() + ss.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.findWrap}>
          <TouchableOpacity style={[s.findBtn, !canSearch && s.findBtnOff]} onPress={handleFind} activeOpacity={0.85}>
            <Text style={s.findBtnText}>Discover My Fragrances →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 60 },
  header: { padding: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  eyebrow: { ...typography.label, color: colors.accent, marginBottom: 10 },
  title: { fontFamily: 'Georgia', fontSize: 30, color: colors.black },
  italic: { fontStyle: 'italic', color: colors.accent },
  limitBadge: { marginTop: 12, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start' },
  limitText: { fontSize: 11, color: colors.mid },
  step: { marginTop: 1, backgroundColor: colors.white, padding: spacing.lg },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  stepNum: { fontFamily: 'Georgia', fontSize: 40, color: 'rgba(0,0,0,0.06)', lineHeight: 44 },
  stepTitle: { fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: colors.charcoal },
  stepSub: { fontSize: 12, color: colors.mid, marginTop: 2 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  catLabel: { fontSize: 12, letterSpacing: 1, color: colors.charcoal },
  catArrow: { fontSize: 14, color: colors.light },
  noteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 14 },
  chip: { borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 14 },
  chipSel: { backgroundColor: colors.black, borderColor: colors.black },
  chipText: { fontSize: 12, color: colors.mid },
  chipTextSel: { color: colors.white },
  selRow: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  selCount: { ...typography.label, color: colors.accent, marginBottom: 6 },
  selList: { fontSize: 12, color: colors.mid, lineHeight: 18 },
  sliderRow: { marginBottom: spacing.xl },
  sliderTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sliderLabel: { fontSize: 12, color: colors.charcoal },
  sliderVal: { fontFamily: 'Georgia', fontSize: 18, color: colors.charcoal },
  sliderTrackWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sliderTrack: { flex: 1, height: 2, backgroundColor: colors.border, overflow: 'hidden' },
  sliderFill: { height: '100%', backgroundColor: colors.black },
  sliderEnd: { fontSize: 10, color: colors.light, minWidth: 30, textAlign: 'center' },
  sliderBtns: { flexDirection: 'row', gap: 4 },
  sliderBtn: { flex: 1, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  sliderBtnSel: { backgroundColor: colors.black, borderColor: colors.black },
  sliderBtnText: { fontSize: 10, color: colors.mid },
  sliderBtnTextSel: { color: colors.white },
  prefLabel: { ...typography.label, color: colors.mid, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  findWrap: { margin: spacing.lg },
  findBtn: { backgroundColor: colors.black, paddingVertical: 18, alignItems: 'center' },
  findBtnOff: { backgroundColor: colors.mid },
  findBtnText: { ...typography.label, color: colors.white, letterSpacing: 3 },
});
