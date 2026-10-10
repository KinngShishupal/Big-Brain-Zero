import React, { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { haptic } from '../services/haptics';
import { colors, glow, gradients, radius, spacing, TOUCH_MIN } from '../theme';

export type ButtonVariant =
  | 'pink'
  | 'violet'
  | 'cyan'
  | 'lime'
  | 'red'
  | 'gold'
  | 'glass';

interface Props {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: string;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

const DARK_TEXT: ReadonlySet<ButtonVariant> = new Set(['lime', 'gold', 'cyan']);

function ButtonImpl({
  label,
  onPress,
  variant = 'pink',
  icon,
  disabled,
  small,
  style,
}: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glass = variant === 'glass';

  return (
    <Animated.View style={[animated, style, disabled && styles.disabled]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.94, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        }}
        onPress={() => {
          haptic('tap');
          onPress();
        }}
        style={[
          styles.base,
          small && styles.small,
          glass
            ? styles.glass
            : { backgroundImage: gradients[variant], boxShadow: glow[variant] },
        ]}
      >
        {/* Top highlight for a glossy, modern feel. */}
        {!glass && <View pointerEvents="none" style={styles.shine} />}
        <Text
          style={[
            styles.label,
            small && styles.labelSmall,
            DARK_TEXT.has(variant) && styles.labelDark,
          ]}
          numberOfLines={2}
        >
          {icon ? `${icon}  ${label}` : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export const Button = memo(ButtonImpl);

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_MIN + 10,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  small: {
    minHeight: TOUCH_MIN,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  glass: {
    backgroundImage: gradients.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundImage:
      'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)',
  },
  label: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  labelSmall: {
    fontSize: 15,
  },
  labelDark: {
    color: '#120A2E',
  },
  disabled: {
    opacity: 0.4,
  },
});
