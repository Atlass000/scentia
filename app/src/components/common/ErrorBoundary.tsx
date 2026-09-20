// src/components/common/ErrorBoundary.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={s.container}>
        <Text style={s.icon}>◎</Text>
        <Text style={s.title}>Something went wrong</Text>
        <Text style={s.sub}>An unexpected error occurred. Please try again.</Text>
        <TouchableOpacity
          style={s.btn}
          onPress={() => { this.setState({ hasError: false }); router.replace('/(tabs)'); }}
          activeOpacity={0.85}
        >
          <Text style={s.btnText}>GO HOME</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#faf9f7' },
  icon: { fontSize: 48, color: '#c8c4bc', marginBottom: 24 },
  title: { fontFamily: 'Georgia', fontSize: 26, color: '#0a0a0a', marginBottom: 12 },
  sub: { fontSize: 14, color: '#6b6b6b', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  btn: { backgroundColor: '#0a0a0a', paddingVertical: 16, paddingHorizontal: 48 },
  btnText: { fontSize: 11, letterSpacing: 3, color: '#fff' },
});
