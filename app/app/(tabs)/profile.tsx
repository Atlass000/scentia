// app/(tabs)/profile.tsx
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore, useFavoritesStore } from '../../src/store';
import { logout } from '../../src/services/authService';
import { registerForPushNotifications, disablePushNotifications } from '../../src/services/notificationService';
import { useTheme } from '../../src/hooks/useTheme';

export default function ProfileScreen() {
  const { user, profile, clear } = useAuthStore();
  const { favorites } = useFavoritesStore();
  const { colors: c, spacing: sp, isDark } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [togglingPush, setTogglingPush] = useState(false);

  useEffect(() => {
    setPushEnabled((profile as any)?.pushEnabled ?? false);
  }, [profile]);

  async function handleLogout() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => { await logout(); clear(); },
      },
    ]);
  }

  async function handleTogglePush(value: boolean) {
    if (!user) return;
    setTogglingPush(true);
    try {
      if (value) {
        const token = await registerForPushNotifications(user.uid);
        setPushEnabled(!!token);
        if (!token) {
          Alert.alert('Permission needed', 'Please enable notifications in your device settings.');
        }
      } else {
        await disablePushNotifications(user.uid);
        setPushEnabled(false);
      }
    } catch {
      Alert.alert('Error', 'Could not update notification settings.');
    } finally {
      setTogglingPush(false);
    }
  }

  const isPremium = profile?.subscription === 'premium';
  const isEssential = profile?.subscription === 'essential';
  const hasPlan = isPremium || isEssential;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[s.block, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 10 }}>
            Account
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 26, color: c.black, marginBottom: 4 }}>
            {profile?.displayName || 'Your Profile'}
          </Text>
          <Text style={{ fontSize: 12, color: c.mid }}>{user?.email}</Text>
        </View>

        {/* Stats row */}
        <View style={[s.statsRow, { marginHorizontal: sp.lg, marginTop: sp.lg, backgroundColor: c.border }]}>
          {[
            [String(profile?.favoritesCount ?? 0), 'Saved'],
            [String(profile?.searchCount ?? 0), 'Searches'],
            [hasPlan ? '★' : 'Free', 'Plan'],
          ].map(([num, lbl]) => (
            <View key={lbl} style={[s.statBox, { backgroundColor: c.surface }]}>
              <Text style={{ fontFamily: 'Georgia', fontSize: 24, color: c.black, marginBottom: 4 }}>{num}</Text>
              <Text style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: c.light }}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* Premium upsell or active badge */}
        {!hasPlan ? (
          <TouchableOpacity
            style={[s.premiumBanner, { margin: sp.lg, backgroundColor: isDark ? '#1c1c1a' : c.black }]}
            onPress={() => router.push('/checkout')}
            activeOpacity={0.9}
          >
            <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accentLight, marginBottom: 10 }}>
              Premium
            </Text>
            <Text style={{ fontFamily: 'Georgia', fontSize: 18, color: isDark ? c.black : '#ffffff', marginBottom: 16, lineHeight: 25 }}>
              Unlock unlimited searches{'\n'}and exclusive catalog
            </Text>
            <Text style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: isDark ? c.mid : 'rgba(255,255,255,0.5)' }}>
              Upgrade for $9.99/mo →
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[s.activeBadge, { margin: sp.lg, borderColor: c.accentLight }]}>
            <Text style={{ fontSize: 12, color: c.accent, letterSpacing: 1 }}>
              ✦ {isPremium ? 'Premium' : 'Essential'} Active
            </Text>
            <Text style={{ fontSize: 12, color: c.mid, marginTop: 4 }}>
              {isPremium ? 'Unlimited searches · Full catalog' : '20 searches/month · Unlimited favorites'}
            </Text>
          </View>
        )}

        {/* Settings menu */}
        <View style={[s.menu, { backgroundColor: c.surface, borderColor: c.border }]}>

          {/* Push notifications toggle */}
          <View style={[s.menuItem, { borderBottomColor: c.border }]}>
            <Text style={{ fontSize: 14, color: c.mid, marginRight: 14, width: 20, textAlign: 'center' }}>◎</Text>
            <Text style={{ flex: 1, fontSize: 13, color: c.charcoal }}>Push Notifications</Text>
            <Switch
              value={pushEnabled}
              onValueChange={handleTogglePush}
              disabled={togglingPush}
              trackColor={{ false: c.border, true: c.black }}
              thumbColor={c.surface}
              ios_backgroundColor={c.border}
            />
          </View>

          {/* Dark mode info */}
          <View style={[s.menuItem, { borderBottomColor: c.border }]}>
            <Text style={{ fontSize: 14, color: c.mid, marginRight: 14, width: 20, textAlign: 'center' }}>
              {isDark ? '◑' : '◐'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: c.charcoal }}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={{ fontSize: 11, color: c.mid, marginTop: 2 }}>Follows system settings</Text>
            </View>
          </View>

          {/* Static menu items */}
          {[
            { icon: '◷', label: 'Search History', onPress: () => {} },
            { icon: '◈', label: 'Privacy Policy', onPress: () => router.push('/privacy') },
            { icon: '◉', label: 'Terms of Service', onPress: () => {} },
            { icon: '◌', label: 'Contact Support', onPress: () => {} },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[s.menuItem, { borderBottomColor: c.border }, i === arr.length - 1 && { borderBottomWidth: 0 }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 14, color: c.mid, marginRight: 14, width: 20, textAlign: 'center' }}>{item.icon}</Text>
              <Text style={{ flex: 1, fontSize: 13, color: c.charcoal }}>{item.label}</Text>
              <Text style={{ fontSize: 14, color: c.light }}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[s.logoutBtn, { margin: sp.lg, borderColor: c.border }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: c.mid }}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', fontSize: 11, color: c.light, marginBottom: 40 }}>
          Scentia v1.0.0
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  block: { padding: 24, borderBottomWidth: 1 },
  statsRow: { flexDirection: 'row', gap: 1 },
  statBox: { flex: 1, paddingVertical: 20, alignItems: 'center' },
  premiumBanner: { padding: 28 },
  activeBadge: { borderWidth: 1, padding: 16 },
  menu: { marginTop: 20, borderTopWidth: 1, borderBottomWidth: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  logoutBtn: { borderWidth: 1, paddingVertical: 16, alignItems: 'center' },
});
