import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface FeedbackNotificationEmailProps {
  category: 'bug' | 'feature' | 'improvement' | 'general';
  message: string;
  userName: string;
  userEmail: string;
  fairteilerName?: string;
  submittedAt: string;
}

const categoryLabels = {
  bug: 'Fehler melden',
  feature: 'Feature-Wunsch',
  improvement: 'Verbesserungsvorschlag',
  general: 'Allgemeines Feedback',
};

const categoryColors = {
  bug: '#dc2626',
  feature: '#2563eb',
  improvement: '#16a34a',
  general: '#6b7280',
};

export function FeedbackNotificationEmail({
  category,
  message,
  userName,
  userEmail,
  fairteilerName,
  submittedAt,
}: FeedbackNotificationEmailProps) {
  const categoryLabel = categoryLabels[category];
  const categoryColor = categoryColors[category];

  return (
    <Html>
      <Head />
      <Preview>Neues Feedback: {categoryLabel}</Preview>
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
            <Text style={title}>Neues Feedback erhalten</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={paragraph}>
              Ein neues Feedback wurde über die FairTrack-Plattform eingereicht:
            </Text>

            <Section style={detailsSection}>
              <div style={detailRow}>
                <Text style={detailLabel}>Kategorie:</Text>
                <span
                  style={{ ...categoryBadge, backgroundColor: categoryColor }}
                >
                  {categoryLabel}
                </span>
              </div>

              <div style={detailRow}>
                <Text style={detailLabel}>Von:</Text>
                <Text style={detailValue}>
                  {userName} ({userEmail})
                </Text>
              </div>

              {fairteilerName && (
                <div style={detailRow}>
                  <Text style={detailLabel}>Fairteiler:</Text>
                  <Text style={detailValue}>{fairteilerName}</Text>
                </div>
              )}

              <div style={detailRow}>
                <Text style={detailLabel}>Eingereicht:</Text>
                <Text style={detailValue}>{submittedAt}</Text>
              </div>
            </Section>

            <Section style={messageSection}>
              <Text style={messageLabel}>Nachricht:</Text>
              <div style={messageBox}>
                <Text style={messageText}>{message}</Text>
              </div>
            </Section>

            <Text style={disclaimer}>
              <em>
                Diese E-Mail wurde automatisch generiert. Bitte antworten Sie
                direkt an die E-Mail-Adresse des Benutzers, falls eine
                Rückmeldung erforderlich ist.
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
  padding: '40px 30px',
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
  padding: '40px 30px',
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
  padding: '50px',
};

const paragraph = {
  fontSize: '18px',
  lineHeight: '25.2px',
  color: '#666666',
  margin: '0 0 30px 0',
};

const detailsSection = {
  margin: '30px 0',
  padding: '25px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
};

const detailRow = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  gap: '15px',
};

const detailLabel = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0',
  minWidth: '100px',
};

const detailValue = {
  fontSize: '16px',
  color: '#666666',
  margin: '0',
};

const categoryBadge = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '16px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
};

const messageSection = {
  margin: '40px 0',
};

const messageLabel = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#333333',
  margin: '0 0 15px 0',
};

const messageBox = {
  padding: '25px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
  borderLeft: '4px solid #99bb44',
};

const messageText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
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
