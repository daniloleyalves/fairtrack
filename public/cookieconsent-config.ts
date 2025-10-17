import type CookieConsent from 'vanilla-cookieconsent';

export const cookiesConfig: CookieConsent.CookieConsentConfig = {
  autoShow: true,
  mode: 'opt-in',

  cookie: {
    name: 'cc_cookie',
    expiresAfterDays: 182,
  },

  guiOptions: {
    consentModal: {
      layout: 'cloud inline',
      position: 'bottom center',
      equalWeightButtons: true,
      flipButtons: false,
    },
    preferencesModal: {
      layout: 'box',
      equalWeightButtons: true,
      flipButtons: false,
    },
  },

  categories: {
    necessary: {
      enabled: true,
      readOnly: true,
    },
  },

  language: {
    default: 'de',
    autoDetect: 'browser',
    translations: {
      de: {
        consentModal: {
          title: 'Hinweis zu Cookies',
          description:
            'Wir verwenden ausschließlich technisch notwendige Cookies, die für den Betrieb dieser Website erforderlich sind. Es werden keine Cookies zu Analyse-, Marketing- oder Werbezwecken gesetzt. Durch die Nutzung der Seite erklärst du dich damit einverstanden.',
          acceptAllBtn: 'OK',
          footer: `
            <a href="/impressum">Impressum</a>
            <a href="/datenschutz">Datenschutz</a>
          `,
        },
        preferencesModal: {
          title: 'Information zu Cookies',
          acceptAllBtn: 'OK',
          closeIconLabel: 'Schließen',
          savePreferencesBtn: 'Schließen',
          sections: [
            {
              title: 'Nur funktionale Cookies',
              description:
                'Diese Website verwendet ausschließlich funktionale, technisch notwendige Cookies. Sie ermöglichen den sicheren und stabilen Betrieb und speichern keine persönlichen oder marketingrelevanten Daten.',
              linkedCategory: 'necessary',
            },
            {
              title: 'Keine Analyse- oder Werbecookies',
              description:
                'Wir setzen keine Cookies zu Statistik-, Analyse- oder Werbezwecken. Deine Privatsphäre bleibt vollständig gewahrt.',
            },
            {
              title: 'Weitere Informationen',
              description:
                'Mehr Details findest du in unserer <a href="/datenschutz">Datenschutzerklärung</a>.',
            },
          ],
        },
      },
      en: {
        consentModal: {
          title: 'Cookie Notice',
          description:
            'We only use functional cookies that are necessary for the operation of this website. No analytics, marketing, or advertising cookies are used. By continuing to browse, you agree to this.',
          acceptAllBtn: 'OK',
          footer: `
            <a href="/impressum">Legal Notice</a>
            <a href="/datenschutz">Privacy Policy</a>
          `,
        },
        preferencesModal: {
          title: 'Information about Cookies',
          acceptAllBtn: 'OK',
          closeIconLabel: 'Close',
          savePreferencesBtn: 'Close',
          sections: [
            {
              title: 'Only Functional Cookies',
              description:
                'This website uses only functional, technically necessary cookies. They ensure secure and stable operation and do not store personal or marketing-related data.',
              linkedCategory: 'necessary',
            },
            {
              title: 'No Analytics or Advertising Cookies',
              description:
                'We do not use any cookies for analytics, statistics, or advertising. Your privacy is fully protected.',
            },
            {
              title: 'More Information',
              description:
                'For details, please visit our <a href="/datenschutz">Privacy Policy</a>.',
            },
          ],
        },
      },
    },
  },
};
