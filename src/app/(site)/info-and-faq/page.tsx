import { BlurFade } from '@/components/magicui/blur-fade';
import { SectionNav } from '@/components/site/section-nav';
import { Illustrations } from '@/lib/assets/illustrations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/lib/config/site-config';
import {
  CalendarDays,
  ClipboardPen,
  History,
  LayoutDashboard,
  Map,
  Settings,
  Smartphone,
  Wrench,
} from 'lucide-react';

const SECTIONS = [
  { id: 'ueberblick', title: 'Überblick' },
  { id: 'bedienkonzept-nutzer', title: 'Für Foodsaver:innen' },
  { id: 'bedienkonzept-fairteiler', title: 'Für Fairteiler' },
  { id: 'daten-privatsphaere', title: 'Daten & Privatsphäre' },
  { id: 'ueber-das-projekt', title: 'Über das Projekt' },
  { id: 'haeufig-gestellte-fragen', title: 'FAQ' },
  { id: 'fehlersuche-support', title: 'Fehlersuche & Support' },
];

const FAQ_GROUPS: {
  group: string;
  items: { question: string; answer: string }[];
}[] = [
  {
    group: 'Allgemeine Fragen',
    items: [
      {
        question: 'Kostet die Nutzung von FairTrack etwas?',
        answer:
          'Nein, FairTrack ist kostenlos für alle Nutzenden und Fairteiler-Betreibende.',
      },
      {
        question:
          'Muss ich einen Account erstellen, um Lebensmittel abzugeben?',
        answer:
          'Nein. An Fairteilern mit Gast-Zugangsprofil kannst du ohne eigenen Account abgeben. Ein persönlicher Account bietet dir aber Statistiken und in Zukunft Community-Features.',
      },
      {
        question: 'Kann ich FairTrack auch ohne Smartphone nutzen?',
        answer:
          'Ja. An Fairteilern gibt es stationäre Tablets für die Erfassung. Für persönliche Statistiken brauchst du aber einen eigenen Zugriff auf die Plattform.',
      },
      {
        question: 'Ist FairTrack eine Alternative zu foodsharing.de?',
        answer:
          'Nein. FairTrack ergänzt foodsharing.de, ersetzt es aber nicht. Organisation und Abholungen laufen weiterhin über foodsharing.de. FairTrack dient ausschließlich der Erfassung am Fairteiler.',
      },
    ],
  },
  {
    group: 'Account und Anmeldung',
    items: [
      {
        question: 'Ich habe mein Passwort vergessen. Was kann ich tun?',
        answer:
          'Klicke auf der Anmeldeseite auf „Passwort vergessen" und folge den Anweisungen. Du erhältst einen Link zum Zurücksetzen per E-Mail.',
      },
      {
        question: 'Kann ich meine E-Mail-Adresse ändern?',
        answer:
          'Nein, derzeit ist es noch nicht möglich, die eigene Account-E-Mail zu ändern.',
      },
      {
        question: 'Was passiert, wenn ich meinen Account lösche?',
        answer:
          'Alle personenbezogenen Daten werden gelöscht. Deine Abgaben bleiben anonymisiert in den Fairteiler-Statistiken erhalten. Die Löschung ist unwiderruflich.',
      },
    ],
  },
  {
    group: 'Erfassung und Abgaben',
    items: [
      {
        question: 'Wie genau muss ich Mengen angeben?',
        answer:
          'Schätzungen sind in Ordnung. Bei Unsicherheit lieber konservativ schätzen. Waagen sind hilfreich, aber nicht zwingend erforderlich.',
      },
      {
        question: 'Kann ich eine falsche Abgabe korrigieren?',
        answer:
          'Nein, aber Inhaber:innen eines Fairteilers können Abgaben ihres Fairteilers korrigieren. Kontaktiere diese, wenn dir ein grober Fehler passiert ist.',
      },
      {
        question: 'Warum wird das Abgabeformular nicht freigeschaltet?',
        answer:
          'Du musst dich in einem 20m-Radius um den Fairteiler befinden und die Standortfreigabe aktiviert haben.',
      },
      {
        question: 'Kann ich mehrere Abgaben nacheinander erfassen?',
        answer:
          'Ja. Im Formular hast du die Möglichkeit, mehrere Lebensmittel auf einmal anzulegen.',
      },
    ],
  },
  {
    group: 'Fairteiler-Verwaltung',
    items: [
      {
        question: 'Wie werde ich Mitglied eines Fairteilers?',
        answer:
          'Du musst von einem/einer Inhaber:in eingeladen werden. Eine Selbst-Registrierung als Mitglied ist nicht möglich.',
      },
      {
        question: 'Kann ich die Rolle eines Mitglieds nachträglich ändern?',
        answer:
          'Ja. Als Inhaber:in kannst du Rollen jederzeit anpassen oder entfernen.',
      },
      {
        question:
          'Was ist der Unterschied zwischen einem Mitglied und einem Zugangsprofil?',
        answer:
          'Mitglieder sind echte Personen mit individuellen Accounts. Zugangsprofile sind unpersönliche Zugänge für Geräte (z.B. Gast-Tablet).',
      },
      {
        question: 'Kann ich einen Fairteiler vorübergehend schließen?',
        answer:
          'Ja. Als Inhaber:in kannst du die Sichtbarkeit deaktivieren. Der Fairteiler verschwindet von der Karte, Daten bleiben erhalten.',
      },
    ],
  },
  {
    group: 'Gamification',
    items: [
      {
        question: 'Wie funktionieren Streaks genau?',
        answer:
          'Eine Streak zählt zusammenhängende Wochen (Montag–Sonntag) mit mindestens einer Abgabe. Eine Abgabe pro Woche reicht aus.',
      },
      {
        question: 'Kann ich Gamification komplett abschalten?',
        answer:
          'Ja. In den Einstellungen kannst du Meilensteine und Streaks deaktivieren. Deine Daten bleiben erhalten.',
      },
      {
        question: 'Werden Meilensteine öffentlich angezeigt?',
        answer: 'Nein, nur du selbst siehst deine Meilensteine.',
      },
    ],
  },
  {
    group: 'Technische Fragen',
    items: [
      {
        question: 'Funktioniert FairTrack auch offline?',
        answer:
          'Nein. Eine aktive Internetverbindung ist erforderlich, da Daten in Echtzeit synchronisiert werden.',
      },
      {
        question: 'Gibt es eine App für iOS/Android?',
        answer:
          'Aktuell nicht. FairTrack ist als responsive Webapp optimiert und funktioniert im mobilen Browser. Du kannst die Plattform jedoch als Webapp auf deinem Gerät installieren. Die Browserleiste ist dann versteckt :)',
      },
      {
        question: 'Kann ich FairTrack auf mehreren Geräten nutzen?',
        answer:
          'Ja. Melde dich einfach mit deinem Account auf jedem Gerät an. Daten werden automatisch synchronisiert.',
      },
    ],
  },
];

