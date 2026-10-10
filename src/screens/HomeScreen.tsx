import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../app/navigation/types';
import { Button } from '../components/Button';
import { useT } from '../i18n';
import { haptic } from '../services/haptics';
import { useSaveStore } from '../store/saveStore';
import { colors, radius, spacing, TOUCH_MIN } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const bestIq = useSaveStore(s => s.bestIq);
  const gamesPlayed = useSaveStore(s => s.gamesPlayed);

  // The brain wobbles, as brains do.
  const wobble = useSharedValue(0);
  useEffect(() => {
    wobble.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(-1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [wobble]);
  const brainStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${wobble.value * 12}deg` },
      { scale: 1 + Math.abs(wobble.value) * 0.06 },
    ],
  }));

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={8}
          style={styles.gear}
          onPress={() => {
            haptic('tap');
            navigation.navigate('Settings');
          }}
        >
          <Text style={styles.gearIcon}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Animated.Text style={[styles.brain, brainStyle]}>🧠</Animated.Text>
        <Text style={styles.title}>{t('app.title')}</Text>
        <Text style={styles.tagline}>{t('app.tagline')}</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>
            {bestIq === null
              ? t('home.noBest')
              : t('home.best', { iq: bestIq })}
          </Text>
          <Text style={styles.statMuted}>
            {t('home.played', { count: gamesPlayed })}
          </Text>
        </View>
        <Text style={styles.rules}>{t('home.rules')}</Text>
      </View>

      <Button
        label={t('home.play')}
        onPress={() => navigation.navigate('Play')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  gear: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: {
    fontSize: 26,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  brain: {
    fontSize: 110,
  },
  title: {
    color: colors.primary,
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: colors.border,
    textShadowOffset: { width: 3, height: 4 },
    textShadowRadius: 0,
  },
  tagline: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  stats: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    gap: 2,
  },
  stat: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  statMuted: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  rules: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
  },
});
