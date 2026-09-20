// app/(auth)/welcome.tsx
import { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';

export default function WelcomeScreen() {
  const { colors: c, spacing: sp } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 900, delay: 200, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 800, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Animated.View style={[s.inner, { opacity: fade, transform: [{ translateY: slideY }] }]}>
        <View style={s.logoRow}>
          <View style={[s.logoMark, { backgroundColor: c.black }]}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 20, color: c.surface, fontStyle: 'italic' }}>S</Text>
          </View>
          <Text style={{ fontSize: 13, letterSpacing: 6, color: c.charcoal, textTransform: 'uppercase' }}>centia</Text>
          <View style={[s.logoDot, { backgroundColor: c.accent }]} />
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 50, color: c.black, lineHeight: 57, marginBottom: 24 }}>
            The Art of{'\n'}Personal{'\n'}<Text style={{ fontStyle: 'italic', color: c.accent }}>Fragrance.</Text>
          </Text>
          <Text style={{ fontSize: 14, color: c.mid, lineHeight: 22 }}>
            Discover your signature scent through intelligent, personalized matching.
          </Text>
        </View>

        <View style={[s.divider, { backgroundColor: c.border }]} />

        <View style={{ gap: 10 }}>
          <TouchableOpacity style={[s.btnFill, { backgroundColor: c.black }]} onPress={() => router.push('/(auth)/register')} activeOpacity={0.85}>
            <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.surface }}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnOutline, { borderColor: c.borderStrong }]} onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
            <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.charcoal }}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 10, color: c.light, textAlign: 'center', marginTop: 16 }}>
          By continuing you agree to our Terms and Privacy Policy.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  inner: { flex: 1, paddingHorizontal: 32, paddingTop: 20, paddingBottom: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logoDot: { width: 5, height: 5, borderRadius: 3, marginLeft: -4 },
  divider: { height: 1, marginVertical: 28 },
  btnFill: { paddingVertical: 18, alignItems: 'center' },
  btnOutline: { paddingVertical: 18, alignItems: 'center', borderWidth: 1 },
});