const TROUBLESHOOTING: { problem: string; steps: string[] }[] = [
  {
    problem: 'Seite lädt nicht oder reagiert nicht',
    steps: [
      'Internetverbindung prüfen',
      'Seite aktualisieren (F5 oder Strg+R)',
      'Browser-Cache leeren (Strg+Shift+Entf)',
    ],
  },
  {
    problem: 'Anmeldung funktioniert nicht',
    steps: [
      'Benutzername und Passwort auf Tippfehler überprüfen',
      'Nutze die „Passwort vergessen"-Funktion',
    ],
  },
  {
    problem: 'Formular lässt sich nicht absenden',
    steps: [
      'Internetverbindung prüfen',
      'Prüfen, ob alle Pflichtfelder ausgefüllt sind',
    ],
  },
  {
    problem: 'Abgabe erscheint nicht',
    steps: [
      '10–20 Sekunden warten und die Seite aktualisieren (F5 oder Strg+R)',
      'Filter-Einstellungen prüfen',
    ],
  },
  {
    problem: 'Abgabeformular wird nicht freigeschaltet',
    steps: [
      'Sicherstellen, dass die Standortfreigabe im Browser aktiviert ist',
      'Prüfen, ob man sich tatsächlich am Fairteiler-Standort befindet (Radius grün, statt blau)',
      'Prüfen, ob GPS/Standortdienste aktiviert sind',
      'Bei iOS: In den Einstellungen prüfen, ob Safari/Browser Standortzugriff hat',
    ],
  },
];

