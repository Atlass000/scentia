// app/results.tsx
import { useRef, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFinderStore } from '../src/store';
import FragranceCard from '../src/components/fragrance/FragranceCard';
import { useTheme } from '../src/hooks/useTheme';

export default function ResultsScreen() {
  const { results, reset } = useFinderStore();
  const { colors: c, spacing: sp } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  if (!results.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 22, color: c.charcoal }}>No results found</Text>
          <TouchableOpacity style={{ backgroundColor: c.black, paddingVertical: 16, paddingHorizontal: 40 }} onPress={() => router.back()}>
            <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.surface }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <Animated.ScrollView style={{ opacity: fade }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        <View style={{ padding: sp.lg, backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: sp.md }}>
            <Text style={{ fontSize: 13, color: c.mid }}>← Refine</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 10 }}>Your Matches</Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 28, color: c.black }}>
            Curated <Text style={{ fontStyle: 'italic', color: c.accent }}>for you.</Text>
          </Text>
        </View>

        <Text style={{ fontSize: 11, color: c.mid, letterSpacing: 1, padding: sp.lg, paddingBottom: sp.md }}>
          {results.length} fragrance{results.length !== 1 ? 's' : ''} matched your profile
        </Text>

        <View style={{ paddingHorizontal: sp.lg, gap: 12 }}>
          {results.map((frag, i) => (
            <TouchableOpacity key={i} onPress={() => router.push(`/fragrance/${i}` as any)} activeOpacity={0.95}>
              <FragranceCard fragrance={frag} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={{ margin: sp.lg, marginTop: sp.xl, borderWidth: 1, borderColor: c.border, paddingVertical: 16, alignItems: 'center' }}
          onPress={() => { reset(); router.replace('/(tabs)/finder'); }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: c.mid }}>Start New Search</Text>
        </TouchableOpacity>

      </Animated.ScrollView>
    </SafeAreaView>
  );
}
