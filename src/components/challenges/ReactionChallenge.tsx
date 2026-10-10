import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { REACTION_TIMEOUT_MS, scoreReaction } from '../../engine/stupid';
import { useT } from '../../i18n';
import { colors, radius, spacing } from '../../theme';

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

  const finish = (points: number) => {
    if (!done.current) {
      done.current = true;
      onDoneRef.current(points);
    }
  };

  useEffect(() => {
    const goTimer = setTimeout(() => {
      goAt.current = Date.now();
      setGreen(true);
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
  }, [waitMs]);

  const tap = () => {
    if (goAt.current === null) {
      finish(scoreReaction({ early: true }));
    } else {
      finish(
        scoreReaction({ early: false, delayMs: Date.now() - goAt.current }),
      );
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{t('reaction.prompt')}</Text>
      <Pressable
        onPress={tap}
        accessibilityRole="button"
        accessibilityLabel={green ? t('reaction.go') : t('reaction.wait')}
        style={[styles.pad, green ? styles.go : styles.wait]}
      >
        <Text style={styles.emoji}>{green ? '🐢' : '✋'}</Text>
        <Text style={styles.label}>
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
    height: 320,
    borderRadius: radius.lg,
    borderWidth: 4,
    borderColor: colors.border,
    borderBottomWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  wait: {
    backgroundColor: colors.danger,
  },
  go: {
    backgroundColor: colors.lime,
  },
  emoji: {
    fontSize: 80,
  },
  label: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
    textShadowColor: colors.border,
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 0,
  },
});
