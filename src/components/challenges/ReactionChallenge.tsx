import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { REACTION_TIMEOUT_MS, scoreReaction } from '../../engine/stupid';
import { useT } from '../../i18n';
import { playSfx } from '../../services/sound';
import { colors, glow, gradients, radius, spacing } from '../../theme';

interface Props {
  waitMs: number;
  onDone: (points: number) => void;
}

export function ReactionChallenge({ waitMs, onDone }: Props) {
  const t = useT();
  const [green, setGreen] = useState(false);
  const goAt = useRef<number | null>(null);
  const done = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const pulse = useSharedValue(0);

  const finish = (points: number) => {
    if (!done.current) {
      done.current = true;
      onDoneRef.current(points);
    }
  };

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    const goTimer = setTimeout(() => {
      goAt.current = Date.now();
      setGreen(true);
      playSfx('ding');
    }, waitMs);
    // Never tapping at all is the slowest possible reaction.
    const giveUp = setTimeout(() => {
      if (!done.current) {
        done.current = true;
        onDoneRef.current(
          scoreReaction({ early: false, delayMs: REACTION_TIMEOUT_MS }),
        );
      }
    }, waitMs + REACTION_TIMEOUT_MS);
    return () => {
      clearTimeout(goTimer);
      clearTimeout(giveUp);
    };
  }, [waitMs, pulse]);

  const tap = () => {
    if (goAt.current === null) {
      finish(scoreReaction({ early: true }));
    } else {
      finish(
        scoreReaction({ early: false, delayMs: Date.now() - goAt.current }),
      );
    }
  };

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.12 }],
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{t('reaction.prompt')}</Text>
      <Pressable
        onPress={tap}
        accessibilityRole="button"
        accessibilityLabel={green ? t('reaction.go') : t('reaction.wait')}
        style={[
          styles.pad,
          green
            ? { backgroundImage: gradients.lime, boxShadow: glow.lime }
            : { backgroundImage: gradients.red, boxShadow: glow.red },
        ]}
      >
        <View style={styles.shine} />
        <Animated.Text style={[styles.emoji, emojiStyle]}>
          {green ? '🐢' : '✋'}
        </Animated.Text>
        <Text style={[styles.label, green && styles.labelDark]}>
          {green ? t('reaction.go') : t('reaction.wait')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  prompt: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  pad: {
    height: 360,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundImage:
      'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)',
  },
  emoji: {
    fontSize: 96,
  },
  label: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  labelDark: {
    color: '#120A2E',
  },
});
