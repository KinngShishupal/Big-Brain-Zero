import React, { memo, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { gradients } from '../theme';

interface BlobProps {
  color: string;
  size: number;
  x: number;
  y: number;
  drift: number;
  duration: number;
}

/** A soft glowing orb that slowly drifts. Radial gradient fades to transparent. */
function Blob({ color, size, x, y, drift, duration }: BlobProps) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [t, duration]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: drift * (t.value - 0.5) },
      { translateY: drift * 0.7 * (0.5 - t.value) },
      { scale: 0.9 + t.value * 0.2 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          left: x - size / 2,
          top: y - size / 2,
          backgroundImage: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        },
        style,
      ]}
    />
  );
}

/** Full-screen gradient with drifting neon blobs. Put screen content on top. */
function BackdropImpl({ children }: { children?: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <View
        style={[StyleSheet.absoluteFill, { backgroundImage: gradients.screen }]}
      />
      <Blob
        color="rgba(255,79,216,0.45)"
        size={width * 1.1}
        x={width * 0.1}
        y={height * 0.15}
        drift={80}
        duration={7000}
      />
      <Blob
        color="rgba(46,230,255,0.32)"
        size={width * 1.2}
        x={width * 0.95}
        y={height * 0.55}
        drift={100}
        duration={9000}
      />
      <Blob
        color="rgba(139,92,255,0.4)"
        size={width}
        x={width * 0.3}
        y={height * 0.95}
        drift={70}
        duration={8000}
      />
      {children}
    </View>
  );
}

export const Backdrop = memo(BackdropImpl);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0726',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
});
