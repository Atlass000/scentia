// src/components/common/NetworkError.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  onRetry?: () => void;
  message?: string;
}

export default function NetworkError({ onRetry, message }: Props) {
  const { colors: c } = useTheme();
  return (
    <View style={[s.container, { backgroundColor: c.background }]}>
      <Text style={[s.icon, { color: c.light }]}>◌</Text>
      <Text style={[s.title, { color: c.black }]}>No connection</Text>
      <Text style={[s.sub, { color: c.mid }]}>
        {message || 'Check your internet connection and try again.'}
      </Text>
      {onRetry && (
        <TouchableOpacity style={[s.btn, { backgroundColor: c.black }]} onPress={onRetry} activeOpacity={0.85}>
          <Text style={[s.btnText, { color: c.surface }]}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  icon: { fontSize: 52, marginBottom: 24 },
  title: { fontFamily: 'Georgia', fontSize: 24, marginBottom: 12 },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 40, maxWidth: 280 },
  btn: { paddingVertical: 16, paddingHorizontal: 48 },
  btnText: { fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' },
});
