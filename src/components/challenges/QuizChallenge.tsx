import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Question } from '../../data/questions';
import { scoreQuiz } from '../../engine/stupid';
import { useT } from '../../i18n';
import { useSaveStore } from '../../store/saveStore';
import { colors, spacing } from '../../theme';
import { Button } from '../Button';

interface Props {
  question: Question;
  order: number[];
  onDone: (points: number) => void;
}

const VARIANTS = ['primary', 'secondary', 'lime', 'danger'] as const;

export function QuizChallenge({ question, order, onDone }: Props) {
  const t = useT();
  const lang = useSaveStore(s => s.settings.language);

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{t('quiz.prompt')}</Text>
      <Text style={styles.question}>{question[lang]}</Text>
      <View style={styles.answers}>
        {order.map((answerIndex, i) => {
          const answer = question.answers[answerIndex];
          return (
            <Button
              key={answerIndex}
              label={answer[lang]}
              variant={VARIANTS[i]}
              onPress={() => onDone(scoreQuiz(answer))}
            />
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
    gap: spacing.lg,
  },
  prompt: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  question: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  answers: {
    gap: spacing.md,
  },
});
