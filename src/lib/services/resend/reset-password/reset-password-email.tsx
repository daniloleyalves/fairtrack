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

interface ResetPasswordEmailProps {
  url: string;
}

export function ResetPasswordEmail({ url }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Passwort zurücksetzen für dein FairTrack Konto</Preview>
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
            <Text style={title}>Passwort zurücksetzen</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={greeting}>Hallo,</Text>
            <Text style={paragraph}>
              dir wurde diese E-Mail als Antwort auf deine Anfrage zum
              Zurücksetzen deines Passworts gesendet.
            </Text>
            <Text style={paragraph}>
              Um dein Passwort zurückzusetzen, folge bitte dem folgenden Link.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={url}>
                Passwort zurücksetzen
              </Button>
            </Section>

            <Text style={disclaimer}>
              <em>
                Bitte ignoriere diese E-Mail, wenn du keine Passwortänderung
                angefordert hast.
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
  backgroundColor: '#446622',
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
  marginLeft: 'auto',
  marginRight: 'auto',
};

const titleSection = {
  backgroundColor: '#446622',
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
  backgroundColor: '#99bb44',
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
  backgroundColor: '#446622',
  padding: '15px',
};

const footerSpacer = {
  borderTop: '1px solid #99bb44',
  height: '1px',
};
