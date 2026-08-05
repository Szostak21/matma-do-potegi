import {
  Heading,
  Link,
  Section,
  Text,
} from "@react-email/components";

import { BaseLayout } from "@/emails/components/BaseLayout";
import { emailTheme, primaryButtonStyle } from "@/emails/components/theme";
import { EMAILS } from "@/lib/content";

export type DepositConfirmationEmailProps = {
  parentName: string;
  amountFormatted: string;
  packageName?: string | null;
  referralUrl?: string | null;
};

export function DepositConfirmationEmail({
  parentName,
  amountFormatted,
  packageName,
  referralUrl,
}: DepositConfirmationEmailProps) {
  const copy = EMAILS.depositConfirmation;
  const shareMailto = referralUrl
    ? `mailto:?subject=${encodeURIComponent(copy.referralMailtoSubject)}&body=${encodeURIComponent(copy.referralMailtoBody(referralUrl))}`
    : undefined;

  return (
    <BaseLayout preview={copy.preview}>
      {referralUrl && shareMailto ? (
        <Section
          style={{
            backgroundColor: emailTheme.colors.creamDeep,
            borderRadius: "12px",
            marginBottom: "24px",
            padding: "20px",
            border: `1px solid ${emailTheme.colors.border}`,
          }}
        >
          <Heading
            as="h3"
            style={{
              color: emailTheme.colors.ink,
              fontFamily: emailTheme.fonts.serif,
              fontSize: "20px",
              fontWeight: "400",
              letterSpacing: "-0.02em",
              lineHeight: "28px",
              margin: "0 0 10px",
            }}
          >
            {copy.referralHeading}
          </Heading>
          <Text
            style={{
              color: emailTheme.colors.inkMuted,
              fontSize: "14px",
              lineHeight: "22px",
              margin: "0 0 16px",
            }}
          >
            {copy.referralBodyLine1}
            <br />
            {copy.referralBodyLine2}
          </Text>
          <Text
            style={{
              color: emailTheme.colors.inkSubtle,
              fontSize: "12px",
              lineHeight: "18px",
              margin: "0 0 8px",
            }}
          >
            {copy.referralLinkLabel}
          </Text>
          <Text
            style={{
              color: emailTheme.colors.olive700,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "12px",
              lineHeight: "18px",
              margin: "0 0 16px",
              wordBreak: "break-all" as const,
            }}
          >
            {referralUrl}
          </Text>
          <Link href={shareMailto} style={primaryButtonStyle}>
            {copy.referralCta}
          </Link>
        </Section>
      ) : null}

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
        Płatność potwierdzona
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
          margin: "0 0 16px",
        }}
      >
        {copy.thanks}
      </Text>

      <Text
        style={{
          color: emailTheme.colors.inkMuted,
          fontSize: "15px",
          lineHeight: "24px",
          margin: "0 0 16px",
        }}
      >
        {copy.confirmed}
      </Text>

      <Text
        style={{
          color: emailTheme.colors.inkMuted,
          fontSize: "15px",
          lineHeight: "24px",
          margin: "0 0 16px",
        }}
      >
        {copy.confirmedNextSteps}
      </Text>

      <Text
        style={{
          color: emailTheme.colors.inkMuted,
          fontSize: "15px",
          lineHeight: "24px",
          margin: "0 0 24px",
        }}
      >
        {copy.confirmedClosing}
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
        <Text style={{ ...summaryRowStyle, marginBottom: 0 }}>
          <strong>{copy.amountLabel}:</strong> {amountFormatted}
        </Text>
      </Section>
    </BaseLayout>
  );
}

const summaryRowStyle = {
  color: emailTheme.colors.inkMuted,
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 8px",
};

export default DepositConfirmationEmail;
