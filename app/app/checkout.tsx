// app/checkout.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';
import { PLANS, createSubscription } from '../src/services/paymentService';
import { useTheme } from '../src/hooks/useTheme';

export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selected, setSelected] = useState('premium_monthly');
  const [loading, setLoading] = useState(false);
  const { colors: c, spacing: sp } = useTheme();
  const plan = PLANS.find(p => p.id === selected)!;

  async function handleSubscribe() {
    setLoading(true);
    try {
      const { clientSecret } = await createSubscription(plan.stripePriceId);
      const { error: initErr } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Scentia',
        style: 'alwaysLight',
        appearance: {
          colors: { primary: '#0a0a0a', background: '#faf9f7', componentBackground: '#ffffff', componentText: '#0a0a0a', placeholderText: '#c8c4bc' },
          shapes: { borderRadius: 0, borderWidth: 1 },
        },
      });
      if (initErr) throw initErr;
      const { error: presentErr } = await presentPaymentSheet();
      if (presentErr) { if (presentErr.code !== 'Canceled') Toast.show({ type: 'error', text1: presentErr.message }); return; }
      Toast.show({ type: 'success', text1: `✦ Welcome to ${plan.name}!` });
      router.replace('/(tabs)');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Payment failed', text2: e.message });
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: sp.xl, paddingBottom: 60 }}>
        <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 8, marginBottom: sp.lg }} onPress={() => router.back()}>
          <Text style={{ fontSize: 16, color: c.mid }}>✕</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 12 }}>Upgrade</Text>
        <Text style={{ fontFamily: 'Georgia', fontSize: 34, color: c.black, marginBottom: sp.xl }}>
          Choose your{'\n'}<Text style={{ fontStyle: 'italic', color: c.accent }}>plan.</Text>
        </Text>

        <View style={{ gap: 10, marginBottom: sp.xl }}>
          {PLANS.map(p => {
            const isSel = selected === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[s.plan, { backgroundColor: c.surface, borderColor: isSel ? c.black : c.border, borderWidth: isSel ? 2 : 1 }]}
                onPress={() => setSelected(p.id)}
                activeOpacity={0.9}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Text style={{ fontSize: 14, color: isSel ? c.black : c.charcoal, flex: 1 }}>{p.name}</Text>
                  {p.highlight && (
                    <View style={{ backgroundColor: c.black, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 9, color: c.surface, letterSpacing: 1, textTransform: 'uppercase' }}>Popular</Text>
                    </View>
                  )}
                  {(p as any).badge && (
                    <View style={{ backgroundColor: c.accentLight, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 9, color: c.accentDark, letterSpacing: 1, textTransform: 'uppercase' }}>{(p as any).badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontFamily: 'Georgia', fontSize: 22, color: isSel ? c.black : c.mid, marginBottom: 4 }}>
                  ${(p.price / 100).toFixed(2)}{p.id.includes('yearly') ? ' / year' : ' / month'}
                </Text>
                <Text style={{ fontSize: 12, color: c.mid }}>{p.description}</Text>
                {isSel && (
                  <View style={[s.checkmark, { backgroundColor: c.black }]}>
                    <Text style={{ color: c.surface, fontSize: 11 }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={{ backgroundColor: loading ? c.mid : c.black, paddingVertical: 18, alignItems: 'center', marginBottom: 14 }}
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color={c.surface} /> : (
            <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.surface }}>
              Subscribe — ${(plan.price / 100).toFixed(2)}{plan.id.includes('yearly') ? '/yr' : '/mo'} →
            </Text>
          )}
        </TouchableOpacity>

        <Text style={{ fontSize: 10, color: c.light, textAlign: 'center', lineHeight: 16 }}>
          Cancel anytime. Billed via Stripe. By subscribing you agree to our Terms of Service.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  plan: { padding: 20, position: 'relative' },
  checkmark: { position: 'absolute', top: 20, right: 20, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
});
