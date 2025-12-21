import {defaultLang, ui} from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang], ...args: any[]) {
    let translation = ui[lang][key] || ui[defaultLang][key];
    if (args.length > 0) {
      args.forEach((arg, index) => {
        translation = translation.replace(`{${index}}`, arg);
      });
    }
    return translation;
  }
}
