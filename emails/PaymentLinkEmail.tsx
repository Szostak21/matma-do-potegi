import { Button, Heading, Link, Section, Text } from "@react-email/components";

import { BaseLayout } from "@/emails/components/BaseLayout";
import { emailTheme, primaryButtonStyle } from "@/emails/components/theme";
import { EMAILS } from "@/lib/content";

export type PaymentLinkEmailProps = {
  parentName: string;
  groupName?: string | null;
  scheduleSlot?: string | null;
  amountFormatted: string;
  payUrl: string;
};

export function PaymentLinkEmail({
  parentName,
  groupName,
  scheduleSlot,
  amountFormatted,
  payUrl,
}: PaymentLinkEmailProps) {
  const copy = EMAILS.paymentLink;

  return (
    <BaseLayout preview={copy.preview}>
      <Heading
        as="h2"
        style={{
          color: emailTheme.colors.ink,
          fontFamily: emailTheme.fonts.serif,
          fontSize: "22px",
          fontWeight: "400",
          margin: "0 0 16px",
        }}
      >
        Kaucja rezerwacyjna
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.inkMuted,
          fontSize: "15px",
          lineHeight: "24px",
          margin: "0 0 16px",
        }}
      >
        {copy.greeting(parentName)}
      </Text>

      <Text
        style={{
          color: emailTheme.colors.inkMuted,
          fontSize: "15px",
          lineHeight: "24px",
          margin: "0 0 24px",
        }}
      >
        {copy.intro}
      </Text>

      <Section
        style={{
          backgroundColor: emailTheme.colors.cream,
          borderRadius: "12px",
          marginBottom: "24px",
          padding: "20px",
        }}
      >
        {groupName ? (
          <Text style={summaryRowStyle}>
            <strong>{copy.groupLabel}:</strong> {groupName}
          </Text>
        ) : null}
        {scheduleSlot ? (
          <Text style={summaryRowStyle}>
            <strong>{copy.scheduleLabel}:</strong> {scheduleSlot}
          </Text>
        ) : null}
        <Text style={summaryRowStyle}>
          <strong>{copy.amountLabel}:</strong> {amountFormatted}
        </Text>
        <Text style={{ ...summaryRowStyle, marginBottom: 0 }}>
          <strong>{copy.expiryLabel}:</strong> {copy.expiryValue}
        </Text>
      </Section>

      <Section style={{ marginBottom: "24px", textAlign: "center" }}>
        <Button href={payUrl} style={primaryButtonStyle}>
          {copy.cta}
        </Button>
      </Section>

      <Text
        style={{
          color: emailTheme.colors.inkSubtle,
          fontSize: "13px",
          lineHeight: "20px",
          margin: 0,
        }}
      >
        {copy.linkFallback}
        <br />
        <Link href={payUrl} style={{ color: emailTheme.colors.olive700 }}>
          {payUrl}
        </Link>
      </Text>
    </BaseLayout>
  );
}

const summaryRowStyle = {
  color: emailTheme.colors.inkMuted,
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 8px",
};

export default PaymentLinkEmail;
