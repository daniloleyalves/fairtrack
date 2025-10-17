import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface InviteMemberEmailProps {
  url: string;
  fairteilerName: string;
}

export function InviteMemberEmail({
  url,
  fairteilerName,
}: InviteMemberEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Einladung zum FairTeiler {fairteilerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <div style={headerSpacer} />
          </Section>

          <Section style={logoSection}>
            <Img
              src='https://www.fairteiler-tracker.de/logo.svg'
              width='200'
              alt='FairTrack Logo'
              style={logo}
            />
          </Section>

          <Section style={titleSection}>
            <Text style={title}>Fairteilereinladung</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={greeting}>Hallo,</Text>
            <Text style={paragraph}>
              Du erhältst diese E-Mail, weil du zum FairTeiler{' '}
              <strong>{fairteilerName}</strong> eingeladen wurdest!
            </Text>
            <Text style={paragraph}>
              Um die Einladung anzunehmen, folge bitte dem Link
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={url}>
                Fairteiler beitreten
              </Button>
            </Section>

            <Text style={disclaimer}>
              <em>
                Wenn du diese Einladung nicht erwartest oder nicht annehmen
                möchtest, kannst du diese E-Mail einfach ignorieren.
              </em>
            </Text>
          </Section>

          <Section style={footerSection}>
            <div style={footerSpacer} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f9f9f9',
  fontFamily: "'Lato', sans-serif",
};

const container = {
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  backgroundColor: '#f9f9f9',
};

const headerSection = {
  backgroundColor: '#99bb44',
  padding: '15px',
};

const headerSpacer = {
  borderTop: '1px solid #99bb44',
  height: '1px',
};

const logoSection = {
  backgroundColor: '#ffffff',
  padding: '25px 10px',
  textAlign: 'center' as const,
};

const logo = {
  maxWidth: '200px',
  height: 'auto',
};

const titleSection = {
  backgroundColor: '#99bb44',
  padding: '30px 10px',
  textAlign: 'center' as const,
};

const title = {
  fontSize: '28px',
  lineHeight: '39.2px',
  color: '#ffffff',
  fontFamily: "'Lato', sans-serif",
  margin: '0',
  textAlign: 'center' as const,
};

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '40px',
};

const greeting = {
  fontSize: '18px',
  lineHeight: '25.2px',
  color: '#666666',
  margin: '0 0 20px 0',
};

const paragraph = {
  fontSize: '18px',
  lineHeight: '25.2px',
  color: '#666666',
  margin: '0 0 20px 0',
};

const buttonSection = {
  textAlign: 'left' as const,
  margin: '20px 0',
};

const button = {
  backgroundColor: '#446622',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'normal',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '15px 40px',
  lineHeight: '21.6px',
};

const disclaimer = {
  fontSize: '14px',
  lineHeight: '19.6px',
  color: '#888888',
  margin: '20px 0 0 0',
};

const footerSection = {
  backgroundColor: '#99bb44',
  padding: '15px',
};

const footerSpacer = {
  borderTop: '1px solid #99bb44',
  height: '1px',
};
