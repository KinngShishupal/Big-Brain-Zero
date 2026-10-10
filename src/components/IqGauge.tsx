import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { IQ_MAX, IQ_MIN, iqToAngle } from '../engine/stupid';
import { colors } from '../theme';

/** Zones match the result ranks in engine/stupid.ts (lower IQ = better). */
const ZONES = [
  { upTo: 20, color: '#FFD84D' }, // 🥔 potato
  { upTo: 50, color: '#FF4FD8' }, // 🤡 goofball
  { upTo: 90, color: '#2EE6FF' }, // 🐔 chicken
  { upTo: 130, color: '#8B5CFF' }, // 😐 normal
  { upTo: IQ_MAX, color: '#FF3D6E' }, // 🤓 genius
];

const LABELS = [5, 20, 50, 90, 130, 160];

const SIZE = 300;
const RADIUS = 122;
const ARC_SEGMENTS = 54;
const NEEDLE = RADIUS - 10;

function zoneColor(iq: number): string {
  return (ZONES.find(z => iq <= z.upTo) ?? ZONES[ZONES.length - 1]).color;
}

/** Places a child at `radius` from the pivot along `angle`, optionally kept upright. */
function polar(angle: number, radius: number, upright = false) {
  return {
    transform: [
      { rotate: `${angle}deg` },
      { translateY: -radius },
      ...(upright ? [{ rotate: `${-angle}deg` }] : []),
    ],
  };
}

interface Props {
  iq: number;
  /** How long the needle takes to sweep from 160 down to `iq`. */
  sweepMs: number;
  readout: number;
}

function IqGaugeImpl({ iq, sweepMs, readout }: Props) {
  const angle = useSharedValue(iqToAngle(IQ_MAX));
  const tremble = useSharedValue(0);

  useEffect(() => {
    const target = iqToAngle(iq);
    // Sweep, overshoot a hair past the target, then settle like a real meter.
    angle.value = withSequence(
      withTiming(target - 4, {
        duration: sweepMs,
        easing: Easing.out(Easing.cubic),
      }),
      withSpring(target, { damping: 9, stiffness: 140 }),
    );
    // A barely-there needle tremble once it has settled.
    tremble.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 90 }),
        withTiming(-0.6, { duration: 90 }),
      ),
      -1,
      true,
    );
  }, [iq, sweepMs, angle, tremble]);

  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value + tremble.value}deg` }],
  }));

  const segments = useMemo(
    () =>
      Array.from({ length: ARC_SEGMENTS }, (_, i) => {
        const t = (i + 0.5) / ARC_SEGMENTS;
        const segIq = IQ_MIN + t * (IQ_MAX - IQ_MIN);
        return { a: -90 + t * 180, color: zoneColor(segIq) };
      }),
    [],
  );

  const ticks = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => {
        const iqAt = IQ_MIN + (i / 31) * (IQ_MAX - IQ_MIN);
        return { a: iqToAngle(iqAt), major: i % 5 === 0 };
      }),
    [],
  );

  return (
    <View style={styles.box} accessibilityLabel={`IQ ${readout}`}>
      {/* Everything is positioned relative to this zero-size pivot. */}
      <View style={styles.pivot}>
        <View style={styles.backGlow} />

        {segments.map((s, i) => (
          <View
            key={`s${i}`}
            style={[
              styles.segment,
              {
                backgroundColor: s.color,
                boxShadow: `0px 0px 10px ${s.color}`,
              },
              polar(s.a, RADIUS),
            ]}
          />
        ))}

        {ticks.map((tk, i) => (
          <View
            key={`t${i}`}
            style={[
              tk.major ? styles.tickMajor : styles.tickMinor,
              polar(tk.a, RADIUS - (tk.major ? 20 : 17)),
            ]}
          />
        ))}

        {LABELS.map(v => (
          <Text
            key={`l${v}`}
            style={[styles.label, polar(iqToAngle(v), RADIUS - 40, true)]}
          >
            {v}
          </Text>
        ))}

        <Text style={[styles.endEmoji, polar(-100, RADIUS + 22, true)]}>
          🥔
        </Text>
        <Text style={[styles.endEmoji, polar(100, RADIUS + 22, true)]}>🤓</Text>

        <Animated.View style={[styles.needleArm, needleStyle]}>
          <View style={styles.needle} />
          <View style={styles.needleTip} />
        </Animated.View>

        <View style={styles.hubOuter}>
          <View style={styles.hubInner} />
        </View>
      </View>

      <View style={styles.readout}>
        <Text style={styles.readoutLabel}>IQ</Text>
        <Text style={styles.readoutValue}>{readout}</Text>
      </View>
    </View>
  );
}

export const IqGauge = memo(IqGaugeImpl);

const SEG_W = 7;
const SEG_H = 16;

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: RADIUS + 96,
    alignItems: 'center',
  },
  pivot: {
    position: 'absolute',
    left: SIZE / 2,
    top: RADIUS + 34,
    width: 0,
    height: 0,
  },
  backGlow: {
    position: 'absolute',
    left: -RADIUS - 20,
    top: -RADIUS - 20,
    width: (RADIUS + 20) * 2,
    height: (RADIUS + 20) * 2,
    borderRadius: RADIUS + 20,
    backgroundImage:
      'radial-gradient(circle, rgba(139,92,255,0.28) 0%, rgba(14,7,38,0) 70%)',
  },
  segment: {
    position: 'absolute',
    left: -SEG_W / 2,
    top: -SEG_H / 2,
    width: SEG_W,
    height: SEG_H,
    borderRadius: 3,
  },
  tickMajor: {
    position: 'absolute',
    left: -1.5,
    top: -7,
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  tickMinor: {
    position: 'absolute',
    left: -1,
    top: -4,
    width: 2,
    height: 8,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  label: {
    position: 'absolute',
    left: -16,
    top: -9,
    width: 32,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  endEmoji: {
    position: 'absolute',
    left: -14,
    top: -14,
    width: 28,
    textAlign: 'center',
    fontSize: 22,
  },
  needleArm: {
    position: 'absolute',
    left: -1,
    top: -1,
    width: 2,
    height: 2,
    overflow: 'visible',
  },
  needle: {
    position: 'absolute',
    left: -2,
    bottom: 1,
    width: 6,
    height: NEEDLE,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundImage: 'linear-gradient(0deg, #FFFFFF 0%, #FF4FD8 100%)',
    boxShadow: '0px 0px 14px rgba(255, 79, 216, 0.9)',
  },
  needleTip: {
    position: 'absolute',
    left: -4,
    bottom: NEEDLE - 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 0px 12px rgba(255, 255, 255, 0.9)',
  },
  hubOuter: {
    position: 'absolute',
    left: -16,
    top: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'linear-gradient(135deg, #FF4FD8 0%, #8B5CFF 100%)',
    boxShadow: '0px 0px 18px rgba(255, 79, 216, 0.8)',
  },
  hubInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#150A38',
  },
  readout: {
    position: 'absolute',
    top: RADIUS + 58,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  readoutLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  readoutValue: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 79, 216, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
