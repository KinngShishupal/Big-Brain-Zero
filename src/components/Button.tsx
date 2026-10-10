import React, { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { haptic } from '../services/haptics';
import { colors, radius, spacing, TOUCH_MIN } from '../theme';

type Variant = 'primary' | 'secondary' | 'lime' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}

const BG: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.secondary,
  lime: colors.lime,
  ghost: colors.surface,
  danger: colors.danger,
};

function ButtonImpl({
  label,
  onPress,
  variant = 'primary',
  disabled,
  small,
  style,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        haptic('tap');
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        {
          backgroundColor: BG[variant],
          borderBottomWidth: pressed ? 3 : 7,
          marginTop: pressed ? 4 : 0,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          small && styles.labelSmall,
          variant === 'ghost' && styles.ghostLabel,
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export const Button = memo(ButtonImpl);

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_MIN + 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    minHeight: TOUCH_MIN,
    paddingHorizontal: spacing.md,
  },
  label: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: colors.border,
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 0,
  },
  labelSmall: {
    fontSize: 15,
  },
  ghostLabel: {
    color: colors.text,
    textShadowRadius: 0,
    textShadowOffset: { width: 0, height: 0 },
  },
});
