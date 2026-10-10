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
import { openPrivacyOptions, useAds } from '../services/ads';
import { haptic } from '../services/haptics';
import { playSfx } from '../services/sound';
import { useSaveStore, type Language } from '../store/saveStore';
import { colors, gradients, radius, spacing, TOUCH_MIN } from '../theme';
import { version } from '../../package.json';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी' },
];

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={next => {
          onChange(next);
          haptic('tap');
          playSfx('tap');
        }}
        trackColor={{ true: colors.violet, false: 'rgba(255,255,255,0.2)' }}
        thumbColor={value ? colors.pink : '#DDD'}
      />
    </View>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const settings = useSaveStore(s => s.settings);
  const setHaptics = useSaveStore(s => s.setHaptics);
  const setLanguage = useSaveStore(s => s.setLanguage);
  const setSound = useSaveStore(s => s.setSound);
  const setMusic = useSaveStore(s => s.setMusic);
  // Shown only where the consent rules require a way to change ad choices.
  const privacyRequired = useAds(s => s.privacyOptionsRequired);

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

        <GlassCard style={styles.toggles}>
          <ToggleRow
            label={`🎵 ${t('settings.music')}`}
            value={settings.music}
            onChange={setMusic}
          />
          <ToggleRow
            label={`🔊 ${t('settings.sound')}`}
            value={settings.sound}
            onChange={setSound}
          />
          <ToggleRow
            label={`📳 ${t('settings.haptics')}`}
            value={settings.haptics}
            onChange={setHaptics}
          />
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

        {privacyRequired && (
          <Button
            variant="glass"
            icon="🔒"
            label={t('settings.privacy')}
            onPress={() => {
              openPrivacyOptions().catch(() => {});
            }}
          />
        )}

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
  toggles: {
    gap: spacing.xs,
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
