// app/privacy.tsx
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../src/hooks/useTheme';

const SECTIONS = [
  { title: 'Information We Collect', body: 'We collect information you provide when creating an account (name, email) and information generated through your use of the app (searches, favorites, subscription status). We do not collect precise location data or contacts.' },
  { title: 'How We Use Your Information', body: 'Your information is used to provide and personalize the Scentia service, process subscription payments via Stripe, generate AI fragrance recommendations, and improve our algorithms. We do not sell your personal information to third parties.' },
  { title: 'AI Recommendations', body: 'Fragrance recommendations are generated using the Anthropic Claude API. Your search parameters are sent to Anthropic\'s servers to generate recommendations. We do not send personally identifiable information with these requests.' },
  { title: 'Affiliate Links', body: 'Scentia participates in affiliate programs including Amazon Associates. When you click a purchase link and make a purchase, we may earn a commission at no additional cost to you. This does not affect which fragrances we recommend.' },
  { title: 'Payment Information', body: 'Subscription payments are processed by Stripe. Scentia does not store your credit card information. Please review Stripe\'s privacy policy at stripe.com/privacy.' },
  { title: 'Data Retention', body: 'Your account data is retained as long as your account is active. You may delete your account at any time from the Profile screen. Upon deletion, your personal data is permanently removed within 30 days.' },
  { title: 'Third-Party Services', body: 'Scentia uses Firebase (Google) for authentication and database, Anthropic for AI recommendations, and Stripe for payment processing. Each service has its own privacy policy.' },
  { title: 'Contact', body: 'For privacy questions: privacy@scentia.app' },
];

export default function PrivacyScreen() {
  const { colors: c, spacing: sp } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <View style={{ padding: sp.lg, backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: sp.md }}>
          <Text style={{ fontSize: 13, color: c.mid }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 10 }}>Legal</Text>
        <Text style={{ fontFamily: 'Georgia', fontSize: 26, color: c.black, marginBottom: 4 }}>Privacy Policy</Text>
        <Text style={{ fontSize: 11, color: c.light }}>Last updated: January 2025</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: sp.lg }}>
        <Text style={{ fontSize: 14, color: c.mid, lineHeight: 22, marginBottom: sp.xl, fontStyle: 'italic' }}>
          Scentia is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.
        </Text>
        {SECTIONS.map(sec => (
          <View key={sec.title} style={{ marginBottom: sp.xl, paddingBottom: sp.xl, borderBottomWidth: 1, borderBottomColor: c.border }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: 18, color: c.black, marginBottom: 12 }}>{sec.title}</Text>
            <Text style={{ fontSize: 13, color: c.mid, lineHeight: 22 }}>{sec.body}</Text>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
