// src/components/common/Skeleton.tsx
import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: object;
}

export function SkeletonBox({ width = '100%', height = 16, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] });

  return (
    <Animated.View
      style={[
        { width: width as any, height, backgroundColor: colors.border },
        { opacity },
        style,
      ]}
    />
  );
}

export function FragranceCardSkeleton() {
  return (
    <View style={sk.card}>
      <SkeletonBox width={60} height={9} style={{ marginBottom: 10 }} />
      <SkeletonBox width="70%" height={24} style={{ marginBottom: 6 }} />
      <SkeletonBox width="40%" height={14} style={{ marginBottom: 24 }} />
      <View style={sk.row}>
        <SkeletonBox width={60} height={11} />
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[1,2,3,4,5].map(i => <SkeletonBox key={i} width={11} height={11} />)}
        </View>
      </View>
      <View style={{ marginTop: 20, gap: 10 }}>
        <SkeletonBox height={2} />
        <SkeletonBox height={2} width="80%" />
        <SkeletonBox height={2} width="60%" />
      </View>
      <View style={{ marginTop: 20, gap: 10 }}>
        <SkeletonBox height={56} />
      </View>
    </View>
  );
}

export function HomeSkeletons() {
  return (
    <View style={{ padding: 20, gap: 12 }}>
      <SkeletonBox height={200} />
      <View style={{ flexDirection: 'row', gap: 1 }}>
        {[1,2,3].map(i => <SkeletonBox key={i} style={{ flex: 1 }} height={80} />)}
      </View>
      <FragranceCardSkeleton />
      <FragranceCardSkeleton />
    </View>
  );
}

const sk = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
