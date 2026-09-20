// app/onboarding.tsx
import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/hooks/useTheme';

const { width, height } = Dimensions.get('window');

const NOTE_BUBBLES = [
  { label: 'Oud', x: 0.12, y: 0.28, size: 80 },
  { label: 'Rose', x: 0.58, y: 0.12, size: 62 },
  { label: 'Amber', x: 0.66, y: 0.52, size: 74 },
  { label: 'Vetiver', x: 0.22, y: 0.58, size: 54 },
  { label: 'Bergamot', x: 0.42, y: 0.40, size: 46 },
];

const FAMILIES = [
  { icon: '◈', label: 'Floral', sub: 'Rose, Jasmine, Iris' },
  { icon: '◉', label: 'Woody', sub: 'Oud, Sandalwood, Vetiver' },
  { icon: '◎', label: 'Oriental', sub: 'Amber, Vanilla, Musk' },
  { icon: '○', label: 'Fresh', sub: 'Citrus, Aquatic, Green' },
];

const PREFS = [
  { id: 'niche', label: 'Niche', sub: 'Byredo, Le Labo, Creed\nRare, artisanal, distinctive' },
  { id: 'designer', label: 'Designer', sub: 'Chanel, Dior, Tom Ford\nIconic, accessible, refined' },
  { id: 'both', label: 'Surprise me', sub: 'The best of both worlds' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [families, setFamilies] = useState<string[]>([]);
  const [pref, setPref] = useState<string | null>(null);
  const { colors: c, spacing: sp } = useTheme();
  const fade = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(next: number) {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.97, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  }

  async function handleNext() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 2) { animateTo(step + 1); }
    else {
      await AsyncStorage.setItem('onboarding_done', 'true');
      await AsyncStorage.setItem('onboarding_families', JSON.stringify(families));
      await AsyncStorage.setItem('onboarding_pref', pref || 'both');
      router.replace('/(tabs)');
    }
  }

  const canContinue = step === 0 || (step === 1 && families.length > 0) || (step === 2 && pref !== null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top', 'bottom']}>
      <Animated.View style={{ flex: 1, paddingHorizontal: sp.xl, opacity: fade, transform: [{ scale }] }}>

        {/* Skip */}
        {step < 2 && (
          <TouchableOpacity style={{ alignSelf: 'flex-end', paddingTop: 16, paddingBottom: 8 }} onPress={async () => { await AsyncStorage.setItem('onboarding_done', 'true'); router.replace('/(tabs)'); }}>
            <Text style={{ fontSize: 12, color: c.light, letterSpacing: 1 }}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Progress dots */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: sp.xl, marginTop: step < 2 ? 0 : 24 }}>
          {[0, 1, 2].map(i => (
            <View key={i} style={{ height: 2, backgroundColor: i === step ? c.black : c.border, width: i === step ? 32 : 20 }} />
          ))}
        </View>

        {/* Step number */}
        <Text style={{ fontFamily: 'Georgia', fontSize: 60, color: c.background === '#111110' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)', lineHeight: 60, marginBottom: -8 }}>
          {['01', '02', '03'][step]}
        </Text>

        {/* Titles */}
        {step === 0 && <Text style={{ fontFamily: 'Georgia', fontSize: 34, color: c.black, lineHeight: 40, marginBottom: 12 }}>The art of{'\n'}personal scent.</Text>}
        {step === 1 && <Text style={{ fontFamily: 'Georgia', fontSize: 34, color: c.black, lineHeight: 40, marginBottom: 12 }}>Choose your{'\n'}notes.</Text>}
        {step === 2 && <Text style={{ fontFamily: 'Georgia', fontSize: 34, color: c.black, lineHeight: 40, marginBottom: 12 }}>Niche or{'\n'}designer?</Text>}

        <Text style={{ fontSize: 14, color: c.mid, lineHeight: 22, marginBottom: sp.xl }}>
          {step === 0 && 'Scentia learns what moves you — and finds fragrances that speak your language.'}
          {step === 1 && 'Select the scent families that resonate with you.'}
          {step === 2 && 'Tell us which world you prefer — or let Scentia surprise you with both.'}
        </Text>

        {/* Step 1 — bubbles */}
        {step === 0 && (
          <View style={{ height: height * 0.28, position: 'relative', marginBottom: sp.lg }}>
            {NOTE_BUBBLES.map(b => (
              <View key={b.label} style={{
                position: 'absolute', left: b.x * (width - 80), top: b.y * (height * 0.26),
                width: b.size, height: b.size, borderRadius: b.size / 2,
                borderWidth: 1, borderColor: c.border, backgroundColor: c.surface,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: b.size > 65 ? 13 : 11, color: c.charcoal }}>{b.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Step 2 — family grid */}
        {step === 1 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: sp.lg }}>
            {FAMILIES.map(f => {
              const sel = families.includes(f.label);
              return (
                <TouchableOpacity
                  key={f.label}
                  style={{ width: '47%', borderWidth: 1, borderColor: sel ? c.black : c.border, padding: 18, backgroundColor: sel ? c.black : c.surface }}
                  onPress={() => { Haptics.selectionAsync(); setFamilies(prev => prev.includes(f.label) ? prev.filter(x => x !== f.label) : [...prev, f.label]); }}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontSize: 20, color: sel ? c.surface : c.light, marginBottom: 8 }}>{f.icon}</Text>
                  <Text style={{ fontFamily: 'Georgia', fontSize: 16, color: sel ? c.surface : c.charcoal, marginBottom: 4 }}>{f.label}</Text>
                  <Text style={{ fontSize: 11, color: sel ? 'rgba(255,255,255,0.5)' : c.light, lineHeight: 16 }}>{f.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Step 3 — pref list */}
        {step === 2 && (
          <View style={{ gap: 10, marginBottom: sp.lg }}>
            {PREFS.map(opt => {
              const sel = pref === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={{ flexDirection: 'row', alignItems: 'center', borderWidth: sel ? 2 : 1, borderColor: sel ? c.black : c.border, padding: 20, backgroundColor: c.surface }}
                  onPress={() => { Haptics.selectionAsync(); setPref(opt.id); }}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Georgia', fontSize: 18, color: sel ? c.black : c.charcoal, marginBottom: 4 }}>{opt.label}</Text>
                    <Text style={{ fontSize: 12, color: c.mid, lineHeight: 18 }}>{opt.sub}</Text>
                  </View>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: sel ? c.black : c.border, alignItems: 'center', justifyContent: 'center' }}>
                    {sel && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.black }} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* CTA */}
        <View style={{ marginTop: 'auto', paddingBottom: sp.xl }}>
          <TouchableOpacity
            style={{ backgroundColor: canContinue ? c.black : c.light, paddingVertical: 18, alignItems: 'center' }}
            onPress={handleNext}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.surface }}>
              {step === 2 ? 'Enter Scentia →' : 'Continue →'}
            </Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}
