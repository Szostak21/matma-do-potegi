import { Heading, Section, Text } from "@react-email/components";

import { BaseLayout } from "@/emails/components/BaseLayout";
import { emailTheme } from "@/emails/components/theme";

export type AdminNotificationEmailProps = {
  preview: string;
  heading: string;
  intro: string;
  rows: { label: string; value: string }[];
};

export function AdminNotificationEmail({
  preview,
  heading,
  intro,
  rows,
}: AdminNotificationEmailProps) {
  return (
    <BaseLayout preview={preview}>
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
        {heading}
      </Heading>

      <Text
        style={{
          color: emailTheme.colors.inkMuted,
          fontSize: "15px",
          lineHeight: "24px",
          margin: "0 0 24px",
        }}
      >
        {intro}
      </Text>

      <Section
        style={{
          backgroundColor: emailTheme.colors.cream,
          borderRadius: "12px",
          marginBottom: "0",
          padding: "20px",
        }}
      >
        {rows.map((row, index) => (
          <Text
            key={row.label}
            style={{
              ...summaryRowStyle,
              marginBottom: index === rows.length - 1 ? 0 : "8px",
            }}
          >
            <strong>{row.label}:</strong> {row.value}
          </Text>
        ))}
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

export default AdminNotificationEmail;
