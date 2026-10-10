import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../app/navigation/types';
import { Backdrop } from '../components/Backdrop';
import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { GlassCard } from '../components/GlassCard';
import { iqFor, rankFor, type Rank } from '../engine/stupid';
import { useT } from '../i18n';
import { haptic } from '../services/haptics';
import { useSaveStore } from '../store/saveStore';
import { colors, gradients, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const RANK_EMOJI: Record<Rank, string> = {
  potato: '🥔',
  goofball: '🤡',
  chicken: '🐔',
  normal: '😐',
  genius: '🤓',
};

const COUNT_MS = 1400;

/** Counts from 160 down to the final IQ — the suspense of getting dumber. */
function useCountDown(target: number): number {
  const [value, setValue] = useState(160);
  useEffect(() => {
    const start = Date.now();
    let frame: number;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(160 - (160 - target) * eased));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

export function ResultScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { score, max } = route.params;
  const iq = iqFor(score, max);
  const rank = rankFor(iq);
  const shown = useCountDown(iq);
  const [newBest, setNewBest] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const recorded = useRef(false);

  useEffect(() => {
    if (!recorded.current) {
      recorded.current = true;
      setNewBest(useSaveStore.getState().recordRun(iq));
    }
    const timer = setTimeout(() => {
      haptic(rank === 'genius' ? 'error' : 'success');
      setCelebrate(rank !== 'genius' && rank !== 'normal');
    }, COUNT_MS);
    return () => clearTimeout(timer);
  }, [iq, rank]);

  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.linear }),
      -1,
    );
  }, [spin]);
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <Backdrop>
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <View style={styles.hero}>
          <Animated.Text entering={FadeInDown.springify()} style={styles.label}>
            {t('result.title')}
          </Animated.Text>

          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            style={styles.dial}
          >
            <Animated.View style={[styles.ring, ringStyle]} />
            <View style={styles.dialInner}>
              <Text style={styles.iq}>{shown}</Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(COUNT_MS - 200).springify()}
            style={styles.full}
          >
            <GlassCard style={styles.rankCard}>
              <Text style={styles.rankEmoji}>{RANK_EMOJI[rank]}</Text>
              <Text style={styles.rank}>{t(`rank.${rank}`)}</Text>
              <Text style={styles.score}>
                {t('result.score', { score, max })}
              </Text>
            </GlassCard>
          </Animated.View>

          {newBest && (
            <Animated.View
              entering={ZoomIn.delay(COUNT_MS + 100).springify()}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>🏆 {t('result.newBest')}</Text>
            </Animated.View>
          )}
        </View>

        <Animated.View
          entering={FadeInUp.delay(COUNT_MS).springify()}
          style={styles.actions}
        >
          <Button
            label={t('result.again')}
            icon="🔁"
            onPress={() => navigation.replace('Play')}
          />
          <Button
            label={t('result.home')}
            variant="glass"
            onPress={() => navigation.popToTop()}
          />
        </Animated.View>
      </View>
      {celebrate && <Confetti count={48} />}
    </Backdrop>
  );
}

const DIAL = 220;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  dial: {
    width: DIAL,
    height: DIAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: DIAL,
    height: DIAL,
    borderRadius: DIAL / 2,
    backgroundImage:
      'linear-gradient(135deg, #2EE6FF 0%, #8B5CFF 35%, #FF4FD8 65%, #FFD84D 100%)',
    boxShadow: '0px 0px 50px rgba(139, 92, 255, 0.6)',
  },
  dialInner: {
    width: DIAL - 16,
    height: DIAL - 16,
    borderRadius: (DIAL - 16) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#150A38',
  },
  iq: {
    color: colors.text,
    fontSize: 88,
    fontWeight: '900',
    letterSpacing: -3,
    textShadowColor: 'rgba(255, 79, 216, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 28,
  },
  full: {
    alignSelf: 'stretch',
  },
  rankCard: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  rankEmoji: {
    fontSize: 44,
  },
  rank: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  score: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundImage: gradients.gold,
  },
  badgeText: {
    color: '#120A2E',
    fontWeight: '900',
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
});
