import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scoreCount } from '../../engine/stupid';
import { useT } from '../../i18n';
import { haptic } from '../../services/haptics';
import { colors, radius, spacing, TOUCH_MIN } from '../../theme';
import { Button } from '../Button';

interface Props {
  count: number;
  dots: { x: number; y: number }[];
  onDone: (points: number) => void;
}

const STEPS = [-10, -1, 1, 10];

export function CountChallenge({ count, dots, onDone }: Props) {
  const t = useT();
  const [guess, setGuess] = useState(1);

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{t('count.prompt')}</Text>
      <View style={styles.field}>
        {dots.map((d, i) => (
          <Text
            key={i}
            style={[
              styles.chicken,
              { left: `${d.x * 85}%`, top: `${d.y * 82}%` },
            ]}
          >
            🐔
          </Text>
        ))}
      </View>
      <View style={styles.stepper}>
        {STEPS.slice(0, 2).map(step => (
          <Pressable
            key={step}
            accessibilityRole="button"
            accessibilityLabel={`${step}`}
            onPress={() => {
              haptic('tap');
              setGuess(g => Math.max(0, g + step));
            }}
            style={styles.step}
          >
            <Text style={styles.stepLabel}>{step}</Text>
          </Pressable>
        ))}
        <Text style={styles.guess}>{guess}</Text>
        {STEPS.slice(2).map(step => (
          <Pressable
            key={step}
            accessibilityRole="button"
            accessibilityLabel={`+${step}`}
            onPress={() => {
              haptic('tap');
              setGuess(g => Math.min(999, g + step));
            }}
            style={styles.step}
          >
            <Text style={styles.stepLabel}>+{step}</Text>
          </Pressable>
        ))}
      </View>
      <Button
        label={t('count.submit')}
        variant="secondary"
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
    height: 260,
    borderRadius: radius.lg,
    borderWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.lime,
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
    minWidth: TOUCH_MIN + 8,
    height: TOUCH_MIN + 8,
    borderRadius: radius.md,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  guess: {
    minWidth: 80,
    textAlign: 'center',
    color: colors.primaryDark,
    fontSize: 40,
    fontWeight: '900',
  },
});
