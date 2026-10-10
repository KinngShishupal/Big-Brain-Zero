import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../app/navigation/types';
import { Button } from '../components/Button';
import { iqFor, rankFor } from '../engine/stupid';
import { useT } from '../i18n';
import { haptic } from '../services/haptics';
import { useSaveStore } from '../store/saveStore';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export function ResultScreen({ navigation, route }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { score, max } = route.params;
  const iq = iqFor(score, max);
  const rank = rankFor(iq);
  const [newBest, setNewBest] = useState(false);
  const recorded = useRef(false);

  useEffect(() => {
    if (!recorded.current) {
      recorded.current = true;
      const best = useSaveStore.getState().recordRun(iq);
      setNewBest(best);
      haptic(rank === 'genius' ? 'error' : 'success');
    }
  }, [iq, rank]);

  const scale = useSharedValue(0.3);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 7, stiffness: 120 });
  }, [scale]);
  const iqStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
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
        <Text style={styles.label}>{t('result.title')}</Text>
        <Animated.Text style={[styles.iq, iqStyle]}>{iq}</Animated.Text>
        <Text style={styles.rank}>{t(`rank.${rank}`)}</Text>
        <Text style={styles.score}>{t('result.score', { score, max })}</Text>
        {newBest && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('result.newBest')}</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <Button
          label={t('result.again')}
          onPress={() => navigation.replace('Play')}
        />
        <Button
          label={t('result.home')}
          variant="ghost"
          onPress={() => navigation.popToTop()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  iq: {
    color: colors.primary,
    fontSize: 120,
    fontWeight: '900',
    textShadowColor: colors.border,
    textShadowOffset: { width: 4, height: 6 },
    textShadowRadius: 0,
  },
  rank: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  score: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.lime,
  },
  badgeText: {
    color: colors.text,
    fontWeight: '900',
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
});
