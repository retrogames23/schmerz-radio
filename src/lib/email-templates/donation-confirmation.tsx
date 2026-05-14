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

interface DonationConfirmationProps {
  amountFormatted?: string;
}

const DonationConfirmationEmail = ({
  amountFormatted,
}: DonationConfirmationProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Danke für deine Unterstützung von {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Danke für deine Unterstützung</Heading>
        <Text style={text}>
          {amountFormatted
            ? `Dein Beitrag über ${amountFormatted} ist bei uns angekommen.`
            : "Dein Beitrag ist bei uns angekommen."}{" "}
          Dein Account ist ab sofort für unbegrenzte Cloud-Chats mit den NPCs
          freigeschaltet — einfach wie gewohnt einloggen und weiterspielen.
        </Text>
        <Text style={text}>
          Damit hilfst du, die Server-, KI- und Sprach-Kosten von WHISPER·QUEST
          zu decken. Layard sagt: müde, aber dankbar.
        </Text>
        <Text style={footer}>— Stephan & das {SITE_NAME}-Team</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: DonationConfirmationEmail,
  subject: "Danke für deine Unterstützung von WHISPER·QUEST",
  displayName: "Unterstützungsbestätigung",
  previewData: { amountFormatted: "5,00 €" },
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
const text = {
  fontSize: "15px",
  color: "#333333",
  lineHeight: "1.6",
  margin: "0 0 18px",
};
const footer = {
  fontSize: "13px",
  color: "#888888",
  margin: "28px 0 0",
};