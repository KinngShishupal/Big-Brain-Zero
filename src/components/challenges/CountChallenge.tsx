import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { scoreCount } from '../../engine/stupid';
import { useT } from '../../i18n';
import { haptic } from '../../services/haptics';
import { playSfx } from '../../services/sound';
import { colors, glow, radius, spacing, TOUCH_MIN } from '../../theme';
import { Button } from '../Button';

interface Props {
  count: number;
  dots: { x: number; y: number }[];
  onDone: (points: number) => void;
}

function Step({ step, onPress }: { step: number; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={step > 0 ? `+${step}` : `${step}`}
      onPress={() => {
        haptic('tap');
        playSfx('tap', 0.7);
        onPress();
      }}
      style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}
    >
      <Text style={styles.stepLabel}>{step > 0 ? `+${step}` : step}</Text>
    </Pressable>
  );
}

export function CountChallenge({ count, dots, onDone }: Props) {
  const t = useT();
  const [guess, setGuess] = useState(1);
  const change = (step: number) =>
    setGuess(g => Math.min(999, Math.max(0, g + step)));

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{t('count.prompt')}</Text>
      <View style={styles.field}>
        {dots.map((d, i) => (
          <Animated.Text
            key={i}
            entering={ZoomIn.delay(i * 35).springify()}
            style={[
              styles.chicken,
              { left: `${d.x * 85}%`, top: `${d.y * 80}%` },
            ]}
          >
            🐔
          </Animated.Text>
        ))}
      </View>
      <View style={styles.stepper}>
        <Step step={-10} onPress={() => change(-10)} />
        <Step step={-1} onPress={() => change(-1)} />
        <View style={styles.guessBox}>
          <Text style={styles.guess}>{guess}</Text>
        </View>
        <Step step={1} onPress={() => change(1)} />
        <Step step={10} onPress={() => change(10)} />
      </View>
      <Button
        label={t('count.submit')}
        icon="✅"
        variant="cyan"
        onPress={() => onDone(scoreCount(guess, count))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  prompt: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  field: {
    height: 270,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(182, 255, 59, 0.35)',
    backgroundImage:
      'radial-gradient(circle at 50% 40%, rgba(182,255,59,0.28) 0%, rgba(46,219,138,0.12) 60%, rgba(255,255,255,0.04) 100%)',
    boxShadow: glow.lime,
    overflow: 'hidden',
  },
  chicken: {
    position: 'absolute',
    fontSize: 32,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  step: {
    minWidth: TOUCH_MIN + 6,
    height: TOUCH_MIN + 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPressed: {
    backgroundColor: colors.glassStrong,
  },
  stepLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  guessBox: {
    minWidth: 84,
    alignItems: 'center',
  },
  guess: {
    color: colors.cyan,
    fontSize: 44,
    fontWeight: '900',
    textShadowColor: 'rgba(46, 230, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
});
