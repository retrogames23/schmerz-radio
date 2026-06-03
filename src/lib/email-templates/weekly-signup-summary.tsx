import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

const SITE_NAME = "WHISPER·QUEST";
const RECIPIENT = "stephan.doerner@posteo.de";

interface SignupRow {
  email: string | null;
  created_at: string;
}

interface Props {
  rangeLabel?: string;
  signups?: SignupRow[];
  totalAccounts?: number;
}

function fmt(ts: string): string {
  try {
    return new Date(ts).toLocaleString("de-DE", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Berlin",
    });
  } catch {
    return ts;
  }
}

const WeeklySignupSummaryEmail = ({
  rangeLabel = "letzte 7 Tage",
  signups = [],
  totalAccounts = 0,
}: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>
      {signups.length} neue Accounts in den letzten 7 Tagen
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Wöchentliche Account-Zusammenfassung</Heading>
        <Text style={text}>
          Zeitraum: <strong>{rangeLabel}</strong>
          <br />
          Neue Accounts: <strong>{signups.length}</strong>
          <br />
          Accounts insgesamt: <strong>{totalAccounts}</strong>
        </Text>
        {signups.length === 0 ? (
          <Text style={text}>
            Keine neuen Registrierungen in diesem Zeitraum.
          </Text>
        ) : (
          <>
            <Heading style={h2}>Neue Registrierungen</Heading>
            {signups.map((s, i) => (
              <Text key={String(i)} style={row}>
                <strong>{s.email || "(keine Email)"}</strong>
                <br />
                <span style={muted}>{fmt(s.created_at)}</span>
              </Text>
            ))}
          </>
        )}
        <Text style={footer}>— {SITE_NAME}</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: WeeklySignupSummaryEmail,
  subject: "WHISPER·QUEST — wöchentliche Account-Zusammenfassung",
  displayName: "Wöchentliche Account-Zusammenfassung",
  to: RECIPIENT,
  previewData: {
    rangeLabel: "26.05.2026 – 02.06.2026",
    totalAccounts: 6,
    signups: [
      { email: "stephan.doerner@gmail.com", created_at: "2026-06-02T23:22:33Z" },
      { email: "flobot23@gmail.com", created_at: "2026-05-29T08:12:00Z" },
    ],
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
};
const container = { padding: "32px 24px", maxWidth: "560px" };
const h1 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#111111",
  margin: "0 0 20px",
};
const h2 = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#111111",
  margin: "24px 0 12px",
};
const text = {
  fontSize: "15px",
  color: "#333333",
  lineHeight: "1.6",
  margin: "0 0 18px",
};
const row = {
  fontSize: "14px",
  color: "#222222",
  lineHeight: "1.5",
  margin: "0 0 12px",
  paddingBottom: "10px",
  borderBottom: "1px solid #eeeeee",
};
const muted = { color: "#888888", fontSize: "12px" };
const footer = {
  fontSize: "13px",
  color: "#888888",
  margin: "28px 0 0",
};