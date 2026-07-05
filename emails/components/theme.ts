export const emailTheme = {
  colors: {
    cream: "#f7f5ee",
    creamDeep: "#efece0",
    ink: "#1a1a1a",
    inkMuted: "#4a4a4a",
    inkSubtle: "#6b6b6b",
    olive600: "#5f6543",
    olive700: "#4b5036",
    white: "#ffffff",
    border: "rgba(26, 26, 26, 0.1)",
  },
  fonts: {
    serif: "Georgia, 'Times New Roman', serif",
    sans: "Arial, Helvetica, sans-serif",
  },
  radius: {
    card: "16px",
    button: "9999px",
  },
  spacing: {
    page: "32px 16px",
    card: "32px",
    section: "24px",
  },
} as const;

export const primaryButtonStyle = {
  backgroundColor: emailTheme.colors.ink,
  borderRadius: emailTheme.radius.button,
  color: emailTheme.colors.white,
  display: "inline-block" as const,
  fontFamily: emailTheme.fonts.sans,
  fontSize: "14px",
  fontWeight: "600" as const,
  lineHeight: "1",
  padding: "14px 28px",
  textDecoration: "none",
  textAlign: "center" as const,
};
