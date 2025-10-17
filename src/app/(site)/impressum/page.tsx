import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Separator } from '@components/ui/separator';
import Link from 'next/link';

export default function Impressum() {
  return (
    <div className='mx-4 my-7 mb-72 sm:mx-0'>
      <Card>
        <CardHeader>
          <CardTitle className='truncate text-3xl font-bold'>
            Impressum
          </CardTitle>
          <Separator />
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-6'>
            <div>
              <h2 className='text-xl font-semibold'>Verantwortlichkeiten</h2>
              <p className='py-2 font-medium'>Raupe Immersatt e.V.</p>
              <p>
                Vereinssitz/ Rechnungsadresse: <br />
                Werderstraße 43 <br />
                70190 Stuttgart <br />
                hallo@raupeimmersatt.de <br />
                0711 30000013 (Orga)
              </p>
            </div>
            <div>
              <ul className='flex flex-col gap-2'>
                <h2 className='text-xl font-semibold'>Haftungsausschluss</h2>
                <li>
                  1. Inhalt des Onlineangebotes <br /> Die Autoren übernehmen
                  keinerlei Gewähr für die Aktualität, Korrektheit,
                  Vollständigkeit oder Qualität der bereitgestellten
                  Informationen. Haftungsansprüche gegen die Autoren, die sich
                  auf Schäden materieller oder ideeller Art beziehen, welche
                  durch die Nutzung oder Nichtnutzung der dargebotenen
                  Informationen bzw. durch die Nutzung fehlerhafter und
                  unvollständiger Informationen verursacht wurden, sind
                  grundsätzlich ausgeschlossen, sofern seitens der Autoren kein
                  nachweislich vorsätzliches oder grob fahrlässiges Verschulden
                  vorliegt. Alle Angebote sind freibleibend und unverbindlich.
                  Die Autoren behalten es sich ausdrücklich vor, Teile der
                  Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu
                  verändern, zu ergänzen, zu löschen oder die Veröffentlichung
                  zeitweise oder endgültig einzustellen.
                </li>
                <li>
                  2. Verweise und Links <br /> Trotz sorgfältiger inhaltlicher
                  Kontrolle übernehmen wir keine Haftung für die Inhalte
                  externer Links. Für den Inhalt der verlinkten Seiten sind
                  ausschließlich deren Betreiber verantwortlich.
                </li>
                <li>
                  3. Urheberrecht <br /> Die Verfasser sind bestrebt, in allen
                  Publikationen geltende Urheberrechte zu beachten. Sollte es
                  trotzdem zu einer Urheberrechtsverletzung kommen, werden die
                  Verfasser das entsprechende Objekt nach Benachrichtigungen aus
                  ihrer Publikation entfernen bzw. mit dem entsprechenden
                  Urheberrecht kenntlich machen.
                </li>
                <li>
                  4. Rechtswirksamkeit dieses Haftungsausschlusses <br /> Dieser
                  Haftungsausschluss ist als Teil des Internet-Angebotes zu
                  betrachten, von dem aus auf diese Seite verwiesen wurde.
                  Sofern Teile oder einzelne Formulierungen dieses Textes der
                  geltenden Rechtslage nicht, nicht mehr oder nicht vollständig
                  entsprechen sollten, bleiben die übrigen Teile des Dokumentes
                  in ihrem Inhalt und ihrer Gültigkeit davon unberührt.
                </li>
              </ul>
            </div>
            <div>
              <h2 className='text-xl font-semibold'>Bildnachweis</h2>
              Illustrationen von
              <Button asChild variant='link' className='text-md px-1'>
                <Link href='https://storyset.com' target='_blank'>
                  Storyset
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
