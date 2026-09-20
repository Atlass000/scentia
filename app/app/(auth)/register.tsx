// app/(auth)/register.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { registerWithEmail } from '../../src/services/authService';
import { useTheme } from '../../src/hooks/useTheme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors: c } = useTheme();

  async function handleRegister() {
    if (!name || !email || !password) { Toast.show({ type: 'error', text1: 'Please fill in all fields' }); return; }
    if (password.length < 6) { Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' }); return; }
    setLoading(true);
    try {
      await registerWithEmail(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.code === 'auth/email-already-in-use' ? 'Email already registered' : 'Registration failed.' });
    } finally { setLoading(false); }
  }

  const inputStyle = { borderBottomWidth: 1, borderBottomColor: c.border, paddingVertical: 12, fontSize: 15, color: c.black, backgroundColor: 'transparent' };
  const labelStyle = { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' as const, color: c.mid };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 13, color: c.mid }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: c.accent, marginBottom: 12 }}>New account</Text>
          <Text style={{ fontFamily: 'Georgia', fontSize: 34, color: c.black, marginBottom: 48 }}>
            Join{'\n'}<Text style={{ fontStyle: 'italic', color: c.accent }}>Scentia.</Text>
          </Text>
          <View style={{ gap: 24 }}>
            {[
              { label: 'Full Name', val: name, set: setName, ph: 'Your name', type: 'default' as const, secure: false },
              { label: 'Email', val: email, set: setEmail, ph: 'you@example.com', type: 'email-address' as const, secure: false },
              { label: 'Password', val: password, set: setPassword, ph: 'Min. 6 characters', type: 'default' as const, secure: true },
            ].map(f => (
              <View key={f.label} style={{ gap: 8 }}>
                <Text style={labelStyle}>{f.label}</Text>
                <TextInput style={inputStyle} value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor={c.light} keyboardType={f.type} autoCapitalize={f.type === 'email-address' ? 'none' : 'words'} secureTextEntry={f.secure} />
              </View>
            ))}
            <TouchableOpacity style={{ backgroundColor: loading ? c.mid : c.black, paddingVertical: 18, alignItems: 'center', marginTop: 8 }} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color={c.surface} /> : <Text style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: c.surface }}>Create Account →</Text>}
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 13, color: c.mid }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}><Text style={{ fontSize: 13, color: c.accent }}>Sign in</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
