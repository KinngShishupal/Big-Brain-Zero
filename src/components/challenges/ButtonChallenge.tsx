import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scoreButton } from '../../engine/stupid';
import { useT } from '../../i18n';
import { haptic } from '../../services/haptics';
import { playSfx } from '../../services/sound';
import { colors, gradients, radius, spacing } from '../../theme';

interface Props {
  seconds: number;
  onDone: (points: number) => void;
}

const SIZE = 230;

export function ButtonChallenge({ seconds, onDone }: Props) {
  const t = useT();
  const [presses, setPresses] = useState(0);
  const [msLeft, setMsLeft] = useState(seconds * 1000);
  const pressesRef = useRef(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const scale = useSharedValue(1);
  const ring = useSharedValue(0);

  useEffect(() => {
    ring.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }),
      -1,
    );
    const end = Date.now() + seconds * 1000;
    const timer = setInterval(() => {
      const remaining = Math.max(0, end - Date.now());
      setMsLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        onDoneRef.current(scoreButton(pressesRef.current));
      }
    }, 50);
    return () => clearInterval(timer);
  }, [seconds, ring]);

  const press = () => {
    pressesRef.current += 1;
    setPresses(pressesRef.current);
    haptic('bonk');
    playSfx('bonk', 0.8);
    scale.value = withSequence(
      withTiming(0.88, { duration: 45 }),
      withTiming(1, { duration: 110 }),
    );
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.6 * (1 - ring.value),
    transform: [{ scale: 1 + ring.value * 0.45 }],
  }));

  const fraction = msLeft / (seconds * 1000);

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{t('button.prompt')}</Text>

      <View style={styles.timer}>
        <View style={[styles.timerFill, { width: `${fraction * 100}%` }]} />
      </View>
      <Text style={styles.time}>
        {t('button.time', { seconds: Math.ceil(msLeft / 1000) })}
      </Text>

      <View style={styles.stage}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Pressable
          onPress={press}
          accessibilityRole="button"
          accessibilityLabel={t('button.label')}
        >
          <Animated.View style={[styles.button, buttonStyle]}>
            <View style={styles.buttonInner}>
              <Text style={styles.buttonLabel}>{t('button.label')}</Text>
            </View>
          </Animated.View>
        </Pressable>
      </View>

      <Animated.Text
        key={presses}
        entering={FadeIn.duration(120)}
        style={styles.presses}
      >
        {presses}
      </Animated.Text>
      <Text style={styles.pressesLabel}>{t('button.pressesLabel')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  prompt: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  timer: {
    alignSelf: 'stretch',
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  timerFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundImage: gradients.red,
  },
  time: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  stage: {
    width: SIZE * 1.5,
    height: SIZE * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: colors.red,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    padding: 12,
    backgroundImage: 'linear-gradient(180deg, #4A1030 0%, #1E0614 100%)',
    boxShadow: '0px 0px 60px rgba(255, 61, 110, 0.65)',
  },
  buttonInner: {
    flex: 1,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundImage:
      'radial-gradient(circle at 35% 30%, #FF8FA8 0%, #FF3D6E 40%, #B0103F 100%)',
  },
  buttonLabel: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  presses: {
    color: colors.text,
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 60,
  },
  pressesLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
