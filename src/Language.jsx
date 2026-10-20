import { createContext, useContext, useEffect, useState } from 'react';
import welsh from './welsh.json';
const LanguageContext = createContext(null);
const patterns = Object.entries(welsh).filter(([key]) => /\{\d+\}/.test(key)).sort(([a], [b]) => b.replace(/\{\d+\}/g, '').length - a.replace(/\{\d+\}/g, '').length).map(([key, value]) => {
  const escaped = key.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{\d+\}/g, '(.*?)');
  return [new RegExp(`^${escaped}$`), value];
});
export function translate(text, language, ...values) {
  if (values.length) {
    const template = language === 'cy' ? welsh[text] ?? text : text;
    return template.replace(/\{(\d+)\}/g, (_, index) => String(values[Number(index)] ?? ''));
  }
  if (language !== 'cy' || typeof text !== 'string') return text;
  if (Object.hasOwn(welsh, text)) return welsh[text];
  for (const [pattern, translation] of patterns) {
    const match = pattern.exec(text);
    if (match) return translation.replace(/\{(\d+)\}/g, (_, index) => match[Number(index) + 1]);
  }
  return text;
}
export function LanguageProvider({
  children
}) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('vibetracker.language') === 'cy' ? 'cy' : 'en';
    } catch {
      return 'en';
    }
  });
  const [message, setMessage] = useState('');
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate('Vibecoding Project Tracker', language);
  }, [language]);
  function setLanguage(next) {
    setLanguageState(next);
    try {
      localStorage.setItem('vibetracker.language', next);
      setMessage('');
    } catch {
      setMessage('Language changed for this visit. Browser storage is unavailable.');
    }
  }
  return <LanguageContext.Provider value={{
    language,
    setLanguage,
    message,
    t: (text, ...values) => translate(text, language, ...values)
  }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  return useContext(LanguageContext);
}
export function LanguageSelect() {
  const {
    language,
    setLanguage,
    message,
    t
  } = useLanguage();
  return <div className="mt-4">
    <label htmlFor="language" className="mb-1 block text-xs font-semibold text-ink-muted">{t('Language')}</label>
    <select id="language" value={language} onChange={event => setLanguage(event.target.value)} className="w-full rounded-md border border-border-subtle bg-surface-card px-3 py-2 text-sm text-ink-primary">
      <option value="en" lang="en">English</option><option value="cy" lang="cy">Cymraeg</option>
    </select>
    <p role="status" className={message ? 'mt-2 text-xs text-ink-muted' : 'sr-only'}>{t(message)}</p>
  </div>;
}
