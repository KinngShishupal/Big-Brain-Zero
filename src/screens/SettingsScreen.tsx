import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Button } from '../components/Button';
import { useT } from '../i18n';
import { haptic } from '../services/haptics';
import { useSaveStore, type Language } from '../store/saveStore';
import { colors, radius, spacing, TOUCH_MIN } from '../theme';
import { version } from '../../package.json';

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी' },
];

export function SettingsScreen() {
  const t = useT();
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>📳 {t('settings.haptics')}</Text>
          <Switch
            value={settings.haptics}
            onValueChange={value => {
              setHaptics(value);
              haptic('tap');
            }}
            trackColor={{ true: colors.primaryDark, false: colors.textMuted }}
            thumbColor={settings.haptics ? colors.primary : colors.surface}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🌐 {t('settings.language')}</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map(lang => (
            <Button
              key={lang.id}
              small
              label={lang.label}
              variant={settings.language === lang.id ? 'secondary' : 'ghost'}
              style={styles.langButton}
              onPress={() => setLanguage(lang.id)}
            />
          ))}
        </View>
      </View>

      <Button
        variant="danger"
        label={t('settings.reset')}
        onPress={confirmReset}
      />
      <Text style={styles.version}>{t('settings.version', { version })}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.border,
  },
  row: {
    minHeight: TOUCH_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  langButton: {
    flex: 1,
  },
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
  },
});
