import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInDown } from 'react-native-reanimated';
import { useT, type TranslationKey } from '../i18n';
import { colors, gradients, radius, spacing } from '../theme';
import { Button } from './Button';

const RULES: { icon: string; key: TranslationKey }[] = [
  { icon: '🤪', key: 'howTo.dumb' },
  { icon: '🤓', key: 'howTo.smart' },
  { icon: '🐢', key: 'howTo.slow' },
  { icon: '🔴', key: 'howTo.rules' },
  { icon: '🏆', key: 'howTo.win' },
];

const EASE_OUT = Easing.out(Easing.cubic);

interface Props {
  visible: boolean;
  onDone: () => void;
}

/** First-run "How to play". Shown once, right before the player's first game. */
export function HowToPlayModal({ visible, onDone }: Props) {
  const t = useT();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDone}
    >
      <View style={styles.backdrop}>
        <Animated.View
          entering={FadeInDown.duration(320).easing(EASE_OUT)}
          style={styles.card}
        >
          <Image />
          <Text style={styles.title}>{t('howTo.title')}</Text>
          <View style={styles.list}>
            {RULES.map((rule, i) => (
              <Animated.View
                key={rule.key}
                entering={FadeIn.delay(150 + i * 90).duration(260)}
                style={styles.rule}
              >
                <View style={styles.iconBubble}>
                  <Text style={styles.icon}>{rule.icon}</Text>
                </View>
                <Text style={styles.text}>{t(rule.key)}</Text>
              </Animated.View>
            ))}
          </View>
          <Button label={t('howTo.go')} icon="🤪" onPress={onDone} />
        </Animated.View>
      </View>
    </Modal>
  );
}

function Image() {
  return (
    <Animated.Image
      source={require('../assets/logo.png')}
      style={styles.logo}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundImage: 'linear-gradient(180deg, #2A1466 0%, #160B3A 100%)',
    boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.5)',
  },
  logo: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    marginTop: -70,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 79, 216, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  list: {
    gap: spacing.md,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: gradients.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  icon: {
    fontSize: 22,
  },
  text: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
});
