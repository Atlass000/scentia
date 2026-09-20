// src/components/common/SearchLoader.tsx
import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing, typography } from '../../theme';

const MESSAGES = [
  'Reading your scent profile…',
  'Consulting the fragrance archive…',
  'Matching notes to your soul…',
  'Curating your collection…',
  'Almost ready…',
];

export default function SearchLoader() {
  const spin = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const msgFade = useRef(new Animated.Value(1)).current;
  const msgIndex = useRef(0);
  const msgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Rotating ring
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Fade in
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Cycle messages
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(msgFade, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(msgFade, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      msgIndex.current = (msgIndex.current + 1) % MESSAGES.length;
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[s.container, { opacity: fade }]}>
      {/* Outer decorative circles */}
      <View style={s.circleOuter} />
      <View style={s.circleMiddle} />

      {/* Spinning ring */}
      <Animated.View style={[s.spinRing, { transform: [{ rotate }] }]} />

      {/* Center logo */}
      <View style={s.logoCenter}>
        <Text style={s.logoS}>S</Text>
      </View>

      {/* Message */}
      <Animated.Text style={[s.message, { opacity: msgFade }]}>
        {MESSAGES[msgIndex.current]}
      </Animated.Text>

      {/* Bottom note dots */}
      <View style={s.noteDots}>
        {['Rose', 'Oud', 'Musk', 'Iris', 'Amber'].map((note, i) => (
          <NoteOrb key={note} label={note} delay={i * 180} />
        ))}
      </View>
    </Animated.View>
  );
}

function NoteOrb({ label, delay }: { label: string; delay: number }) {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, delay, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[s.noteOrb, { opacity: pulse }]}>
      <Text style={s.noteOrbText}>{label}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream, paddingHorizontal: spacing.xl },
  circleOuter: { position: 'absolute', width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  circleMiddle: { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  spinRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: colors.black, borderTopColor: 'transparent', borderRightColor: 'transparent' },
  logoCenter: { width: 64, height: 64, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  logoS: { fontFamily: 'Georgia', fontSize: 32, color: colors.white, fontStyle: 'italic' },
  message: { fontSize: 13, color: colors.mid, letterSpacing: 1, textAlign: 'center', marginBottom: spacing.xxxl },
  noteDots: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  noteOrb: { borderWidth: 1, borderColor: colors.border, paddingVertical: 7, paddingHorizontal: 14 },
  noteOrbText: { fontSize: 11, color: colors.mid, letterSpacing: 1 },
});
