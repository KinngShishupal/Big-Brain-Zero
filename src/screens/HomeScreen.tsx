import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../app/navigation/types';
import { Backdrop } from '../components/Backdrop';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { useT } from '../i18n';
import { haptic } from '../services/haptics';
import { useSaveStore } from '../store/saveStore';
import { colors, radius, spacing, TOUCH_MIN } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const RULES = ['🤪', '🐢', '🔴', '🐔'];

export function HomeScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const bestIq = useSaveStore(s => s.bestIq);
  const gamesPlayed = useSaveStore(s => s.gamesPlayed);

  // The brain floats and wobbles, as brains do.
  const float = useSharedValue(0);
  const halo = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    halo.value = withRepeat(withTiming(1, { duration: 2400 }), -1, true);
  }, [float, halo]);

  const brainStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -14 * float.value },
      { rotate: `${(float.value - 0.5) * 14}deg` },
    ],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + halo.value * 0.35,
    transform: [{ scale: 0.92 + halo.value * 0.16 }],
  }));

  return (
    <Backdrop>
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.topBar}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>🎮 {gamesPlayed}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={8}
            style={({ pressed }) => [
              styles.gear,
              pressed && styles.gearPressed,
            ]}
            onPress={() => {
              haptic('tap');
              navigation.navigate('Settings');
            }}
          >
            <Text style={styles.gearIcon}>⚙️</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.brainStage}>
            <Animated.View style={[styles.halo, haloStyle]} />
            <Animated.Image
              source={require('../assets/logo.png')}
              style={[styles.brain, brainStyle]}
              accessibilityIgnoresInvertColors
            />
          </View>

          <Animated.Text
            entering={FadeInDown.delay(100).springify()}
            style={styles.title}
          >
            {t('app.title')}
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(200).springify()}
            style={styles.tagline}
          >
            {t('app.tagline')}
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.full}
          >
            <GlassCard style={styles.statCard}>
              <Text style={styles.statLabel}>{t('home.bestLabel')}</Text>
              <Text style={styles.statValue}>{bestIq ?? '—'}</Text>
              <Text style={styles.statHint}>
                {bestIq === null ? t('home.noBest') : t('home.lowerIsBetter')}
              </Text>
            </GlassCard>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={styles.rules}
          >
            {RULES.map(r => (
              <View key={r} style={styles.ruleChip}>
                <Text style={styles.ruleEmoji}>{r}</Text>
              </View>
            ))}
          </Animated.View>
          <Animated.Text
            entering={FadeInDown.delay(450).springify()}
            style={styles.rulesText}
          >
            {t('home.rules')}
          </Animated.Text>
        </View>

        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <Button
            label={t('home.play')}
            icon="🤪"
            onPress={() => navigation.navigate('Play')}
          />
        </Animated.View>
      </View>
    </Backdrop>
  );
}

const BRAIN = 150;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chipText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  gear: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: TOUCH_MIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  gearPressed: {
    backgroundColor: colors.glassStrong,
  },
  gearIcon: {
    fontSize: 22,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  brainStage: {
    width: BRAIN * 1.6,
    height: BRAIN * 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: BRAIN * 1.5,
    height: BRAIN * 1.5,
    borderRadius: BRAIN,
    backgroundImage:
      'radial-gradient(circle, rgba(255,79,216,0.55) 0%, rgba(139,92,255,0.25) 45%, transparent 70%)',
  },
  brain: {
    width: 170,
    height: 170,
  },
  title: {
    color: colors.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 79, 216, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  tagline: {
    color: colors.cyan,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  full: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  statCard: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '900',
    textShadowColor: 'rgba(46, 230, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  statHint: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '700',
  },
  rules: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ruleChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  ruleEmoji: {
    fontSize: 22,
  },
  rulesText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
