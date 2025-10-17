import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Separator } from '@components/ui/separator';
import Link from 'next/link';

export default function Datenschutz() {
  return (
    <div className='mx-4 my-7 mb-72 sm:mx-0'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-end justify-between'>
            <h1 className='truncate text-2xl font-bold sm:text-3xl'>
              Datenschutzerklärung
            </h1>
            <p className='hidden text-sm sm:block'>30.06.2025</p>
          </CardTitle>
          <Separator />
        </CardHeader>
        <CardContent>
          <div className='flex w-full flex-col text-left'>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold sm:text-2xl'>
                  Allgemeiner Hinweis und Pflichtinformationen
                </h2>
                <p className='py-1 font-medium'>
                  Benennung der verantwortlichen Stelle
                </p>
                <p className='font-medium'>Raupe Immersatt e.V.</p>
                <p>
                  Vereinssitz/ Rechnungsadresse: <br />
                  Werderstraße 43 <br />
                  70190 Stuttgart <br />
                  hallo@raupeimmersatt.de <br />
                  0711 30000013 (Orga)
                </p>
                <p>
                  Die verantwortliche Stelle entscheidet allein oder gemeinsam
                  mit anderen über die Zwecke und Mittel der Verarbeitung von
                  personenbezogenen Daten (z.B. Namen, Kontaktdaten o. Ä.).
                </p>
              </div>
              <div>
                <h3 className='text-xl font-semibold'>
                  Widerruf Ihrer Einwilligung zur Datenverarbeitung
                </h3>
                <p>
                  Nur mit Ihrer ausdrücklichen Einwilligung sind einige Vorgänge
                  der Datenverarbeitung möglich. Ein Widerruf Ihrer bereits
                  erteilten Einwilligung ist jederzeit möglich. Für den Widerruf
                  genügt eine formlose Mitteilung per E-Mail. Die Rechtmäßigkeit
                  der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom
                  Widerruf unberührt.
                </p>
              </div>
              <div>
                <h3 className='text-xl font-semibold'>
                  Recht auf Auskunft, Berichtigung, Sperrung, Löschung
                </h3>
                <p>
                  Sie haben jederzeit im Rahmen der geltenden gesetzlichen
                  Bestimmungen das Recht auf unentgeltliche Auskunft über Ihre
                  gespeicherten personenbezogenen Daten, Herkunft der Daten,
                  deren Empfänger und den Zweck der Datenverarbeitung und ggf.
                  ein Recht auf Berichtigung, Sperrung oder Löschung dieser
                  Daten. Diesbezüglich und auch zu weiteren Fragen zum Thema
                  personenbezogene Daten können Sie sich jederzeit über die im
                  Impressum aufgeführten Kontaktmöglichkeiten an uns wenden.
                </p>
              </div>
              <div>
                <h3 className='text-xl font-semibold'>
                  SSL- bzw. TLS-Verschlüsselung
                </h3>
                <p>
                  Aus Sicherheitsgründen und zum Schutz der Übertragung
                  vertraulicher Inhalte, die Sie an uns als Seitenbetreiber
                  senden, nutzt unsere Website eine SSL-bzw.
                  TLS-Verschlüsselung. Damit sind Daten, die Sie über diese
                  Website übermitteln, für Dritte nicht mitlesbar. Sie erkennen
                  eine verschlüsselte Verbindung an der „https://“ Adresszeile
                  Ihres Browsers und am Schloss-Symbol in der Browserzeile.
                </p>
              </div>
              <div>
                <h3 className='text-xl font-semibold'>Server-Log-Dateien</h3>
                <p>
                  In Server-Log-Dateien erhebt und speichert der Provider der
                  Website automatisch Informationen, die Ihr Browser automatisch
                  an uns übermittelt. Dies sind:
                </p>
                <ul className='list-square w-full list-inside py-2'>
                  <li>Besuchte Seite auf unserer Domain</li>
                  <li>Datum und Uhrzeit der Serveranfrage</li>
                  <li>Browsertyp und Browserversion</li>
                  <li>Verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>IP-Adresse</li>
                </ul>
                <p>
                  Es findet keine Zusammenführung dieser Daten mit anderen
                  Datenquellen statt. Grundlage der Datenverarbeitung bildet
                  Art. 6 Abs. 1 lit. b DSGVO, der die Verarbeitung von Daten zur
                  Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen
                  gestattet.
                </p>
              </div>
              <div className='flex flex-col gap-1'>
                <h2 className='text-2xl font-semibold'>
                  Registrierung auf dieser Website
                </h2>
                <p>
                  Zur Nutzung bestimmter Funktionen können Sie sich auf unserer
                  Website registrieren. Die übermittelten Daten dienen
                  ausschließlich zum Zwecke der Nutzung des jeweiligen Angebotes
                  oder Dienstes. Bei der Registrierung abgefragte Pflichtangaben
                  sind vollständig anzugeben. Andernfalls werden wir die
                  Registrierung ablehnen.
                </p>
                <p>
                  Im Falle wichtiger Änderungen, etwa aus technischen Gründen,
                  informieren wir Sie per E-Mail. Die E-Mail wird an die Adresse
                  versendet, die bei der Registrierung angegeben wurde.
                </p>
                <p>
                  Die Verarbeitung der bei der Registrierung eingegebenen Daten
                  erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a
                  DSGVO). Ein Widerruf Ihrer bereits erteilten Einwilligung ist
                  jederzeit möglich. Für den Widerruf genügt eine formlose
                  Mitteilung per E-Mail. Die Rechtmäßigkeit der bereits
                  erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
                </p>
                <p>
                  Wir speichern die bei der Registrierung erfassten Daten
                  während des Zeitraums, den Sie auf unserer Website registriert
                  sind. Ihren Daten werden gelöscht, sollten Sie Ihre
                  Registrierung aufheben. Gesetzliche Aufbewahrungsfristen
                  bleiben unberührt.
                </p>
              </div>
              <div className='flex flex-col gap-1'>
                <h2 className='text-xl font-semibold'>Cookies</h2>
                <p>
                  Unsere Website verwendet funktionale Cookies. Das sind kleine
                  Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert.
                </p>
                <p>
                  Einige Cookies sind “Session-Cookies”. Solche Cookies werden
                  nach Ende Ihrer Browser-Sitzung von selbst gelöscht. Hingegen
                  bleiben andere Cookies auf Ihrem Endgerät bestehen, bis Sie
                  diese selbst löschen. Solche Cookies helfen uns, Sie bei
                  Rückkehr auf unserer Website wiederzuerkennen.
                </p>
                <p>
                  Mit einem modernen Webbrowser können Sie das Setzen von
                  Cookies überwachen, einschränken oder unterbinden. Viele
                  Webbrowser lassen sich so konfigurieren, dass Cookies mit dem
                  Schließen des Programms von selbst gelöscht werden. Die
                  Deaktivierung von Cookies kann eine eingeschränkte
                  Funktionalität unserer Website zur Folge haben.
                </p>

                <p>
                  <small>
                    Quelle:{' '}
                    <Link
                      href='https://www.mein-datenschutzbeauftragter.de'
                      target='_blank'
                    >
                      Mein-Datenschutzbeauftragter.de
                    </Link>
                  </small>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
