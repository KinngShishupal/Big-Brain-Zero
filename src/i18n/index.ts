import { useCallback } from 'react';
import { useSaveStore, type Language } from '../store/saveStore';

import { en, type TranslationKey } from './en';
import { hi } from './hi';

export type { TranslationKey };

const dictionaries: Record<Language, Record<TranslationKey, string>> = {
  en,
  hi,
};

export type TranslateParams = Record<string, string | number>;

export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslateParams,
): string {
  const template = dictionaries[language][key] ?? en[key];
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export type Translate = (
  key: TranslationKey,
  params?: TranslateParams,
) => string;

export function useT(): Translate {
  const language = useSaveStore(s => s.settings.language);
  return useCallback<Translate>(
    (key, params) => translate(language, key, params),
    [language],
  );
}
