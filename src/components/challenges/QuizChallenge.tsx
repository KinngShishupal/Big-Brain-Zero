import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import type { Question } from '../../data/questions';
import { scoreQuiz } from '../../engine/stupid';
import { useT } from '../../i18n';
import { haptic } from '../../services/haptics';
import { playSfx } from '../../services/sound';
import { useSaveStore } from '../../store/saveStore';
import { colors, glow, gradients, radius, spacing } from '../../theme';
import { GlassCard } from '../GlassCard';

interface Props {
  question: Question;
  order: number[];
  onDone: (points: number) => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];
const ACCENTS = ['pink', 'cyan', 'lime', 'gold'] as const;
const SELECT_MS = 320;

export function QuizChallenge({ question, order, onDone }: Props) {
  const t = useT();
  const lang = useSaveStore(s => s.settings.language);
  const [picked, setPicked] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const pick = (answerIndex: number) => {
    if (picked !== null) {
      return;
    }
    haptic('tap');
    playSfx('select');
    setPicked(answerIndex);
    // Let the selection glow for a beat before revealing the verdict.
    timer.current = setTimeout(
      () => onDone(scoreQuiz(question.answers[answerIndex])),
      SELECT_MS,
    );
  };

  return (
    <View style={styles.wrap}>
      <Animated.View entering={ZoomIn.springify().damping(14)}>
        <GlassCard style={styles.card}>
          <Text style={styles.prompt}>🤡 {t('quiz.prompt')}</Text>
          <Text style={styles.question}>{question[lang]}</Text>
        </GlassCard>
      </Animated.View>

      <View style={styles.answers}>
        {order.map((answerIndex, i) => {
          const answer = question.answers[answerIndex];
          const accent = ACCENTS[i];
          const selected = picked === answerIndex;
          const dimmed = picked !== null && !selected;
          return (
            <Animated.View
              key={answerIndex}
              entering={FadeInDown.delay(120 + i * 80)
                .springify()
                .damping(15)}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={answer[lang]}
                onPress={() => pick(answerIndex)}
                style={({ pressed }) => [
                  styles.answer,
                  selected && {
                    backgroundImage: gradients[accent],
                    boxShadow: glow[accent],
                    borderColor: 'transparent',
                  },
                  dimmed && styles.dimmed,
                  pressed && !selected && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.badge,
                    { backgroundImage: gradients[accent] },
                    selected && styles.badgeSelected,
                  ]}
                >
                  <Text style={styles.badgeText}>{LETTERS[i]}</Text>
                </View>
                <Text style={styles.answerText}>{answer[lang]}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  card: {
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  prompt: {
    color: colors.pink,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  question: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 33,
  },
  answers: {
    gap: spacing.md,
  },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
  },
  pressed: {
    backgroundColor: colors.glassStrong,
  },
  dimmed: {
    opacity: 0.35,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSelected: {
    backgroundImage: 'none',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    color: '#120A2E',
    fontSize: 17,
    fontWeight: '900',
  },
  answerText: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
});
