// src/components/fragrance/BottleIllustration.tsx
// Minimal SVG parfüm şişesi — her kart için görsel
import Svg, { Rect, Path, Ellipse, Line, G } from 'react-native-svg';
import { View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type BottleStyle = 'tall' | 'round' | 'square' | 'flacon';

interface Props {
  style?: BottleStyle;
  size?: number;
  accentColor?: string;
}

// Minimal geometric bottle shapes — 4 distinct styles
const BOTTLES: Record<BottleStyle, (stroke: string, accent: string, fill: string) => React.ReactNode> = {
  tall: (stroke, accent, fill) => (
    <Svg width="60" height="100" viewBox="0 0 60 100">
      {/* Cap */}
      <Rect x="22" y="4" width="16" height="10" rx="2" fill={stroke} opacity="0.6" />
      {/* Neck */}
      <Rect x="26" y="14" width="8" height="10" fill={stroke} opacity="0.3" />
      {/* Body */}
      <Rect x="10" y="24" width="40" height="64" rx="3" fill={fill} stroke={stroke} strokeWidth="1" opacity="0.9" />
      {/* Label */}
      <Rect x="15" y="36" width="30" height="36" rx="1" fill={accent} opacity="0.15" />
      <Line x1="18" y1="46" x2="42" y2="46" stroke={accent} strokeWidth="0.8" opacity="0.4" />
      <Line x1="20" y1="52" x2="40" y2="52" stroke={accent} strokeWidth="0.8" opacity="0.3" />
      <Line x1="22" y1="58" x2="38" y2="58" stroke={accent} strokeWidth="0.8" opacity="0.2" />
    </Svg>
  ),
  round: (stroke, accent, fill) => (
    <Svg width="70" height="100" viewBox="0 0 70 100">
      {/* Cap */}
      <Rect x="29" y="4" width="12" height="10" rx="2" fill={stroke} opacity="0.6" />
      {/* Neck */}
      <Rect x="31" y="14" width="8" height="8" fill={stroke} opacity="0.3" />
      {/* Round body */}
      <Ellipse cx="35" cy="62" rx="28" ry="32" fill={fill} stroke={stroke} strokeWidth="1" opacity="0.9" />
      <Ellipse cx="35" cy="62" rx="20" ry="24" fill={accent} opacity="0.08" />
      <Ellipse cx="28" cy="52" rx="5" ry="8" fill="white" opacity="0.12" />
    </Svg>
  ),
  square: (stroke, accent, fill) => (
    <Svg width="70" height="100" viewBox="0 0 70 100">
      {/* Cap - flat */}
      <Rect x="20" y="6" width="30" height="8" rx="1" fill={stroke} opacity="0.7" />
      {/* Neck */}
      <Rect x="29" y="14" width="12" height="8" fill={stroke} opacity="0.3" />
      {/* Square body */}
      <Rect x="8" y="22" width="54" height="70" rx="2" fill={fill} stroke={stroke} strokeWidth="1" opacity="0.9" />
      <Rect x="14" y="30" width="42" height="50" rx="1" fill={accent} opacity="0.07" />
      <Rect x="18" y="38" width="34" height="1" fill={accent} opacity="0.3" />
      <Rect x="18" y="46" width="28" height="1" fill={accent} opacity="0.25" />
      <Rect x="18" y="54" width="22" height="1" fill={accent} opacity="0.2" />
      {/* Highlight */}
      <Rect x="10" y="24" width="8" height="40" rx="1" fill="white" opacity="0.07" />
    </Svg>
  ),
  flacon: (stroke, accent, fill) => (
    <Svg width="60" height="100" viewBox="0 0 60 100">
      {/* Atomizer cap */}
      <Rect x="24" y="2" width="12" height="6" rx="3" fill={stroke} opacity="0.7" />
      <Rect x="27" y="8" width="6" height="12" fill={stroke} opacity="0.4" />
      {/* Curved flacon body */}
      <Path
        d="M18 20 Q12 30 10 50 Q10 80 30 88 Q50 80 50 50 Q48 30 42 20 Z"
        fill={fill} stroke={stroke} strokeWidth="1" opacity="0.9"
      />
      <Path
        d="M22 30 Q18 45 18 58 Q20 72 30 76"
        fill="none" stroke="white" strokeWidth="1.5" opacity="0.1" strokeLinecap="round"
      />
      <Ellipse cx="38" cy="38" rx="4" ry="7" fill="white" opacity="0.1" />
    </Svg>
  ),
};

export default function BottleIllustration({ style = 'tall', size = 1, accentColor }: Props) {
  const { colors: c, isDark } = useTheme();
  const stroke = c.black;
  const fill = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const accent = accentColor || c.accent;

  return (
    <View style={{ transform: [{ scale: size }], alignItems: 'center', justifyContent: 'center' }}>
      {BOTTLES[style](stroke, accent, fill)}
    </View>
  );
}

// Assign bottle style based on fragrance house
export function getBottleStyle(house: string): BottleStyle {
  const h = house.toLowerCase();
  if (h.includes('chanel') || h.includes('dior') || h.includes('givenchy')) return 'square';
  if (h.includes('maison') || h.includes('byredo') || h.includes('le labo')) return 'flacon';
  if (h.includes('creed') || h.includes('amouage') || h.includes('tom ford')) return 'tall';
  return 'round';
}
