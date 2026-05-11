import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguageDirection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
    
    // Optional: add a class to body for font styling based on language
    document.body.className = document.body.className.replace(/\blang-[a-z]{2}\b/g, '');
    document.body.classList.add(`lang-${i18n.language}`);
  }, [i18n.language]);
}
