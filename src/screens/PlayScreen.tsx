import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import Animated, {
  Easing,
  FadeIn,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  ZoomIn,
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
  isGameOver,
  makeRng,
  pickLine,
  pickQuip,
  VERDICT_LINES,
  maxScore,
  verdictFor,
  type Challenge,
  type Verdict,
} from '../engine/stupid';
import { adUnitId } from '../config/ads';
import { useT, type TranslationKey } from '../i18n';
import { showRewarded, useAds } from '../services/ads';
import { haptic } from '../services/haptics';
import { playSfx, type Sfx } from '../services/sound';
import { colors, glow, gradients, radius, spacing, TOUCH_MIN } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

const VERDICT_SOUND: Record<Verdict, Sfx> = {
  smart: 'smart',
  meh: 'select',
  dumb: 'dumb',
  peak: 'peak',
};

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

const EASE_OUT = Easing.out(Easing.cubic);
const COUNT_UP_MS = 550;

/** Ticks a number up from 0 — a calmer reveal than a bouncy pop. */
function useCountUp(target: number | null): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === null) {
      setValue(0);
      return;
    }
    const start = Date.now();
    let frame: number;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / COUNT_UP_MS);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

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

/** Questions from the previous game this session, so the next game gets fresh ones. */
let lastGameQuestions: ReadonlySet<string> = new Set();

export function PlayScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [run] = useState(() => {
    const next = buildRun(makeRng(Date.now()), lastGameQuestions);
    lastGameQuestions = new Set(
      next.flatMap(c => (c.kind === 'quiz' ? [c.question.id] : [])),
    );
    return next;
  });
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  /** Bumps when a challenge is retried, so it remounts with fresh state. */
  const [attempt, setAttempt] = useState(0);
  const [retrying, setRetrying] = useState(false);
  /** Which funny game-over roast to show (1…GAME_OVER_QUIPS). */
  const [quip, setQuip] = useState(1);
  /** Which funny line to show for a scored verdict (1…VERDICT_LINES). */
  const [verdictLine, setVerdictLine] = useState(1);

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
      playSfx(VERDICT_SOUND[verdictFor(points)]);
      playSfx('whoosh', 0.5);
      if (isGameOver(points)) {
        setQuip(prev => pickQuip(prev, Math.random));
      } else {
        setVerdictLine(prev => pickLine(prev, Math.random, VERDICT_LINES));
      }
      setTotal(prev => prev + points);
      setLastPoints(points);
      scoreBump.value = withSequence(
        withTiming(1.08, { duration: 140, easing: EASE_OUT }),
        withTiming(1, { duration: 260, easing: EASE_OUT }),
      );
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

  // Too smart: the run ends here unless the player watches a video to retry.
  const retryWithAd = async () => {
    if (retrying) {
      return;
    }
    setRetrying(true);
    const earned = await showRewarded();
    setRetrying(false);
    if (earned) {
      answered.current = false;
      setLastPoints(null);
      setAttempt(a => a + 1);
    }
  };

  const endGame = () => {
    if (!answered.current) {
      return;
    }
    answered.current = false;
    setLastPoints(null);
    navigation.replace('Result', {
      score: total,
      max: maxScore(run),
      endedAt: index + 1,
    });
  };

  const adsReady = useAds(s => s.ready);
  const rewardedLoaded = useAds(s => s.rewardedLoaded);
  const shownPoints = useCountUp(lastPoints);
  const verdict = lastPoints === null ? null : verdictFor(lastPoints);
  const vs = verdict ? VERDICT_STYLE[verdict] : null;
  const gameOver = lastPoints !== null && isGameOver(lastPoints);

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

        {/* Keyed by index + attempt so each (re)try starts with fresh state and timers. */}
        <Animated.View
          key={`${index}-${attempt}`}
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
        onRequestClose={gameOver ? endGame : next}
      >
        <View style={styles.backdrop}>
          {verdict === 'peak' && <Confetti count={24} />}
          {vs && (
            <Animated.View
              entering={SlideInDown.duration(320).easing(EASE_OUT)}
              style={[
                styles.sheet,
                { paddingBottom: insets.bottom + spacing.xl },
              ]}
            >
              <Animated.View
                entering={ZoomIn.delay(120).duration(280).easing(EASE_OUT)}
                style={[styles.emojiBubble, { boxShadow: vs.glow }]}
              >
                <Text style={styles.verdictEmoji}>{vs.emoji}</Text>
              </Animated.View>

              {/* Banner sits at the top, far from Next, to avoid accidental taps.
                  Its space is reserved so nothing shifts when it loads. */}
              <View style={styles.bannerSlot}>
                {adsReady && (
                  <BannerAd
                    unitId={adUnitId('banner')}
                    size={BannerAdSize.BANNER}
                  />
                )}
              </View>

              {gameOver ? (
                <>
                  <Animated.Text
                    entering={FadeIn.delay(160).duration(300)}
                    style={[styles.gameOver, { textShadowColor: vs.textGlow }]}
                  >
                    {t(`gameOver.title${quip}` as TranslationKey)}
                  </Animated.Text>
                  <Text style={styles.gameOverBody}>
                    {t(`gameOver.body${quip}` as TranslationKey)}
                  </Text>
                  <Button
                    label={
                      rewardedLoaded
                        ? t('gameOver.retry')
                        : t('gameOver.loading')
                    }
                    icon="🎬"
                    variant="gold"
                    disabled={!rewardedLoaded || retrying}
                    onPress={retryWithAd}
                    style={styles.full}
                  />
                  <Button
                    label={t('gameOver.end')}
                    variant="glass"
                    onPress={endGame}
                    style={styles.full}
                  />
                </>
              ) : (
                <>
                  <Animated.Text
                    entering={FadeIn.delay(160).duration(300)}
                    style={[styles.points, { textShadowColor: vs.textGlow }]}
                  >
                    +{shownPoints}
                  </Animated.Text>
                  <Text style={styles.pointsLabel}>
                    {t('play.points', { points: lastPoints ?? 0 })}
                  </Text>
                  <Text style={styles.verdict}>
                    {t(`verdict.${verdict!}${verdictLine}` as TranslationKey)}
                  </Text>
                  <Button
                    label={t('verdict.continue')}
                    icon="👉"
                    variant={vs.button}
                    onPress={next}
                    style={styles.full}
                  />
                </>
              )}
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
  bannerSlot: {
    width: 320,
    height: 50,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: radius.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  points: {
    color: colors.text,
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  gameOver: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  gameOverBody: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing.md,
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
