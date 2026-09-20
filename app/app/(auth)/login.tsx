// app/(auth)/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { loginWithEmail } from '../../src/services/authService';
import { useTheme } from '../../src/hooks/useTheme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors: c, spacing: sp } = useTheme();

  async function handleLogin() {
    if (!email || !password) { Toast.show({ type: 'error', text1: 'Please fill in all fields' }); return; }
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.code === 'auth/invalid-credential' ? 'Incorrect email or password' : 'Login failed. Please try again.' });
    } finally { setLoading(false); }
  }

  const inputStyle = { borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 12, fontSize: 15, color: c.black, backgroundColor: 'transparent' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 13, color: c.mid }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 12 }}>Welcome back</Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 34, color: c.black, marginBottom: 48 }}>
            Sign in to{'\n'}<Text style={{ fontStyle: 'italic', color: c.accent }}>Scentia.</Text>
          </Text>
          <View style={{ gap: 24 }}>
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: c.mid }}>Email</Text>
              <TextInput style={inputStyle} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={c.light} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: c.mid }}>Password</Text>
              <TextInput style={inputStyle} value={password} onChangeText={setPassword} placeholder="Your password" placeholderTextColor={c.light} secureTextEntry />
            </View>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot')} style={{ alignSelf: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: c.accent }}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[{ backgroundColor: loading ? c.mid : c.black, paddingVertical: 18, alignItems: 'center' }, { marginTop: 8 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color={c.surface} /> : <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.surface }}>Sign In →</Text>}
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 13, color: c.mid }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}><Text style={{ fontSize: 13, color: c.accent }}>Create one</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
