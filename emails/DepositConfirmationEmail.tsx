import { Heading, Section, Text } from "@react-email/components";

import { BaseLayout } from "@/emails/components/BaseLayout";
import { emailTheme } from "@/emails/components/theme";
import { EMAILS } from "@/lib/content";

export type DepositConfirmationEmailProps = {
  parentName: string;
  packageName: string;
  amountFormatted: string;
  groupName?: string | null;
  scheduleSlot?: string | null;
};

export function DepositConfirmationEmail({
  parentName,
  packageName,
  amountFormatted,
  groupName,
  scheduleSlot,
}: DepositConfirmationEmailProps) {
  const copy = EMAILS.depositConfirmation;
  const hasGroup = Boolean(groupName);

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
          margin: "0 0 24px",
        }}
      >
        {hasGroup ? copy.confirmedWithGroup : copy.confirmedWithoutGroup}
      </Text>

      <Section
        style={{
          backgroundColor: emailTheme.colors.cream,
          borderRadius: "12px",
          marginBottom: "24px",
          padding: "20px",
        }}
      >
        <Text style={summaryRowStyle}>
          <strong>{copy.packageLabel}:</strong> {packageName}
        </Text>
        {hasGroup ? (
          <>
            <Text style={summaryRowStyle}>
              <strong>{copy.groupLabel}:</strong> {groupName}
            </Text>
            {scheduleSlot ? (
              <Text style={summaryRowStyle}>
                <strong>{copy.scheduleLabel}:</strong> {scheduleSlot}
              </Text>
            ) : null}
          </>
        ) : null}
        <Text style={{ ...summaryRowStyle, marginBottom: 0 }}>
          <strong>{copy.amountLabel}:</strong> {amountFormatted}
        </Text>
      </Section>

      <Text
        style={{
          color: emailTheme.colors.olive700,
          fontSize: "15px",
          lineHeight: "24px",
          margin: 0,
        }}
      >
        {copy.closing}
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

export default DepositConfirmationEmail;
