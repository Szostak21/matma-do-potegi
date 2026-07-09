import { Button, Heading, Link, Section, Text } from "@react-email/components";

import { BaseLayout } from "@/emails/components/BaseLayout";
import { emailTheme, primaryButtonStyle } from "@/emails/components/theme";
import { EMAILS, DEPOSIT_PAYMENT, PACKAGE_AVAILABILITY } from "@/lib/content";

export type PaymentLinkEmailProps = {
  parentName: string;
  packageName?: string | null;
  amountFormatted: string;
  payUrl: string;
  renewal?: boolean;
};

export function PaymentLinkEmail({
  parentName,
  packageName,
  amountFormatted,
  payUrl,
  renewal = false,
}: PaymentLinkEmailProps) {
  const copy = EMAILS.paymentLink;

  return (
    <BaseLayout preview={renewal ? copy.renewalPreview : copy.preview}>
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
        {copy.title}
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
        {renewal ? copy.renewalIntro : copy.intro}
      </Text>

      <Section
        style={{
          backgroundColor: emailTheme.colors.cream,
          borderRadius: "12px",
          marginBottom: "24px",
          padding: "20px",
        }}
      >
        {packageName ? (
          <Text style={summaryRowStyle}>
            <strong>{copy.packageLabel}:</strong> {packageName}
          </Text>
        ) : null}
        <Text style={summaryRowStyle}>
          <strong>{copy.startNoteLabel}:</strong>{" "}
          {PACKAGE_AVAILABILITY.octoberNote}
        </Text>
        <Text style={summaryRowStyle}>
          <strong>{copy.amountLabel}:</strong> {amountFormatted}
        </Text>
        <Text style={{ ...summaryRowStyle, marginBottom: 0 }}>
          <strong>{copy.expiryLabel}:</strong> {copy.expiryValue}
        </Text>
      </Section>

      <Section
        style={{
          backgroundColor: emailTheme.colors.creamDeep,
          border: `1px solid ${emailTheme.colors.border}`,
          borderRadius: "12px",
          marginBottom: "24px",
          padding: "16px",
        }}
      >
        <Text
          style={{
            color: emailTheme.colors.inkMuted,
            fontSize: "14px",
            lineHeight: "22px",
            margin: 0,
          }}
        >
          {DEPOSIT_PAYMENT.depositNote}
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
