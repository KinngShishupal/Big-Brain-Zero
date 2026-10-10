import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scoreButton } from '../../engine/stupid';
import { useT } from '../../i18n';
import { haptic } from '../../services/haptics';
import { colors, spacing } from '../../theme';

interface Props {
  seconds: number;
  onDone: (points: number) => void;
}

export function ButtonChallenge({ seconds, onDone }: Props) {
  const t = useT();
  const [presses, setPresses] = useState(0);
  const [left, setLeft] = useState(seconds);
  const pressesRef = useRef(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const scale = useSharedValue(1);

  useEffect(() => {
    const end = Date.now() + seconds * 1000;
    const timer = setInterval(() => {
      const remaining = Math.max(0, end - Date.now());
      setLeft(Math.ceil(remaining / 1000));
      if (remaining === 0) {
        clearInterval(timer);
        onDoneRef.current(scoreButton(pressesRef.current));
      }
    }, 100);
    return () => clearInterval(timer);
  }, [seconds]);

  const press = () => {
    pressesRef.current += 1;
    setPresses(pressesRef.current);
    haptic('bonk');
    scale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withTiming(1, { duration: 90 }),
    );
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{t('button.prompt')}</Text>
      <Text style={styles.time}>{t('button.time', { seconds: left })}</Text>
      <Pressable
        onPress={press}
        accessibilityRole="button"
        accessibilityLabel={t('button.label')}
      >
        <Animated.View style={[styles.button, buttonStyle]}>
          <Text style={styles.buttonLabel}>{t('button.label')}</Text>
        </Animated.View>
      </Pressable>
      <Text style={styles.presses}>
        {t('button.presses', { count: presses })}
      </Text>
    </View>
  );
}

const SIZE = 220;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  prompt: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  time: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.danger,
    borderWidth: 6,
    borderColor: colors.border,
    borderBottomWidth: 14,
    borderBottomColor: colors.dangerDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  buttonLabel: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  presses: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
});
