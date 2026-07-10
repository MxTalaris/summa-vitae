import { useStore } from '../store/useStore';
import en from './en.json';
import ptBr from './pt-br.json';

export type Translations = typeof en;
export type CvLanguage = 'en' | 'pt-br';

export const LANGUAGES: { id: CvLanguage; label: string; short: string }[] = [
  { id: 'en',    label: 'English',        short: 'EN' },
  { id: 'pt-br', label: 'Português (BR)', short: 'PT' },
];

const TRANSLATIONS: Record<CvLanguage, Translations> = {
  'en':    en,
  'pt-br': ptBr as unknown as Translations,
};

export function useTranslations(): Translations {
  const lang = useStore((s) => s.cvLanguage);
  return TRANSLATIONS[lang] ?? en;
}

export function getTranslations(lang: CvLanguage): Translations {
  return TRANSLATIONS[lang] ?? en;
}