export default function FairTrackInfo() {
  return (
    <div className='mb-8 px-4 sm:px-0 2xl:mb-56'>
      <div className='flex w-full flex-col items-start gap-2 pt-10 lg:w-2/3'>
        <h1 className='font-londrina text-5xl font-semibold tracking-wider text-primary'>
          Informationen & FAQ
        </h1>
        <p className='text-md font-medium text-muted-foreground'>
          Umfassende Informationen über FairTrack – das digitale Tracking-Tool
          für Fairteilerstandorte. Hier findest du alles über Funktionen,
          Bedienung, Datenschutz und das Projekt dahinter.
        </p>
      </div>

      <div className='mt-10 flex items-start gap-10'>
        <aside className='sticky top-20 hidden w-56 shrink-0 lg:block'>
          <SectionNav sections={SECTIONS} />
          <Image
            src={Illustrations.faqIllustration}
            alt=''
            className='mt-10 w-44'
            loading='lazy'
          />
        </aside>

        <div className='min-w-0 flex-1 space-y-8 lg:max-w-4xl'>
          {/* Überblick */}
          <InfoSection id='ueberblick' title='Überblick'>
            <p>
              In Deutschland landen jedes Jahr über 18 Millionen Tonnen
              Lebensmittel in der Tonne. Das entspricht der Hälfte unserer
              produzierten Nahrungsmittel. Vieles davon wäre noch genießbar und
              wird aus Überproduktionsgründen, falschem Kaufverhalten oder
              optischen Mängeln entsorgt. Gegen diese Verschwendung engagieren
              sich Initiativen wie Foodsharing e.V. und viele Privatpersonen,
              indem sie aktiv Lebensmittel retten.
            </p>
            <p>
              <strong>FairTrack</strong> ist ein digitales Tracking-Tool für
              Fairteilerstandorte, das entwickelt wurde, um dieses Engagement
              sichtbar und mit validen Zahlen belegbar zu machen. Es erfasst
              Lebensmittelabgaben vor Ort einfach, einheitlich und
              nachvollziehbar und macht sichtbar, wie viele Lebensmittel
              tatsächlich gerettet werden. So liefert FairTrack verlässliche
              Kennzahlen für die interne Steuerung, für die
              Öffentlichkeitsarbeit und für Förderanträge.
            </p>
            <p>
              Fairteiler erhalten eigene Bereiche mit anpassbaren
              Abgabeformularen, Kalendern und Auswertungen, um ihre Abläufe
              flexibel zu steuern. Foodsaver profitieren von persönlichen
              Dashboards mit anschaulichen Statistiken, Abgabekalendern und
              kleinen Anreizen wie Meilensteinen.
            </p>
            <p>
              Auf diese Weise wird die Wirkung von Foodsharing an Fairteilern
              transparent, das Engagement der Beteiligten gestärkt und jedes
              gerettete Lebensmittel sichtbar.
            </p>

            <div className='mt-6 grid gap-4 md:grid-cols-2'>
              <FactCard title='Zielgruppe'>
                Betreibende von Fairteiler-Stationen, Foodsharing-Cafés und
                Initiativen, die Abgaben standardisiert dokumentieren und
                auswerten möchten.
              </FactCard>
              <FactCard title='Nutzungskontext'>
                Vor Ort am Fairteiler auf Tablet oder Smartphone. Nicht für den
                Privat-Austausch zwischen Einzelpersonen gedacht.
              </FactCard>
              <FactCard title='System- und Konzeptgrenze'>
                Organisation (Abholungen, Teams, Rollen) bleibt auf
                foodsharing.de. FairTrack deckt ausschließlich das Erfassen der
                Abgaben am Standort ab.
              </FactCard>
              <FactCard title='Technische Voraussetzungen'>
                Aktuelle Browser, stabile Internetverbindung; für Dauerbetrieb
                empfiehlt sich ein stationäres Tablet mit Stromversorgung.
              </FactCard>
            </div>
          </InfoSection>

          {/* Für Foodsaver:innen */}
          <InfoSection id='bedienkonzept-nutzer' title='Für Foodsaver:innen'>
            <p>
              Dein persönlicher Bereich bei FairTrack – vom ersten Login bis zur
              Rettungshistorie.
            </p>
            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
              <FeatureItem
                icon={<LayoutDashboard className='size-5' />}
                title='Dashboard'
              >
                Der persönliche Startbereich zeigt auf einen Blick die
                wichtigsten Informationen: aktuelle Statistiken zu den eigenen
                Rettungsaktionen, einen Abgabekalender und bereits erreichte
                Meilensteine.
              </FeatureItem>
              <FeatureItem
                icon={<Map className='size-5' />}
                title='Fairteiler-Finder'
              >
                Eine interaktive Karte zeigt alle registrierten
                Fairteiler-Standorte in der Umgebung. Hier kannst du gezielt
                nach Standorten suchen und Informationen für deine Abgabe
                finden.
              </FeatureItem>
              <FeatureItem
                icon={<ClipboardPen className='size-5' />}
                title='Retteformular'
              >
                Das Herzstück der Anwendung: das Formular zum Abgeben von
                Lebensmitteln. Es wird nur am jeweiligen Fairteiler-Standort
                freigeschaltet und ist über die Fairteiler-Karte erreichbar.
              </FeatureItem>
              <FeatureItem
                icon={<History className='size-5' />}
                title='Meine Beiträge'
              >
                Eine tabellarische Übersicht aller getätigten Abgaben. Hier
                siehst du, wann und wo du welche Lebensmittel abgegeben hast.
              </FeatureItem>
              <FeatureItem
                icon={<Settings className='size-5' />}
                title='Einstellungen'
              >
                Zentrale Verwaltung von Profil, Privatsphäre-Einstellungen und
                Account-Optionen.
              </FeatureItem>
              <FeatureItem
                icon={<CalendarDays className='size-5' />}
                title='Erste Schritte'
              >
                Melde dich einfach mit deiner E-Mail-Adresse an und schon ist
                dein persönliches FairTrack-Konto aktiv. Ab sofort kannst du
                deine Abgaben über das digitale Retteformular eintragen.
              </FeatureItem>
            </div>
            <Callout icon={<Smartphone className='size-5' />}>
              <strong>Empfehlung:</strong> Installiere FairTrack als Web-App auf
              deinem Smartphone für schnellen Zugriff direkt vor Ort!
            </Callout>
          </InfoSection>

          {/* Für Fairteiler */}
          <InfoSection id='bedienkonzept-fairteiler' title='Für Fairteiler'>
            <p>
              Der Fairteiler-Bereich ist die Verwaltungszentrale für jeden
              registrierten Fairteiler-Standort. Je nach Rolle haben eingeladene
              Mitglieder des Fairteilers Zugriff auf unterschiedliche
              Funktionen, die eine flexible und bedarfsgerechte Verwaltung
              ermöglichen.
            </p>

            <h3 className='mt-6 mb-4 text-lg font-semibold'>
              Rollensystem und Funktionsumfang
            </h3>
            <div className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Badge variant='secondary'>Mitglieder</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='mb-3 text-sm'>
                    Haben Zugriff auf die grundlegenden Funktionen zur aktiven
                    Nutzung des Fairteiler-Bereichs:
                  </p>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    <li>
                      • <strong>Dashboard:</strong> Übersicht über aktuelle
                      Aktivitäten und Statistiken des Fairteilers
                    </li>
                    <li>
                      • <strong>Retteformular:</strong> Das zentrale
                      Erfassungstool für gerettete Lebensmittel
                    </li>
                    <li>
                      • <strong>Verlauf:</strong> Auflistung aller Abgaben am
                      jeweiligen Fairteiler
                    </li>
                    <li>
                      • <strong>Statistiken:</strong> Auswertungen zu
                      Rettungsmengen, Häufigkeiten und Trends
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Badge variant='default'>Inhaber:innen</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='mb-3 text-sm'>
                    Verfügen über alle Mitglieder-Funktionen plus erweiterte
                    Verwaltungsrechte:
                  </p>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    <li>
                      • <strong>Fairteilerprofil:</strong> Verwaltung der
                      Standortinformationen, Websiteverlinkungen und Tags
                    </li>
                    <li>
                      • <strong>Mitgliederverwaltung:</strong> Einladen neuer
                      Mitglieder und Anlegen von Zugangsprofilen
                    </li>
                    <li>
                      • <strong>Stammdatenverwaltung:</strong> Individuelle
                      Konfiguration des Retteformulars
                    </li>
                    <li>
                      • <strong>Beitragsanleitung:</strong> Erstellung einer
                      standortspezifischen Anleitung
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Badge variant='outline'>Betrachter:innen</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='mb-3 text-sm'>
                    Haben eingeschränkten, lesenden Zugriff:
                  </p>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    <li>
                      • <strong>Statistiken:</strong> Einsicht in die
                      Rettungsstatistiken des Fairteilers ohne Möglichkeit zur
                      aktiven Teilnahme oder Verwaltung
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <h3 className='mt-8 mb-3 text-lg font-semibold'>
              Das Retteformular – Kernstück beider Bereiche
            </h3>
            <p>
              Das Retteformular ist das zentrale Werkzeug sowohl im Nutzer- als
              auch im Fairteiler-Bereich und funktioniert in beiden Kontexten
              nach dem gleichen Prinzip: Alle Nutzenden geben über das Formular
              Art, Menge und relevante Details der geretteten Lebensmittel ein.
            </p>
            <p>
              <strong>Besonderheit für Fairteilermitglieder:</strong> Sie können
              Lebensmittel nicht nur im eigenen Namen erfassen, sondern auch
              stellvertretend für andere Zugangsprofile (z.B. Gast- oder
              Mitarbeiter:innen).
            </p>
          </InfoSection>

          {/* Daten & Privatsphäre */}
          <InfoSection id='daten-privatsphaere' title='Daten & Privatsphäre'>
            <p>
              Dieser Abschnitt erklärt, welche Daten erfasst werden und wer
              darauf zugreifen kann.
            </p>

            <h3 className='mt-6 mb-4 text-lg font-semibold'>
              Welche Daten werden erfasst
            </h3>
            <div className='grid gap-4 md:grid-cols-2'>
              <FactCard title='Bei der Registrierung'>
                <ul className='space-y-1'>
                  <li>• Name (kann später anonymisiert werden)</li>
                  <li>• E-Mail-Adresse</li>
                  <li>• Passwort (verschlüsselt gespeichert)</li>
                  <li>• Zeitpunkt der Registrierung</li>
                </ul>
              </FactCard>
              <FactCard title='Abgabedaten'>
                <ul className='space-y-1'>
                  <li>
                    • Abgabe-Daten: Kategorie, Menge, Herkunft, ggf. Betrieb
                  </li>
                  <li>• Zeitpunkt und Datum der Abgabe</li>
                  <li>• Zugeordneter Fairteiler-Standort</li>
                  <li>• Optional: Notizen oder Anmerkungen</li>
                </ul>
              </FactCard>
              <FactCard title='Standortdaten'>
                <ul className='space-y-1'>
                  <li>• Temporäre Standortprüfung zur Freischaltung</li>
                  <li>• Standortdaten werden nicht dauerhaft gespeichert</li>
                  <li>• Nur zur Verifizierung der Anwesenheit am Fairteiler</li>
                </ul>
              </FactCard>
              <FactCard title='Weitere Daten'>
                <ul className='space-y-1'>
                  <li>• Erreichte Meilensteine</li>
                  <li>• Streak-Verläufe (wöchentliche Aktivität)</li>
                  <li>• Browser-Typ und Version</li>
                  <li>• Gerätetyp (Desktop/Tablet/Smartphone)</li>
                  <li>• IP-Adresse (nur für Sicherheitszwecke)</li>
                </ul>
              </FactCard>
            </div>

            <h3 className='mt-8 mb-4 text-lg font-semibold'>
              Daten und Berechtigungen
            </h3>
            <div className='space-y-4'>
              <div>
                <h4 className='mb-2 font-semibold'>Fairteiler-Rollen:</h4>
                <ul className='space-y-1 text-sm text-muted-foreground'>
                  <li>
                    • <strong>Verwaltende Rollen:</strong> Sehen sowohl
                    aggregierte Statistiken als auch eine Historie aller Abgaben
                    mit Zuordnung zu den Beitragenden
                  </li>
                  <li>
                    • <strong>Betrachter:innen:</strong> Nur-Lese-Zugriff auf
                    aggregierte Statistiken
                  </li>
                </ul>
              </div>
              <div>
                <h4 className='mb-2 font-semibold'>Zugangsprofile (Geräte):</h4>
                <ul className='space-y-1 text-sm text-muted-foreground'>
                  <li>
                    • Abgaben über Gast- oder Mitarbeitenden-Zugänge sind nicht
                    personenbezogen
                  </li>
                  <li>• Keine individuelle Nachverfolgbarkeit</li>
                </ul>
              </div>
              <div>
                <h4 className='mb-2 font-semibold'>
                  Öffentliche Sichtbarkeit:
                </h4>
                <ul className='space-y-1 text-sm text-muted-foreground'>
                  <li>
                    • Fairteiler-Standorte erscheinen auf der öffentlichen Karte
                    (sofern aktiviert)
                  </li>
                  <li>
                    • Gesamtstatistiken eines Fairteilers sind öffentlich
                    sichtbar
                  </li>
                  <li>
                    • Individuelle Daten von Nutzenden sind niemals öffentlich
                  </li>
                </ul>
              </div>
              <div>
                <h4 className='mb-2 font-semibold'>Anonymisierung:</h4>
                <ul className='space-y-1 text-sm text-muted-foreground'>
                  <li>
                    • In den Nutzereinstellungen kann man das Profil
                    anonymisieren
                  </li>
                  <li>
                    • Der Name wird durch einen generischen Platzhalter ersetzt
                  </li>
                  <li>
                    • Die Abgaben bleiben statistisch erfasst, aber ohne
                    sichtbaren Personenbezug
                  </li>
                  <li>• Gamification-Features funktionieren weiterhin</li>
                </ul>
              </div>
            </div>

            <h3 className='mt-8 mb-3 text-lg font-semibold'>
              Komplette Account-Löschung
            </h3>
            <p>
              Man kann den Account jederzeit in den Nutzereinstellungen
              vollständig löschen:
            </p>
            <div className='mt-3 rounded-lg bg-destructive/10 p-4'>
              <h4 className='mb-2 font-semibold text-destructive'>
                Was passiert bei Account-Löschung:
              </h4>
              <ul className='space-y-1 text-sm text-destructive/80'>
                <li>
                  ✅ Alle personenbezogenen Daten werden gelöscht (Name, E-Mail,
                  Passwort)
                </li>
                <li>✅ Individuelle Abgaben werden anonymisiert</li>
                <li>
                  ✅ Gamification-Daten (Meilensteine, Streaks) werden gelöscht
                </li>
                <li>
                  ⚠️ Aggregierte Statistiken der Fairteiler bleiben erhalten
                  (ohne Personenbezug)
                </li>
                <li>
                  ⚠️ Die Löschung ist <strong>unwiderruflich</strong> – der
                  Account kann nicht wiederhergestellt werden
                </li>
                <li>⚠️ Backups werden nicht überschrieben</li>
              </ul>
            </div>
            <div className='mt-4'>
              <h4 className='mb-2 font-semibold'>Datenaufbewahrung:</h4>
              <ul className='space-y-1 text-sm text-muted-foreground'>
                <li>
                  • <strong>Aktive Accounts:</strong> Unbegrenzt
                </li>
                <li>
                  • <strong>Inaktive Accounts:</strong> Nach 3 Jahren
                  Inaktivität erhält man eine Erinnerung; ohne Reaktion wird der
                  Account nach weiteren 6 Monaten gelöscht
                </li>
              </ul>
            </div>
          </InfoSection>

          {/* Über das Projekt */}
          <InfoSection id='ueber-das-projekt' title='Über das Projekt'>
            <h3 className='mb-3 text-lg font-semibold'>
              Entstehungsgeschichte
            </h3>
            <p>
              FairTrack ist aus einem Uniprojekt hervorgegangen, das in
              Zusammenarbeit zwischen der Hochschule der Medien Stuttgart und
              dem Foodsharing-Café Raupe Immersatt in Stuttgart entstanden ist.
              Etwa 20 Studierende haben an diesem Projekt gearbeitet, mit dem
              Ziel, den Prozess der Lebensmittelabgabe zu digitalisieren, um
              zukünftig Wirkungsmessungen durchführen zu können.
            </p>
            <p>
              Die beteiligten Teams umfassten verschiedene Disziplinen von
              Organisation über Design bis hin zur technischen Umsetzung. Dieser
              interdisziplinäre Ansatz ermöglichte es, eine ganzheitliche Lösung
              zu entwickeln, die sowohl technisch robust als auch
              benutzerfreundlich ist.
            </p>

            <h3 className='mt-6 mb-3 text-lg font-semibold'>
              Aktuelle Entwicklung
            </h3>
            <p>
              Als Teilnehmer des Uniprojekts hat Danilo Ley Alves das Projekt
              übernommen und FairTrack als Plattform weiter ausgebaut. Im Fokus
              steht dabei die kontinuierliche Weiterentwicklung der
              Nutzungsoberfläche für die Anforderungen im täglichen Café-Betrieb
              und die Foodsaver*innen einen genaueren Einblick über ihre
              Beiträge im Kampf gegen Lebensmittelverschwendung zu ermöglichen.
            </p>

            <h3 className='mt-6 mb-3 text-lg font-semibold'>
              Mission und Vision
            </h3>
            <p>
              FairTrack dient als Tool für öffentliche Fairteiler und
              Abgabestellen, mit dessen Hilfe Lebensmittelspenden erfasst werden
              können. Damit wird das Engagement gegen Lebensmittelverschwendung
              sichtbar und messbar, was sowohl für die interne Motivation als
              auch für die Außendarstellung und Förderanträge von großer
              Bedeutung ist.
            </p>
          </InfoSection>

          {/* FAQ */}
          <InfoSection
            id='haeufig-gestellte-fragen'
            title='Häufig gestellte Fragen'
          >
            <p>
              Hier findest du Antworten auf die häufigsten Fragen zu FairTrack.
            </p>
            <div className='mt-4 space-y-6'>
              {FAQ_GROUPS.map((group) => (
                <div key={group.group}>
                  <h3 className='mb-1 text-lg font-semibold'>{group.group}</h3>
                  <Accordion type='multiple'>
                    {group.items.map((item) => (
                      <AccordionItem key={item.question} value={item.question}>
                        <AccordionTrigger className='text-left text-sm font-semibold'>
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className='text-sm text-muted-foreground'>
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </InfoSection>

          {/* Fehlersuche & Support */}
          <InfoSection id='fehlersuche-support' title='Fehlersuche & Support'>
            <p>
              Manchmal läuft nicht alles wie geplant. Dieser Abschnitt hilft,
              häufige Probleme selbst zu lösen und zeigt, wie man Unterstützung
              erhält.
            </p>

            <h3 className='mt-6 mb-1 text-lg font-semibold'>
              Self-Service-Checkliste
            </h3>
            <Accordion type='multiple'>
              {TROUBLESHOOTING.map((item) => (
                <AccordionItem key={item.problem} value={item.problem}>
                  <AccordionTrigger className='text-left text-sm font-semibold'>
                    <span className='flex items-center gap-2'>
                      <Wrench className='size-4 shrink-0 text-primary' />
                      {item.problem}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className='space-y-1 text-sm text-muted-foreground'>
                      {item.steps.map((step) => (
                        <li key={step}>• {step}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <h3 className='mt-8 mb-3 text-lg font-semibold'>
              Support kontaktieren
            </h3>
            <p>
              Wenn die Checkliste nicht hilft, steht das Support-Team über das
              Feedback-Formular zur Verfügung.
            </p>
            <div className='mt-4 space-y-4'>
              <div>
                <h4 className='mb-2 font-semibold'>
                  Bei technischen Problemen:
                </h4>
                <ul className='space-y-1 text-sm text-muted-foreground'>
                  <li>
                    • <strong>Was wolltest du tun?</strong> Beschreibe den
                    gewünschten Ablauf
                  </li>
                  <li>
                    • <strong>Was ist passiert?</strong> Fehlermeldung,
                    unerwartetes Verhalten
                  </li>
                  <li>
                    • <strong>Wann trat das Problem auf?</strong> Datum und
                    ungefähre Uhrzeit
                  </li>
                  <li>
                    • <strong>Gerät und Browser:</strong> z.B. &quot;iPhone 12,
                    Safari&quot; oder &quot;Windows PC, Chrome&quot;
                  </li>
                  <li>
                    • <strong>Schritte zur Reproduktion:</strong> Wie kann das
                    Problem nachgestellt werden?
                  </li>
                </ul>
              </div>
              <div>
                <h4 className='mb-2 font-semibold'>
                  Bei Fragen zur Bedienung:
                </h4>
                <ul className='space-y-1 text-sm text-muted-foreground'>
                  <li>
                    • <strong>Welche Funktion betrifft deine Frage?</strong>{' '}
                    z.B. &quot;Stammdatenverwaltung&quot;
                  </li>
                  <li>
                    • <strong>Was ist unklar?</strong> Konkrete Formulierung der
                    Frage
                  </li>
                </ul>
              </div>
              <div>
                <h4 className='mb-2 font-semibold'>
                  Bei Datenschutz-Anfragen:
                </h4>
                <ul className='space-y-1 text-sm text-muted-foreground'>
                  <li>
                    • <strong>Art der Anfrage:</strong> Auskunft, Löschung,
                    Korrektur
                  </li>
                  <li>
                    • <strong>Betroffene Daten:</strong> Welche Informationen
                    sind gemeint?
                  </li>
                  <li>
                    • <strong>Deine E-Mail-Adresse:</strong> Zur Identifikation
                    und Rückmeldung
                  </li>
                </ul>
              </div>
            </div>

            <h4 className='mt-6 font-semibold'>
              Beispiel einer guten Support-Anfrage:
            </h4>
            <div className='mt-2 rounded-lg bg-primary/10 p-4'>
              <div className='text-sm text-primary'>
                <p className='mb-2'>
                  <strong>Betreff:</strong> Abgabeformular lässt sich nicht
                  absenden
                </p>
                <p className='mb-2'>
                  <strong>Beschreibung:</strong>
                </p>
                <p className='mb-2'>
                  Ich habe heute Vormittag (23.10.2025, ca. 10:30 Uhr) versucht,
                  eine Abgabe am Fairteiler &quot;Raupe Immersatt&quot; zu
                  erfassen. Ich habe 5 kg Backwaren ausgewählt und alle Felder
                  ausgefüllt. Wenn ich auf &quot;Speichern&quot; klicke,
                  passiert kurz etwas (Ladeanimation), aber dann erscheint die
                  Meldung &quot;Ein Fehler ist aufgetreten&quot;. Die Abgabe
                  wird nicht gespeichert.
                </p>
                <p className='mb-2'>
                  <strong>Gerät:</strong> Samsung Galaxy S21, Chrome-Browser
                  (aktuellste Version)
                </p>
                <p className='mb-2'>
                  <strong>Standort:</strong> Direkt am Fairteiler,
                  Standortfreigabe aktiv
                </p>
                <p className='mb-2'>Ich habe bereits versucht:</p>
                <ul className='mb-2 ml-4'>
                  <li>• Seite neu laden</li>
                  <li>• Abmelden und wieder anmelden</li>
                </ul>
                <p>Das Problem besteht weiterhin. Können Sie helfen?</p>
              </div>
            </div>

            <div className='mt-4'>
              <h4 className='mb-2 font-semibold'>
                Alternative Kontaktmöglichkeiten:
              </h4>
              <p className='text-sm text-muted-foreground'>
                Bei dringenden Problemen: Kontaktiere{' '}
                <Link
                  className='text-primary hover:underline'
                  href={`mailto:${siteConfig.contact}`}
                >
                  {siteConfig.contact}
                </Link>
              </p>
            </div>
          </InfoSection>
        </div>
      </div>
    </div>
  );
}

function InfoSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className='scroll-mt-20'>
      <BlurFade inView>
        <div className='rounded-2xl border border-primary/10 bg-white px-6 py-6 sm:px-10 sm:py-8'>
          <h2 className='mb-4 font-londrina text-3xl text-primary'>{title}</h2>
          <div className='space-y-4 text-sm leading-relaxed text-foreground sm:text-base'>
            {children}
          </div>
        </div>
      </BlurFade>
    </section>
  );
}

function FactCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-xl bg-background p-4'>
      <h4 className='text-sm font-semibold'>{title}</h4>
      <div className='mt-2 text-sm text-muted-foreground'>{children}</div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex gap-3'>
      <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
        {icon}
      </div>
      <div>
        <h4 className='text-sm font-semibold'>{title}</h4>
        <p className='mt-1 text-sm text-muted-foreground'>{children}</p>
      </div>
    </div>
  );
}

function Callout({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className='mt-6 flex items-center gap-3 rounded-xl bg-tertiary/10 p-4'>
      <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-tertiary/20 text-primary'>
        {icon}
      </div>
      <p className='text-sm'>{children}</p>
    </div>
  );
}
