// @ts-nocheck
import { useState, useEffect } from 'react';
import { Locale, localeFlags, loadLocale, getBrowserLocale } from '@/lib/i18n-utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('locale') as Locale;
    return saved || getBrowserLocale();
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
    if (locale === 'ar') { // Example if we add RTL later
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [locale]);

  const t = loadLocale(locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {localeFlags[locale]} {locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(localeFlags) as Locale[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLocale(lang)}
            className={locale === lang ? 'bg-muted' : ''}
          >
            {localeFlags[lang]} {t.navigation?.[lang] || lang.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}