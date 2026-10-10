import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../app/navigation/types';
import { Backdrop } from '../components/Backdrop';
import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { GlassCard } from '../components/GlassCard';
import { IqGauge } from '../components/IqGauge';
import { doubledScore, shouldShowInterstitial } from '../engine/adPolicy';
import { iqFor, rankFor, type Rank } from '../engine/stupid';
import { useT } from '../i18n';
import { showInterstitial, showRewarded, useAds } from '../services/ads';
import { haptic } from '../services/haptics';
import { duckMusic, playSfx } from '../services/sound';
import { useSaveStore } from '../store/saveStore';
import { colors, gradients, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

type Leave = 'again' | 'home';

const RANK_EMOJI: Record<Rank, string> = {
  potato: '🥔',
  goofball: '🤡',
  chicken: '🐔',
  normal: '😐',
  genius: '🤓',
};

const COUNT_MS = 1400;

/** Animates the shown IQ from its current value to `target` — 160 on first show. */
function useCountDown(target: number): number {
  const [value, setValue] = useState(160);
  const current = useRef(160);
  useEffect(() => {
    const from = current.current;
    const start = Date.now();
    let frame: number;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      current.current = Math.round(from - (from - target) * eased);
      setValue(current.current);
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
  const { score: baseScore, max, endedAt } = route.params;
  const adsReady = useAds(s => s.ready);

  const [doubled, setDoubled] = useState(false);
  const score = doubled ? doubledScore(baseScore, max) : baseScore;
  const iq = iqFor(score, max);
  const rank = rankFor(iq);
  const shown = useCountDown(iq);
  const [newBest, setNewBest] = useState(false);
  const [celebrate, setCelebrate] = useState(0);
  const [interstitialEligible, setInterstitialEligible] = useState(false);
  const recorded = useRef(false);

  // Record the run once, and decide whether this result earns an interstitial.
  useEffect(() => {
    if (recorded.current) {
      return;
    }
    recorded.current = true;
    const store = useSaveStore.getState();
    setNewBest(store.recordRun(iqFor(baseScore, max)));
    setInterstitialEligible(
      shouldShowInterstitial({
        runsCompleted: useSaveStore.getState().gamesPlayed,
        lastShownAt: useAds.getState().lastInterstitialAt,
        now: Date.now(),
        watchedRewarded: false,
      }),
    );
  }, [baseScore, max]);

  // Drumroll during the count-down, then celebrate (again after a doubled score).
  useEffect(() => {
    playSfx('drumroll');
    const timer = setTimeout(() => {
      haptic(rank === 'genius' ? 'error' : 'success');
      if (rank === 'genius' || rank === 'normal') {
        playSfx('smart');
      } else {
        playSfx('peak');
        setCelebrate(c => c + 1);
      }
    }, COUNT_MS);
    return () => clearTimeout(timer);
  }, [rank, iq]);

  // ── Rewarded: "double my stupidity" (preloaded at app start) ───────────────
  const rewardedLoaded = useAds(s => s.rewardedLoaded);
  const adShowing = useAds(s => s.showing);
  const canDouble = adsReady && !doubled && baseScore > 0 && baseScore < max;

  const watchRewarded = async () => {
    const earnedReward = await showRewarded();
    if (earnedReward) {
      const newIq = iqFor(doubledScore(baseScore, max), max);
      setDoubled(true);
      if (useSaveStore.getState().improveBest(newIq)) {
        setNewBest(true);
      }
    }
  };

  // Keep our music out of the way while any full-screen ad is on screen.
  useEffect(() => {
    duckMusic(adShowing);
    return () => duckMusic(false);
  }, [adShowing]);

  // ── Interstitial: between runs, rate-limited by adPolicy ───────────────────
  const leaving = useRef(false);
  const leave = async (where: Leave) => {
    if (leaving.current) {
      return;
    }
    leaving.current = true;
    // Don't stack an interstitial right after the player chose to watch a rewarded ad.
    if (interstitialEligible && !doubled) {
      await showInterstitial();
    }
    if (where === 'again') {
      navigation.replace('Play');
    } else {
      navigation.popToTop();
    }
  };

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

          <Animated.View entering={FadeIn.duration(300)}>
            <IqGauge iq={iq} sweepMs={COUNT_MS} readout={shown} />
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
              {endedAt !== undefined && (
                <Text style={styles.endedEarly}>
                  🤓 {t('result.gameOver', { n: endedAt })}
                </Text>
              )}
              {doubled && (
                <Animated.Text
                  entering={ZoomIn.springify()}
                  style={styles.doubled}
                >
                  {t('result.doubled')}
                </Animated.Text>
              )}
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
          {canDouble && (
            <Animated.View entering={FadeIn}>
              <Button
                label={
                  rewardedLoaded ? t('result.doubleAd') : t('result.adLoading')
                }
                icon="🎬"
                variant="gold"
                disabled={!rewardedLoaded}
                onPress={watchRewarded}
              />
            </Animated.View>
          )}
          <Button
            label={t('result.again')}
            icon="🔁"
            onPress={() => leave('again')}
          />
          <Button
            label={t('result.home')}
            variant="glass"
            onPress={() => leave('home')}
          />
        </Animated.View>
      </View>
      {celebrate > 0 && <Confetti key={celebrate} count={48} />}
    </Backdrop>
  );
}

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
  endedEarly: {
    color: colors.red,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  doubled: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '900',
    marginTop: spacing.xs,
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
