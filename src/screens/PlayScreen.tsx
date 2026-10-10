import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../app/navigation/types';
import { Button } from '../components/Button';
import { ButtonChallenge } from '../components/challenges/ButtonChallenge';
import { CountChallenge } from '../components/challenges/CountChallenge';
import { QuizChallenge } from '../components/challenges/QuizChallenge';
import { ReactionChallenge } from '../components/challenges/ReactionChallenge';
import {
  buildRun,
  makeRng,
  maxScore,
  verdictFor,
  type Challenge,
  type Verdict,
} from '../engine/stupid';
import { useT } from '../i18n';
import { haptic } from '../services/haptics';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

const VERDICT_EMOJI: Record<Verdict, string> = {
  smart: '🤓',
  meh: '😐',
  dumb: '🤪',
  peak: '🥔',
};

function renderChallenge(c: Challenge, onDone: (points: number) => void) {
  switch (c.kind) {
    case 'quiz':
      return (
        <QuizChallenge question={c.question} order={c.order} onDone={onDone} />
      );
    case 'button':
      return <ButtonChallenge seconds={c.seconds} onDone={onDone} />;
    case 'reaction':
      return <ReactionChallenge waitMs={c.waitMs} onDone={onDone} />;
    case 'count':
      return <CountChallenge count={c.count} dots={c.dots} onDone={onDone} />;
  }
}

export function PlayScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [run] = useState(() => buildRun(makeRng(Date.now())));
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [lastPoints, setLastPoints] = useState<number | null>(null);

  const pop = useSharedValue(0.5);
  useEffect(() => {
    if (lastPoints !== null) {
      pop.value = 0.5;
      pop.value = withSpring(1, { damping: 8, stiffness: 180 });
    }
  }, [lastPoints, pop]);
  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  // Guards against double taps: each challenge scores once, and Next advances once.
  const answered = useRef(false);

  const onDone = useCallback((points: number) => {
    if (answered.current) {
      return;
    }
    answered.current = true;
    haptic(points >= 50 ? 'success' : 'error');
    setTotal(prev => prev + points);
    setLastPoints(points);
  }, []);

  const next = () => {
    if (!answered.current) {
      return;
    }
    answered.current = false;
    setLastPoints(null);
    if (index + 1 >= run.length) {
      navigation.replace('Result', { score: total, max: maxScore(run) });
    } else {
      setIndex(index + 1);
    }
  };

  const verdict = lastPoints === null ? null : verdictFor(lastPoints);

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.progress}>
          {t('play.progress', { n: index + 1, total: run.length })}
        </Text>
        <Text style={styles.score}>🧠 {total}</Text>
      </View>
      <View style={styles.bar}>
        <View
          style={[styles.barFill, { width: `${(index / run.length) * 100}%` }]}
        />
      </View>

      {/* Keyed by index so each challenge starts with fresh state and timers. */}
      <View key={index} style={styles.body}>
        {renderChallenge(run[index], onDone)}
      </View>

      <Modal
        visible={verdict !== null}
        transparent
        animationType="fade"
        onRequestClose={next}
      >
        <View style={styles.backdrop}>
          {verdict && (
            <Animated.View style={[styles.card, popStyle]}>
              <Text style={styles.verdictEmoji}>{VERDICT_EMOJI[verdict]}</Text>
              <Text style={styles.points}>+{lastPoints}</Text>
              <Text style={styles.pointsLabel}>
                {t('play.points', { points: lastPoints ?? 0 })}
              </Text>
              <Text style={styles.verdict}>{t(`verdict.${verdict}`)}</Text>
              <Button
                label={t('verdict.continue')}
                variant="lime"
                onPress={next}
                style={styles.full}
              />
            </Animated.View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progress: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  score: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: '900',
  },
  bar: {
    height: 14,
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  body: {
    flex: 1,
    paddingVertical: spacing.lg,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  verdictEmoji: {
    fontSize: 72,
  },
  points: {
    color: colors.primary,
    fontSize: 56,
    fontWeight: '900',
    textShadowColor: colors.border,
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 0,
  },
  pointsLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  verdict: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
  full: {
    alignSelf: 'stretch',
  },
});
