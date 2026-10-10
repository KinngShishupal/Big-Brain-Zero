import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';

const CORNER = 2;

const PALETTE = [
  colors.pink,
  colors.cyan,
  colors.lime,
  colors.gold,
  colors.violet,
  colors.orange,
];

interface PieceSpec {
  dx: number;
  dy: number;
  rotate: number;
  color: string;
  size: number;
  delay: number;
  round: boolean;
}

function Piece({ spec }: { spec: PieceSpec }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      spec.delay,
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) }),
    );
  }, [t, spec.delay]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.75 ? 1 : 1 - (t.value - 0.75) / 0.25,
    transform: [
      { translateX: spec.dx * t.value },
      // Burst up, then gravity pulls it down.
      { translateY: spec.dy * t.value + 420 * t.value * t.value },
      { rotate: `${spec.rotate * t.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: spec.size,
          height: spec.round ? spec.size : spec.size * 0.45,
          borderRadius: spec.round ? spec.size : CORNER,
          backgroundColor: spec.color,
        },
        style,
      ]}
    />
  );
}

/** One-shot confetti burst from the middle of the screen. Remount (change `key`) to replay. */
function ConfettiImpl({ count = 36 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo<PieceSpec[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const power = 140 + Math.random() * 180;
        return {
          dx: Math.cos(angle) * power,
          dy: Math.sin(angle) * power - 260,
          rotate: (Math.random() - 0.5) * 900,
          color: PALETTE[i % PALETTE.length],
          size: 8 + Math.random() * 8,
          delay: Math.random() * 120,
          round: i % 3 === 0,
        };
      }),
    [count],
  );

  return (
    <View
      pointerEvents="none"
      style={[styles.origin, { left: width / 2, top: height * 0.45 }]}
    >
      {pieces.map((p, i) => (
        <Piece key={i} spec={p} />
      ))}
    </View>
  );
}

export const Confetti = memo(ConfettiImpl);

const styles = StyleSheet.create({
  origin: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  piece: {
    position: 'absolute',
  },
});
