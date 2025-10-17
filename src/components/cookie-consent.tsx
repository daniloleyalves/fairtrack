'use client';

import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import { cookiesConfig } from '../../public/cookieconsent-config';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import { Button } from './ui/button';

export function CookieConsentComponent() {
  useEffect(() => {
    CookieConsent.run(cookiesConfig);
  }, []);
  return (
    <Button
      variant='link'
      onClick={CookieConsent.showPreferences}
      className='text-normal h-4 px-0'
    >
      Cookie-Einstellungen
    </Button>
  );
}
