// app/referral.tsx
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store';
import { getOrCreateReferralCode, getReferralStats } from '../src/services/referralService';
import { shareReferral } from '../src/services/shareService';
import { trackShare } from '../src/services/analyticsService';
import { haptics } from '../src/utils/haptics';
import { useTheme } from '../src/hooks/useTheme';

export default function ReferralScreen() {
  const { user, profile } = useAuthStore();
  const { colors: c, spacing: sp } = useTheme();
  const [code, setCode] = useState('');
  const [stats, setStats] = useState({ uses: 0, daysEarned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getReferralStats(user.uid).then(data => {
      setCode(data.code);
      setStats({ uses: data.uses, daysEarned: data.daysEarned });
      setLoading(false);
    });
  }, [user]);

  async function handleShare() {
    await haptics.tap();
    await shareReferral(code, profile?.displayName || 'A friend');
    await trackShare('referral');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={[s.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, color: c.mid }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 12 }}>
            Refer a Friend
          </Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 32, color: c.black, lineHeight: 38 }}>
            Share Scentia,{'\n'}<Text style={{ fontStyle: 'italic', color: c.accent }}>earn Premium.</Text>
          </Text>
        </View>

        {/* How it works */}
        <View style={[s.section, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.mid, marginBottom: 24 }}>
            How it works
          </Text>
          {[
            ['◈', 'Share your code', 'Send your unique referral code to friends.'],
            ['◉', 'They join Scentia', 'Your friend signs up and enters your code.'],
            ['✦', 'Both get rewarded', 'You both receive 30 days of Premium free.'],
          ].map(([icon, title, sub]) => (
            <View key={title} style={{ flexDirection: 'row', gap: 20, marginBottom: 24 }}>
              <Text style={{ fontSize: 18, color: c.accent, width: 24, textAlign: 'center', paddingTop: 2 }}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: c.black, marginBottom: 4 }}>{title}</Text>
                <Text style={{ fontSize: 12, color: c.mid, lineHeight: 18 }}>{sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Code */}
        <View style={[s.section, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.mid, marginBottom: 20 }}>
            Your Code
          </Text>
          {loading ? (
            <ActivityIndicator color={c.black} />
          ) : (
            <View style={[s.codeBox, { borderColor: c.border, backgroundColor: c.background }]}>
              <Text style={{ fontFamily: 'Georgia', fontSize: 36, color: c.black, letterSpacing: 8 }}>{code}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[s.shareBtn, { backgroundColor: c.black, marginTop: 20 }]}
            onPress={handleShare}
            disabled={!code}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: c.surface }}>
              Share My Code ↗
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[s.section, { backgroundColor: c.surface }]}>
          <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.mid, marginBottom: 20 }}>
            Your Stats
          </Text>
          <View style={{ flexDirection: 'row', gap: 1, backgroundColor: c.border }}>
            {[
              [String(stats.uses), 'Referrals'],
              [`${stats.daysEarned}d`, 'Days Earned'],
            ].map(([num, lbl]) => (
              <View key={lbl} style={[s.statBox, { backgroundColor: c.surface }]}>
                <Text style={{ fontFamily: 'Georgia', fontSize: 36, color: c.black, marginBottom: 6 }}>{num}</Text>
                <Text style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: c.light }}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { padding: 24, borderBottomWidth: 1 },
  section: { padding: 24, borderBottomWidth: 1, marginTop: 1 },
  codeBox: { borderWidth: 1, padding: 32, alignItems: 'center' },
  shareBtn: { paddingVertical: 18, alignItems: 'center' },
  statBox: { flex: 1, padding: 28, alignItems: 'center' },
});
