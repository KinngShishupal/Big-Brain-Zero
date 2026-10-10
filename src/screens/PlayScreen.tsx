import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../app/navigation/types';
import { Backdrop } from '../components/Backdrop';
import { Button, type ButtonVariant } from '../components/Button';
import { ButtonChallenge } from '../components/challenges/ButtonChallenge';
import { CountChallenge } from '../components/challenges/CountChallenge';
import { QuizChallenge } from '../components/challenges/QuizChallenge';
import { ReactionChallenge } from '../components/challenges/ReactionChallenge';
import { Confetti } from '../components/Confetti';
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
import { colors, glow, gradients, radius, spacing, TOUCH_MIN } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

const VERDICT_STYLE: Record<
  Verdict,
  { emoji: string; glow: string; textGlow: string; button: ButtonVariant }
> = {
  smart: {
    emoji: '🤓',
    glow: glow.red,
    textGlow: 'rgba(255,61,110,0.85)',
    button: 'violet',
  },
  meh: {
    emoji: '😐',
    glow: glow.violet,
    textGlow: 'rgba(139,92,255,0.85)',
    button: 'violet',
  },
  dumb: {
    emoji: '🤪',
    glow: glow.cyan,
    textGlow: 'rgba(46,230,255,0.85)',
    button: 'cyan',
  },
  peak: {
    emoji: '🥔',
    glow: glow.gold,
    textGlow: 'rgba(255,216,77,0.9)',
    button: 'gold',
  },
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

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(index / run.length, { duration: 450 });
  }, [index, run.length, progress]);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const scoreBump = useSharedValue(1);
  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreBump.value }],
  }));

  // Guards against double taps: each challenge scores once, and Next advances once.
  const answered = useRef(false);

  const onDone = useCallback(
    (points: number) => {
      if (answered.current) {
        return;
      }
      answered.current = true;
      haptic(points >= 50 ? 'success' : 'error');
      setTotal(prev => prev + points);
      setLastPoints(points);
      scoreBump.value = 1.4;
      scoreBump.value = withSpring(1, { damping: 6, stiffness: 200 });
    },
    [scoreBump],
  );

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
  const vs = verdict ? VERDICT_STYLE[verdict] : null;

  return (
    <Backdrop>
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quit"
            hitSlop={8}
            onPress={() => navigation.goBack()}
            style={styles.close}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <View style={styles.headerMid}>
            <Text style={styles.progressText}>
              {t('play.progress', { n: index + 1, total: run.length })}
            </Text>
            <View style={styles.track}>
              <Animated.View style={[styles.fill, progressStyle]} />
            </View>
          </View>
          <Animated.View style={[styles.scorePill, scoreStyle]}>
            <Text style={styles.scoreText}>🧠 {total}</Text>
          </Animated.View>
        </View>

        {/* Keyed by index so each challenge starts with fresh state and timers. */}
        <Animated.View
          key={index}
          entering={FadeIn.duration(250)}
          style={styles.body}
        >
          {renderChallenge(run[index], onDone)}
        </Animated.View>
      </View>

      <Modal
        visible={verdict !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={next}
      >
        <View style={styles.backdrop}>
          {verdict === 'peak' && <Confetti />}
          {verdict === 'dumb' && <Confetti count={18} />}
          {vs && (
            <Animated.View
              entering={SlideInDown.springify().damping(16)}
              style={[
                styles.sheet,
                { paddingBottom: insets.bottom + spacing.xl },
              ]}
            >
              <View style={[styles.emojiBubble, { boxShadow: vs.glow }]}>
                <Text style={styles.verdictEmoji}>{vs.emoji}</Text>
              </View>
              <Text style={[styles.points, { textShadowColor: vs.textGlow }]}>
                +{lastPoints}
              </Text>
              <Text style={styles.pointsLabel}>
                {t('play.points', { points: lastPoints ?? 0 })}
              </Text>
              <Text style={styles.verdict}>{t(`verdict.${verdict!}`)}</Text>
              <Button
                label={t('verdict.continue')}
                icon="👉"
                variant={vs.button}
                onPress={next}
                style={styles.full}
              />
            </Animated.View>
          )}
        </View>
      </Modal>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  close: {
    width: TOUCH_MIN - 6,
    height: TOUCH_MIN - 6,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '900',
  },
  headerMid: {
    flex: 1,
    gap: 6,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundImage: gradients.progress,
    boxShadow: glow.violet,
  },
  scorePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundImage: gradients.pink,
    boxShadow: glow.pink,
  },
  scoreText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    paddingVertical: spacing.lg,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundImage: 'linear-gradient(180deg, #2A1466 0%, #160B3A 100%)',
  },
  emojiBubble: {
    width: 110,
    height: 110,
    marginTop: -80,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: gradients.glass,
    backgroundColor: '#22104F',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  verdictEmoji: {
    fontSize: 64,
  },
  points: {
    color: colors.text,
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  pointsLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  verdict: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  full: {
    alignSelf: 'stretch',
  },
});
