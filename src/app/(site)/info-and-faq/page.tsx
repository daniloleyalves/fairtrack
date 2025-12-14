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
import { Checkbox } from '@/components/ui/checkbox';
import { siteConfig } from '@/lib/config/site-config';

export default function FairTrackInfo() {
  return (
    <div className='mb-8 px-4 sm:px-0 2xl:mb-56'>
      <div className='flex w-full flex-col items-start gap-2 pt-6 lg:w-2/3'>
        <h1 className='font-londrina text-4xl font-semibold tracking-wider'>
          Informationen & FAQ
        </h1>
        <p className='text-md font-medium text-muted-foreground'>
          Umfassende Informationen über FairTrack - das digitale Tracking-Tool
          für Fairteilerstandorte. Hier findest du alles über Funktionen,
          Bedienung, Datenschutz und das Projekt dahinter.
        </p>
      </div>

      <div className='flex gap-4'>
        <div className='mt-8 w-full rounded-lg bg-white px-6 py-2 pb-6 sm:px-10 sm:pt-6 sm:pb-10 lg:w-2/3'>
          <Accordion type='single'>
            {/* 1. Überblick */}
            <AccordionItem value='ueberblick' id='ueberblick'>
              <AccordionTrigger className='text-xl'>Überblick</AccordionTrigger>
              <AccordionContent className='space-y-4'>
                <div>
                  <p className='mb-4'>
                    In Deutschland landen jedes Jahr über 18 Millionen Tonnen
                    Lebensmittel in der Tonne. Das entspricht der Hälfte unserer
                    produzierten Nahrungsmittel. Vieles davon wäre noch
                    genießbar und wird aus Überproduktionsgründen, falschem
                    Kaufverhalten oder optischen Mängeln entsorgt. Gegen diese
                    Verschwendung engagieren sich Initiativen wie Foodsharing
                    e.V. und viele Privatpersonen, indem sie aktiv Lebensmittel
                    retten.
                  </p>
                  <p className='mb-4'>
                    <strong>FairTrack</strong> ist ein digitales Tracking-Tool
                    für Fairteilerstandorte, das entwickelt wurde, um dieses
                    Engagement sichtbar und mit validen Zahlen belegbar zu
                    machen. Es erfasst Lebensmittelabgaben vor Ort einfach,
                    einheitlich und nachvollziehbar und macht sichtbar, wie
                    viele Lebensmittel tatsächlich gerettet werden. So liefert
                    FairTrack verlässliche Kennzahlen für die interne Steuerung,
                    für die Öffentlichkeitsarbeit und für Förderanträge.
                  </p>
                  <p className='mb-4'>
                    Fairteiler erhalten eigene Bereiche mit anpassbaren
                    Abgabeformularen, Kalendern und Auswertungen, um ihre
                    Abläufe flexibel zu steuern. Foodsaver profitieren von
                    persönlichen Dashboards mit anschaulichen Statistiken,
                    Abgabekalendern und kleinen Anreizen wie Meilensteinen.
                  </p>
                  <p className='mb-6'>
                    Auf diese Weise wird die Wirkung von Foodsharing an
                    Fairteilern transparent, das Engagement der Beteiligten
                    gestärkt und jedes gerettete Lebensmittel sichtbar.
                  </p>
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-base'>Zielgruppe</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm'>
                        Betreibende von Fairteiler-Stationen, Foodsharing-Cafés
                        und Initiativen, die Abgaben standardisiert
                        dokumentieren und auswerten möchten.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className='text-base'>
                        Nutzungskontext
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm'>
                        Vor Ort am Fairteiler auf Tablet oder Smartphone. Nicht
                        für den Privat-Austausch zwischen Einzelpersonen
                        gedacht.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className='text-base'>
                        System- und Konzeptgrenze
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm'>
                        Organisation (Abholungen, Teams, Rollen) bleibt auf
                        foodsharing.de. FairTrack deckt ausschließlich das
                        Erfassen der Abgaben am Standort ab.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className='text-base'>
                        Technische Voraussetzungen
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm'>
                        Aktuelle Browser, stabile Internetverbindung; für
                        Dauerbetrieb empfiehlt sich ein stationäres Tablet mit
                        Stromversorgung.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Bedienkonzepte */}
            <AccordionItem
              value='bedienkonzept-nutzer'
              id='bedienkonzept-nutzer'
            >
              <AccordionTrigger className='text-xl'>
                Bedienkonzept - Nutzer:in
              </AccordionTrigger>
              <AccordionContent className='space-y-6'>
                {/* Nutzer-Bereich */}
                <div id='nutzer-bereich'>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='mb-2 font-semibold'>Dashboard</h4>
                      <p className='text-sm text-muted-foreground'>
                        Der persönliche Startbereich zeigt auf einen Blick die
                        wichtigsten Informationen: aktuelle Statistiken zu den
                        eigenen Rettungsaktionen, einen Abgabekalender und
                        bereits erreichte Meilensteine.
                      </p>
                    </div>

                    <div>
                      <h4 className='mb-2 font-semibold'>Fairteiler-Finder</h4>
                      <p className='text-sm text-muted-foreground'>
                        Eine interaktive Karte zeigt alle registrierten
                        Fairteiler-Standorte in der Umgebung. Nutzer:innen
                        können hier gezielt nach Standorten suchen und
                        Informationen zu Fairteilern für ihre Abgabe finden.
                      </p>
                    </div>

                    <div>
                      <h4 className='mb-2 font-semibold'>Retteformular</h4>
                      <p className='text-sm text-muted-foreground'>
                        Das Herzstück der Anwendung ist das Retteformular zum
                        Abgeben von Lebensmitteln. Es wird nur am jeweiligen
                        Fairteiler-Standort freigeschaltet und ist über die
                        Fairteiler-Karte erreichbar.
                      </p>
                    </div>

                    <div>
                      <h4 className='mb-2 font-semibold'>Meine Beiträge</h4>
                      <p className='text-sm text-muted-foreground'>
                        Eine tabellarische Übersicht aller getätigten Abgaben
                        ermöglicht es, die eigene Rettungshistorie
                        nachzuvollziehen. Nutzer:innen sehen hier, wann und wo
                        sie welche Lebensmittel abgegeben haben.
                      </p>
                    </div>

                    <div>
                      <h4 className='mb-2 font-semibold'>Einstellungen</h4>
                      <p className='text-sm text-muted-foreground'>
                        Zentrale Verwaltung von Profil,
                        Privatsphäre-Einstellungen und Account-Optionen. Hier
                        können Nutzer:innen ihre persönlichen Daten anpassen.
                      </p>
                    </div>

                    <div>
                      <h4 className='mb-2 font-semibold'>Erste Schritte</h4>
                      <p className='text-sm text-muted-foreground'>
                        Melde dich einfach mit deiner E-Mail-Adresse oder deiner
                        Telefonnummer an und schon ist dein persönliches
                        FairTrack-Konto aktiv. Ab sofort kannst du über das
                        digitale Retteformular deine Abgaben an den
                        Fairteiler-Abgabestellen eintragen.
                      </p>
                    </div>

                    <div className='rounded-lg bg-blue-50 p-4'>
                      <p className='text-sm font-medium text-blue-800'>
                        <strong>Empfehlung:</strong> Installiere FairTrack als
                        Web-App auf deinem Smartphone für schnellen Zugriff
                        direkt vor Ort!
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Daten und Privatsphäre */}
            <AccordionItem
              value='bedienkonzept-fairteiler'
              id='bedienkonzept-fairteiler'
            >
              <AccordionTrigger className='text-xl'>
                Bedienkonzept - Fairteiler
              </AccordionTrigger>
              <AccordionContent className='space-y-6'>
                {/* Fairteiler-Bereich */}
                <div id='fairteiler-bereich'>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    Der Fairteiler-Bereich ist die Verwaltungszentrale für jeden
                    registrierten Fairteiler-Standort. Je nach Rolle haben
                    eingeladene Mitglieder des Fairteilers Zugriff auf
                    unterschiedliche Funktionen, die eine flexible und
                    bedarfsgerechte Verwaltung ermöglichen.
                  </p>
                </div>

                {/* Rollensystem */}
                <div id='rollensystem'>
                  <h3 className='mb-4 text-lg font-semibold'>
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
                          Haben Zugriff auf die grundlegenden Funktionen zur
                          aktiven Nutzung des Fairteiler-Bereichs:
                        </p>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>
                            • <strong>Dashboard:</strong> Übersicht über
                            aktuelle Aktivitäten und Statistiken des Fairteilers
                          </li>
                          <li>
                            • <strong>Retteformular:</strong> Das zentrale
                            Erfassungstool für gerettete Lebensmittel
                          </li>
                          <li>
                            • <strong>Verlauf:</strong> Auflistung aller Abgaben
                            am jeweiligen Fairteiler
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
                          Verfügen über alle Mitglieder-Funktionen plus
                          erweiterte Verwaltungsrechte:
                        </p>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>
                            • <strong>Fairteilerprofil:</strong> Verwaltung der
                            Standortinformationen, Websiteverlinkungen und Tags
                          </li>
                          <li>
                            • <strong>Mitgliederverwaltung:</strong> Einladen
                            neuer Mitglieder und Anlegen von Zugangsprofielen
                          </li>
                          <li>
                            • <strong>Stammdatenverwaltung:</strong>{' '}
                            Individuelle Konfiguration des Retteformulars
                          </li>
                          <li>
                            • <strong>Beitragsanleitung:</strong> Erstellung
                            einer standortspezifischen Anleitung
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
                            Rettungsstatistiken des Fairteilers ohne Möglichkeit
                            zur aktiven Teilnahme oder Verwaltung
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Retteformular */}
                <div id='retteformular'>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Das Retteformular – Kernstück beider Bereiche
                  </h3>
                  <div className='space-y-4'>
                    <p className='text-sm text-muted-foreground'>
                      Das Retteformular ist das zentrale Werkzeug sowohl im
                      Nutzer- als auch im Fairteiler-Bereich und funktioniert in
                      beiden Kontexten nach dem gleichen Prinzip. Es ermöglicht
                      die schnelle und strukturierte Erfassung geretteter
                      Lebensmittel.
                    </p>

                    <div>
                      <h4 className='mb-2 font-semibold'>Grundfunktion:</h4>
                      <p className='text-sm text-muted-foreground'>
                        Alle Nutzenden geben über das Formular Art, Menge und
                        relevante Details der geretteten Lebensmittel ein.
                      </p>
                    </div>

                    <div>
                      <h4 className='mb-2 font-semibold'>
                        Besonderheit für Fairteilermitglieder:
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Mitglieder eines Fairteilers haben eine erweiterte
                        Funktion: Sie können Lebensmittel nicht nur im eigenen
                        Namen erfassen, sondern auch stellvertretend für andere
                        Zugangprofile (z.B. Gast- oder Mitarbeiter:innen).
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 4. Daten und Privatsphäre */}
            <AccordionItem value='daten-privatsphaere' id='daten-privatsphaere'>
              <AccordionTrigger className='text-xl'>
                Daten und Privatsphäre
              </AccordionTrigger>
              <AccordionContent className='space-y-6'>
                <p className='text-sm text-muted-foreground'>
                  Dieser Abschnitt erklärt, welche Daten erfasst werden und wer
                  darauf zugreifen kann.
                </p>

                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Welche Daten werden erfasst
                  </h3>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>
                          Bei der Registrierung
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>• Name (kann später anonymisiert werden)</li>
                          <li>• E-Mail-Adresse</li>
                          <li>• Passwort (verschlüsselt gespeichert)</li>
                          <li>• Zeitpunkt der Registrierung</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>Abgabedaten</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>
                            • Abgabe-Daten: Kategorie, Menge, Herkunft, ggf.
                            Betrieb
                          </li>
                          <li>• Zeitpunkt und Datum der Abgabe</li>
                          <li>• Zugeordneter Fairteiler-Standort</li>
                          <li>• Optional: Notizen oder Anmerkungen</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>
                          Standortdaten
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>• Temporäre Standortprüfung zur Freischaltung</li>
                          <li>
                            • Standortdaten werden nicht dauerhaft gespeichert
                          </li>
                          <li>
                            • Nur zur Verifizierung der Anwesenheit am
                            Fairteiler
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-base'>
                          Weitere Daten
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>• Erreichte Meilensteine</li>
                          <li>• Streak-Verläufe (wöchentliche Aktivität)</li>
                          <li>• Browser-Typ und Version</li>
                          <li>• Gerätetyp (Desktop/Tablet/Smartphone)</li>
                          <li>• IP-Adresse (nur für Sicherheitszwecke)</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Daten und Berechtigungen
                  </h3>

                  <div className='space-y-4'>
                    <div>
                      <h4 className='mb-2 font-semibold'>Fairteiler-Rollen:</h4>
                      <ul className='space-y-1 text-sm text-muted-foreground'>
                        <li>
                          • <strong>Verwaltende Rollen:</strong> Sehen sowohl
                          aggregierte Statistiken als auch eine Historie aller
                          Abgaben mit Zuordnung zu den Beitragenden
                        </li>
                        <li>
                          • <strong>Betrachter:innen:</strong> Nur-Lese-Zugriff
                          auf aggregierte Statistiken
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className='mb-2 font-semibold'>
                        Zugangsprofile (Geräte):
                      </h4>
                      <ul className='space-y-1 text-sm text-muted-foreground'>
                        <li>
                          • Abgaben über Gast- oder Mitarbeitenden-Zugänge sind
                          nicht personenbezogen
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
                          • Fairteiler-Standorte erscheinen auf der öffentlichen
                          Karte (sofern aktiviert)
                        </li>
                        <li>
                          • Gesamtstatistiken eines Fairteilers sind öffentlich
                          sichtbar
                        </li>
                        <li>
                          • Individuelle Daten von Nutzenden sind niemals
                          öffentlich
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
                          • Der Name wird durch einen generischen Platzhalter
                          ersetzt
                        </li>
                        <li>
                          • Die Abgaben bleiben statistisch erfasst, aber ohne
                          sichtbaren Personenbezug
                        </li>
                        <li>• Gamification-Features funktionieren weiterhin</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Komplette Account-Löschung
                  </h3>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    Man kann den Account jederzeit in den Nutzereinstellungen
                    vollständig löschen:
                  </p>

                  <div className='rounded-lg bg-destructive/10 p-4'>
                    <h4 className='mb-2 font-semibold text-destructive'>
                      Was passiert bei Account-Löschung:
                    </h4>
                    <ul className='space-y-1 text-sm text-destructive/80'>
                      <li>
                        ✅ Alle personenbezogenen Daten werden gelöscht (Name,
                        E-Mail, Passwort)
                      </li>
                      <li>✅ Individuellen Abgaben werden anonymisiert</li>
                      <li>
                        ✅ Gamification-Daten (Meilensteine, Streaks) werden
                        gelöscht
                      </li>
                      <li>
                        ⚠️ Aggregierte Statistiken der Fairteiler bleiben
                        erhalten (ohne Personenbezug)
                      </li>
                      <li>
                        ⚠️ Die Löschung ist <strong>unwiderruflich</strong> –
                        der Account kann nicht wiederhergestellt werden
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
                        Inaktivität erhält man eine Erinnerung; ohne Reaktion
                        wird der Account nach weiteren 6 Monaten gelöscht
                      </li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 5. Über das Projekt */}
            <AccordionItem value='ueber-das-projekt' id='ueber-das-projekt'>
              <AccordionTrigger className='text-xl'>
                Über das Projekt
              </AccordionTrigger>
              <AccordionContent className='space-y-6'>
                <p className='text-sm text-muted-foreground'>
                  Erfahre mehr über die Entstehung und das Team hinter
                  FairTrack.
                </p>

                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Entstehungsgeschichte
                  </h3>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    FairTrack ist aus einem Uniprojekt hervorgegangen, das in
                    Zusammenarbeit zwischen der Hochschule der Medien Stuttgart
                    und dem Foodsharing-Café Raupe Immersatt in Stuttgart
                    entstanden ist. Etwa 20 Studierende haben an diesem Projekt
                    gearbeitet, mit dem Ziel, den Prozess der Lebensmittelabgabe
                    zu digitalisieren, um zukünftig Wirkungsmessungen
                    durchführen zu können.
                  </p>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    Die beteiligten Teams umfassten verschiedene Disziplinen von
                    Organisation über Design bis hin zur technischen Umsetzung.
                    Dieser interdisziplinäre Ansatz ermöglichte es, eine
                    ganzheitliche Lösung zu entwickeln, die sowohl technisch
                    robust als auch benutzerfreundlich ist.
                  </p>
                </div>

                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Aktuelle Entwicklung
                  </h3>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    Als Teilnehmer des Uniprojekts hat Danilo Ley Alves das
                    Projekt übernommen und FairTrack als Plattform weiter
                    ausgebaut. Im Fokus steht dabei die kontinuierliche
                    Weiterentwicklung der Nutzungsoberfläche für die
                    Anforderungen im täglichen Café-Betrieb und die
                    Foodsaver*innen einen genaueren Einblick über ihre Beiträge
                    im Kampf gegen Lebensmittelverschwendung zu ermöglichen.
                  </p>
                </div>

                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Mission und Vision
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    FairTrack dient als Tool für öffentliche Fairteiler und
                    Abgabestellen, mit dessen Hilfe Lebensmittelspenden erfasst
                    werden können. Damit wird das Engagement gegen
                    Lebensmittelverschwendung sichtbar und messbar, was sowohl
                    für die interne Motivation als auch für die Außendarstellung
                    und Förderanträge von großer Bedeutung ist.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 6. Häufig gestellte Fragen (FAQ) */}
            <AccordionItem
              value='haeufig-gestellte-fragen'
              id='haeufig-gestellte-fragen'
            >
              <AccordionTrigger className='text-xl'>
                Häufig gestellte Fragen (FAQ)
              </AccordionTrigger>
              <AccordionContent className='space-y-6'>
                <p className='text-sm text-muted-foreground'>
                  Hier findest du Antworten auf die häufigsten Fragen zu
                  FairTrack.
                </p>

                {/* Allgemeine Fragen */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Allgemeine Fragen
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Kostet die Nutzung von FairTrack etwas?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Nein, FairTrack ist kostenlos für alle Nutzenden und
                        Fairteiler-Betreibende.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Muss ich einen Account erstellen, um Lebensmittel
                        abzugeben?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Nein. An Fairteilern mit Gast-Zugangsprofil kannst du
                        ohne eigenen Account abgeben. Ein persönlicher Account
                        bietet dir aber Statistiken und in Zukunft
                        Community-Features.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Kann ich FairTrack auch ohne Smartphone nutzen?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Ja. An Fairteilern gibt es stationäre Tablets für die
                        Erfassung. Für persönliche Statistiken brauchst du aber
                        einen eigenen Zugriff auf die Platform.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Ist FairTrack eine Alternative zu foodsharing.de?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Nein. FairTrack ergänzt foodsharing.de, ersetzt es aber
                        nicht. Organisation und Abholungen laufen weiterhin über
                        foodsharing.de. FairTrack dient ausschließlich der
                        Erfassung am Fairteiler.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account und Anmeldung */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Account und Anmeldung
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Ich habe mein Passwort vergessen. Was kann ich tun?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Klicke auf der Anmeldeseite auf „Passwort vergessen" und
                        folge den Anweisungen. Du erhältst einen Link zum
                        Zurücksetzen per E-Mail.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Kann ich meine E-Mail-Adresse ändern?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Nein, derzeit ist es noch nicht möglich die eigene
                        Account-Email zu ändern.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Was passiert, wenn ich meinen Account lösche?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Alle personenbezogenen Daten werden gelöscht. Deine
                        Abgaben bleiben anonymisiert in den
                        Fairteiler-Statistiken erhalten. Die Löschung ist
                        unwiderruflich.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Erfassung und Abgaben */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Erfassung und Abgaben
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Wie genau muss ich Mengen angeben?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Schätzungen sind in Ordnung. Bei Unsicherheit lieber
                        konservativ schätzen. Waagen sind hilfreich, aber nicht
                        zwingend erforderlich.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Kann ich eine falsche Abgabe korrigieren?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Nein, aber Inhaber:innen eines Fairteilers können
                        Abgaben ihres Fairteilers korrigieren. Kontaktiere
                        diese, wenn dir ein grober Fehler passiert ist.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Warum wird das Abgabeformular nicht freigeschaltet?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Du musst dich in einem 20m Radius um den Fairteiler
                        befinden und die Standortfreigabe aktiviert haben.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Kann ich mehrere Abgaben nacheinander erfassen?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Ja. Im Formular hast du die Möglichkeit mehrere
                        Lebensmittel auf einmal anzulegen.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fairteiler-Verwaltung */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Fairteiler-Verwaltung
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Wie werde ich Mitglied eines Fairteilers?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Du musst von einem/einer Inhaber:in eingeladen werden.
                        Eine Selbst-Registrierung als Mitglied ist nicht
                        möglich.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Kann ich die Rolle eines Mitglieds nachträglich ändern?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Ja. Als Inhaber:in kannst du Rollen jederzeit anpassen
                        oder entfernen.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Was ist der Unterschied zwischen einem Mitglied und
                        einem Zugangsprofil?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Mitglieder sind echte Personen mit individuellen
                        Accounts. Zugangsprofile sind unpersönliche Zugänge für
                        Geräte (z.B. Gast-Tablet).
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Kann ich einen Fairteiler vorübergehend schließen?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Ja. Als Inhaber:in kannst du die Sichtbarkeit
                        deaktivieren. Der Fairteiler verschwindet von der Karte,
                        Daten bleiben erhalten.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gamification */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>Gamification</h3>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Wie funktionieren Streaks genau?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Eine Streak zählt zusammenhängende Wochen
                        (Montag-Sonntag) mit mindestens einer Abgabe. Eine
                        Abgabe pro Woche reicht aus.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Kann ich Gamification komplett abschalten?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Ja. In den Einstellungen kannst du Meilensteine und
                        Streaks deaktivieren. Deine Daten bleiben erhalten.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Werden Meilensteine öffentlich angezeigt?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Nein, nur du selbst siehst deine Meilensteine.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technische Fragen */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Technische Fragen
                  </h3>
                  <div className='space-y-4'>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Funktioniert FairTrack auch offline?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Nein. Eine aktive Internetverbindung ist erforderlich,
                        da Daten in Echtzeit synchronisiert werden.
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Gibt es eine App für iOS/Android?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Aktuell nicht. FairTrack ist als responsive Webapp
                        optimiert und funktioniert im mobilen Browser. Du kannst
                        jedoch die Platform als Webapp auf deinem Gerät
                        installieren. Die Browserleiste ist dann versteckt :)
                      </p>
                    </div>
                    <div>
                      <h4 className='mb-2 text-sm font-semibold'>
                        Kann ich FairTrack auf mehreren Geräten nutzen?
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Ja. Melde dich einfach mit deinem Account auf jedem
                        Gerät an. Daten werden automatisch synchronisiert.
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 7. Fehlersuche und Support */}
            <AccordionItem value='fehlersuche-support' id='fehlersuche-support'>
              <AccordionTrigger className='text-xl'>
                Fehlersuche und Support
              </AccordionTrigger>
              <AccordionContent className='space-y-6'>
                <p className='text-sm text-muted-foreground'>
                  Manchmal läuft nicht alles wie geplant. Dieser Abschnitt
                  hilft, häufige Probleme selbst zu lösen und zeigt, wie man
                  Unterstützung erhält.
                </p>

                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Self-Service Checkliste
                  </h3>

                  <div className='space-y-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <Checkbox />
                          Seite lädt nicht oder reagiert nicht
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>• Internetverbindung prüfen</li>
                          <li>• Seite aktualisieren (F5 oder Strg+R)</li>
                          <li>• Browser-Cache leeren (Strg+Shift+Entf)</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <Checkbox />
                          Anmeldung funktioniert nicht
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>
                            • Benutzername und Passwort auf Tippfehler
                            überprüfen
                          </li>
                          <li>• Nutze die „Passwort vergessen"-Funktion</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <Checkbox />
                          Formular lässt sich nicht absenden
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>• Internetverbindung prüfen</li>
                          <li>
                            • Prüfen, ob alle Pflichtfelder ausgefüllt sind
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <Checkbox />
                          Abgabe erscheint nicht
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>
                            • 10-20 Sekunden warten und die Seite aktualisieren
                            (F5 oder Strg+R)
                          </li>
                          <li>• Filter-Einstellungen prüfen</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-base'>
                          <Checkbox /> Abgabeformular wird nicht freigeschaltet
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          <li>
                            • Sicherstellen, dass die Standortfreigabe im
                            Browser aktiviert ist
                          </li>
                          <li>
                            • Prüfen, ob man sich tatsächlich am
                            Fairteiler-Standort befindet (Radius grün, statt
                            blau)
                          </li>
                          <li>
                            • Prüfen, ob GPS/Standortdienste aktiviert sind
                          </li>
                          <li>
                            • Bei iOS: In den Einstellungen prüfen, ob
                            Safari/Browser Standortzugriff hat
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className='mb-4 text-lg font-semibold'>
                    Support kontaktieren
                  </h3>
                  <p className='mb-4 text-sm text-muted-foreground'>
                    Wenn die Checkliste nicht hilft, steht das Support-Team über
                    das Feedback-Formular zur Verfügung.
                  </p>

                  <div className='space-y-4'>
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
                          • <strong>Wann trat das Problem auf?</strong> Datum
                          und ungefähre Uhrzeit
                        </li>
                        <li>
                          • <strong>Gerät und Browser:</strong> z.B. "iPhone 12,
                          Safari" oder "Windows PC, Chrome"
                        </li>
                        <li>
                          • <strong>Schritte zur Reproduktion:</strong> Wie kann
                          das Problem nachgestellt werden?
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className='mb-2 font-semibold'>
                        Bei Fragen zur Bedienung:
                      </h4>
                      <ul className='space-y-1 text-sm text-muted-foreground'>
                        <li>
                          •{' '}
                          <strong>Welche Funktion betrifft deine Frage?</strong>{' '}
                          z.B. "Stammdatenverwaltung"
                        </li>
                        <li>
                          • <strong>Was ist unklar?</strong> Konkrete
                          Formulierung der Frage
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className='mb-2 font-semibold'>
                        Bei Datenschutz-Anfragen:
                      </h4>
                      <ul className='space-y-1 text-sm text-muted-foreground'>
                        <li>
                          • <strong>Art der Anfrage:</strong> Auskunft,
                          Löschung, Korrektur
                        </li>
                        <li>
                          • <strong>Betroffene Daten:</strong> Welche
                          Informationen sind gemeint?
                        </li>
                        <li>
                          • <strong>Deine E-Mail-Adresse:</strong> Zur
                          Identifikation und Rückmeldung
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
                        <strong>Betreff:</strong> Abgabeformular lässt sich
                        nicht absenden
                      </p>
                      <p className='mb-2'>
                        <strong>Beschreibung:</strong>
                      </p>
                      <p className='mb-2'>
                        Ich habe heute Vormittag (23.10.2025, ca. 10:30 Uhr)
                        versucht eine Abgabe am Fairteiler "Raupe Immersatt" zu
                        erfassen. Ich habe 5 kg Backwaren ausgewählt und alle
                        Felder ausgefüllt. Wenn ich auf "Speichern" klicke,
                        passiert kurz etwas (Ladeanimation), aber dann erscheint
                        die Meldung "Ein Fehler ist aufgetreten". Die Abgabe
                        wird nicht gespeichert.
                      </p>
                      <p className='mb-2'>
                        <strong>Gerät:</strong> Samsung Galaxy S21,
                        Chrome-Browser (aktuellste Version)
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
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className='hidden w-1/3 lg:block'>
          <Image
            src={Illustrations.faqIllustration}
            alt='fairtrack info illustration'
            className='mx-auto w-[300px] -translate-y-1/4'
            loading='eager'
            decoding='sync'
          />
        </div>
      </div>
    </div>
  );
}
