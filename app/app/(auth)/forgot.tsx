// app/(auth)/forgot.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { resetPassword } from '../../src/services/authService';
import { useTheme } from '../../src/hooks/useTheme';

export default function ForgotScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { colors: c, spacing: sp } = useTheme();

  async function handleReset() {
    if (!email) { Toast.show({ type: 'error', text1: 'Enter your email' }); return; }
    setLoading(true);
    try { await resetPassword(email.trim()); setSent(true); }
    catch { Toast.show({ type: 'error', text1: 'Could not send reset email' }); }
    finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 32 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 13, color: c.mid }}>← Back</Text>
          </TouchableOpacity>

          {sent ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <Text style={{ fontSize: 40, color: c.accent }}>✉</Text>
              <Text style={{ fontFamily: 'Georgia', fontSize: 24, color: c.black }}>Check your inbox</Text>
              <Text style={{ fontSize: 13, color: c.mid, textAlign: 'center', lineHeight: 20 }}>
                We sent a password reset link to {email}
              </Text>
              <TouchableOpacity style={{ backgroundColor: c.black, paddingVertical: 16, paddingHorizontal: 40, marginTop: 16 }} onPress={() => router.replace('/(auth)/login')}>
                <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.surface }}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 12 }}>Password Reset</Text>
              <Text style={{ fontFamily: 'Georgia', fontSize: 34, color: c.black, marginBottom: 16 }}>
                Reset your{'\n'}<Text style={{ fontStyle: 'italic', color: c.accent }}>password.</Text>
              </Text>
              <Text style={{ fontSize: 13, color: c.mid, lineHeight: 20, marginBottom: 36 }}>
                Enter your email and we will send you a reset link.
              </Text>
              <View style={{ gap: 8, marginBottom: 24 }}>
                <Text style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: c.mid }}>Email</Text>
                <TextInput
                  style={{ borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 12, fontSize: 15, color: c.black, backgroundColor: 'transparent' }}
                  value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={c.light} keyboardType="email-address" autoCapitalize="none"
                />
              </View>
              <TouchableOpacity style={{ backgroundColor: loading ? c.mid : c.black, paddingVertical: 18, alignItems: 'center' }} onPress={handleReset} disabled={loading} activeOpacity={0.85}>
                {loading ? <ActivityIndicator color={c.surface} /> : <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.surface }}>Send Reset Link →</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
