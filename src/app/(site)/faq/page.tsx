import { Illustrations } from '@/lib/assets/illustrations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion';
import Image from 'next/image';
import Link from 'next/link';

export default function FAQ() {
  return (
    <div className='mb-8 px-4 sm:px-0 2xl:mb-56'>
      <div className='flex w-full flex-col items-start gap-2 pt-6 lg:w-2/3'>
        <h1 className='font-londrina text-4xl font-semibold tracking-wider'>
          FAQ
        </h1>
        <p className='text-md font-medium text-muted-foreground'>
          Hier findest du Antworten auf mögliche Fragen, die du zu FairTrack
          hast. <br />
          Kontaktiere uns gerne per
          <Link
            href='mailto:hallo@raupeimmersatt.de'
            className='pl-1 text-primary underline underline-offset-4'
          >
            E-Mail
          </Link>
          , wenn du keine Antwort auf deine Frage findest!
        </p>
      </div>

      <div className='flex gap-4'>
        <div className='mt-8 w-full rounded-lg bg-white px-6 py-2 pb-6 sm:px-10 sm:pt-6 sm:pb-10 lg:w-2/3'>
          <Accordion type='multiple'>
            <AccordionItem value='item-1'>
              <AccordionTrigger className='text-sm sm:text-lg'>
                Wozu dient FairTrack?
              </AccordionTrigger>
              <AccordionContent>
                In Deutschland landen jedes Jahr über 18 Millionen Lebensmittel
                in der Tonne. Das entspricht der Hälfte unserer produzierten
                Nahrungsmittel. Vieles davon wäre noch genießbar und wird aus
                Überproduktionsgründen, falschem Kaufverhalten oder optischen
                Mängeln entsorgt. Gegen diese Verschwendung engagieren sich
                Initiativen wie Foodsharing e.V. und viele Privatpersonen, indem
                sie aktiv Lebensmittel retten. Damit dieses Engagement sichtbar
                und mit validen Zahlen belegbar wird, wurde FairTrack
                entwickelt. FairTrack dient als Tool für öffentlicher Fairteiler
                und Abgabestellen, mit dessen Hilfe Lebensmittelspenden erfasst
                werden können.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2'>
              <AccordionTrigger className='text-sm sm:text-lg'>
                Wie funktioniert FairTrack?
              </AccordionTrigger>
              <AccordionContent>
                Als Foodsaver*in kannst du in deiner Abgabestelle über FairTrack
                deine Abgabe dokumentieren. Eine detaillierte Beschreibung der
                einzelnen Steps findest du hier. Auf deinem persönlichen
                Dashboard kannst du einsehen, wie viele Lebensmittel du schon
                gerettet und abgegeben hast, sowie die Gesamtzahl der geretteten
                Lebensmittel an deinen Fairteiler-Standorten.
                <br />
                <br />
                Die Fairteiler-Verantwortlichen haben dank FairTrack einen
                Überblick, welche und wie viele geretteten Lebensmittel sich
                gerade in ihren Lagerräumen und Fairteilern befinden und bis
                wann diese fairteilt werden müssen. So wird sichergestellt, dass
                nichts verdirbt und möglichst wenige Lebensmittel am Ende
                entsorgt werden.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-3'>
              <AccordionTrigger className='text-sm sm:text-lg'>
                Wie kann ich FairTrack nutzen?
              </AccordionTrigger>
              <AccordionContent>
                Melde dich einfach mit deiner Emailadresse oder deiner
                Telefonnummer an und schon ist dein persönliches FairTrack-Konto
                aktiv. Ab sofort kannst du über den digitalen Rettezettel, deine
                Abgabe an den Fairteiler-Abgabestellen eintragen.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-4'>
              <AccordionTrigger className='text-sm sm:text-lg'>
                Wer steckt hinter FairTrack?
              </AccordionTrigger>
              <AccordionContent>
                FairTrack ist aus einem Uniprojekt hervorgegangen, das in
                Zusammenarbeit zwischen der Hochschule der Medien Stuttgart und
                dem Foodsharing-Café Raupe Immersatt in Stuttgart entstanden
                ist. Etwa 20 Studierende haben an diesem Projekt gearbeitet, mit
                dem Ziel, den Prozess der Lebensmittelabgabe zu digitalisieren,
                um zukünftig Wirkungsmessungen durchführen zu können. Die
                beteiligten Teams umfassten verschiedene Disziplinen von
                Organisation über Design bis hin zur technischen Umsetzung.
                <br />
                <br />
                Als Teilnehmer des Uniprojekts hat Danilo Ley Alves das Projekt
                übernommen und FairTrack als Plattform weiter ausgebaut. Im
                Fokus steht dabei die kontinuierliche Weiterentwicklung der
                Nutzungsoberfläche für die Anforderungen im täglichen
                Café-Betrieb und die Foodsaver*innen einen genaueren Einblick
                über ihre Beiträge im Kampf gegen Lebensmittelverschwendung zu
                ermöglichen.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className='hidden w-1/3 lg:block'>
          <Image
            src={Illustrations.faqIllustration}
            alt='faq illustration'
            className='mx-auto w-[300px] -translate-y-1/4'
            loading='eager'
            decoding='sync'
          />
        </div>
      </div>
    </div>
  );
}
