import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../app/navigation/types';
import { Backdrop } from '../components/Backdrop';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { useT } from '../i18n';
import { haptic } from '../services/haptics';
import { useSaveStore, type Language } from '../store/saveStore';
import { colors, gradients, radius, spacing, TOUCH_MIN } from '../theme';
import { version } from '../../package.json';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी' },
];

export function SettingsScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const settings = useSaveStore(s => s.settings);
  const setHaptics = useSaveStore(s => s.setHaptics);
  const setLanguage = useSaveStore(s => s.setLanguage);

  const confirmReset = () => {
    Alert.alert(
      t('settings.resetConfirmTitle'),
      t('settings.resetConfirmBody'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.confirmReset'),
          style: 'destructive',
          onPress: () => {
            useSaveStore.getState().resetProgress();
            haptic('success');
          },
        },
      ],
    );
  };

  return (
    <Backdrop>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        <GlassCard>
          <View style={styles.row}>
            <Text style={styles.label}>📳 {t('settings.haptics')}</Text>
            <Switch
              value={settings.haptics}
              onValueChange={value => {
                setHaptics(value);
                haptic('tap');
              }}
              trackColor={{
                true: colors.violet,
                false: 'rgba(255,255,255,0.2)',
              }}
              thumbColor={settings.haptics ? colors.pink : '#DDD'}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.gap}>
          <Text style={styles.label}>🌐 {t('settings.language')}</Text>
          <View style={styles.segment}>
            {LANGUAGES.map(lang => {
              const active = settings.language === lang.id;
              return (
                <Pressable
                  key={lang.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    haptic('tap');
                    setLanguage(lang.id);
                  }}
                  style={[styles.segmentItem, active && styles.segmentActive]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <Button
          variant="red"
          icon="🗑️"
          label={t('settings.reset')}
          onPress={confirmReset}
        />
        <Text style={styles.version}>{t('settings.version', { version })}</Text>
      </ScrollView>
    </Backdrop>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  back: {
    width: TOUCH_MIN,
    height: TOUCH_MIN,
    borderRadius: TOUCH_MIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  backText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  row: {
    minHeight: TOUCH_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gap: {
    gap: spacing.md,
  },
  label: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  segmentItem: {
    flex: 1,
    minHeight: TOUCH_MIN,
    borderRadius: radius.md - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundImage: gradients.violet,
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: colors.text,
  },
  version: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: 12,
  },
});
