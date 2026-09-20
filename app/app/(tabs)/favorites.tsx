// app/(tabs)/favorites.tsx
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, useFavoritesStore } from '../../src/store';
import { getFavorites } from '../../src/services/fragranceService';
import { useTheme } from '../../src/hooks/useTheme';
import FragranceCard from '../../src/components/fragrance/FragranceCard';

export default function FavoritesScreen() {
  const { user } = useAuthStore();
  const { favorites, setFavorites } = useFavoritesStore();
  const { colors: c, spacing: sp } = useTheme();

  const { isLoading, refetch } = useQuery({
    queryKey: ['favorites', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const data = await getFavorites(user.uid);
      setFavorites(data);
      return data;
    },
    enabled: !!user,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <View style={[s.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 10 }}>
          Your Collection
        </Text>
        <Text style={{ fontFamily: 'Georgia', fontSize: 28, color: c.black }}>
          Saved{'\n'}<Text style={{ fontStyle: 'italic', color: c.accent }}>fragrances.</Text>
        </Text>
      </View>

      {favorites.length === 0 && !isLoading ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 40, color: c.light, marginBottom: sp.lg }}>♡</Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 22, color: c.charcoal, marginBottom: 10 }}>
            No favorites yet
          </Text>
          <Text style={{ fontSize: 13, color: c.mid, textAlign: 'center', lineHeight: 20 }}>
            Discover fragrances and save the ones that speak to you.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id || item.name}
          renderItem={({ item }) => <FragranceCard fragrance={item} showRemove />}
          contentContainerStyle={{ padding: sp.lg, gap: 12 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { padding: 24, borderBottomWidth: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
});
