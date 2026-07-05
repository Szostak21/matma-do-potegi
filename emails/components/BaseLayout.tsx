import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

import { FOOTER } from "@/lib/content";

import { emailTheme } from "./theme";

type BaseLayoutProps = {
  preview: string;
  children: ReactNode;
};

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: emailTheme.colors.cream,
          fontFamily: emailTheme.fonts.sans,
          margin: 0,
          padding: emailTheme.spacing.page,
        }}
      >
        <Container
          style={{
            backgroundColor: emailTheme.colors.white,
            borderRadius: emailTheme.radius.card,
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
            margin: "0 auto",
            maxWidth: "560px",
            padding: emailTheme.spacing.card,
          }}
        >
          <Section style={{ marginBottom: emailTheme.spacing.section }}>
            <Heading
              as="h1"
              style={{
                color: emailTheme.colors.ink,
                fontFamily: emailTheme.fonts.serif,
                fontSize: "24px",
                fontWeight: "400",
                letterSpacing: "-0.02em",
                margin: "0 0 4px",
              }}
            >
              {FOOTER.brand}
            </Heading>
            <Text
              style={{
                color: emailTheme.colors.olive700,
                fontSize: "13px",
                margin: 0,
              }}
            >
              Korepetycje z matematyki · Kraków
            </Text>
          </Section>

          <Hr
            style={{
              borderColor: emailTheme.colors.border,
              margin: `0 0 ${emailTheme.spacing.section}`,
            }}
          />

          {children}

          <Hr
            style={{
              borderColor: emailTheme.colors.border,
              margin: `${emailTheme.spacing.section} 0`,
            }}
          />

          <Section>
            <Text
              style={{
                color: emailTheme.colors.inkSubtle,
                fontSize: "12px",
                lineHeight: "20px",
                margin: "0 0 8px",
              }}
            >
              {FOOTER.location}
            </Text>
            <Text
              style={{
                color: emailTheme.colors.inkSubtle,
                fontSize: "12px",
                lineHeight: "20px",
                margin: "0 0 8px",
              }}
            >
              <Link
                href={`mailto:${FOOTER.email}`}
                style={{ color: emailTheme.colors.olive700 }}
              >
                {FOOTER.email}
              </Link>
              {" · "}
              <Link
                href={`tel:${FOOTER.phone.replace(/\s/g, "")}`}
                style={{ color: emailTheme.colors.olive700 }}
              >
                {FOOTER.phone}
              </Link>
            </Text>
            <Text
              style={{
                color: emailTheme.colors.inkSubtle,
                fontSize: "11px",
                margin: 0,
              }}
            >
              {FOOTER.copyright}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
