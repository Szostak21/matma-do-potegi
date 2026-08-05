import { createElement, type ReactElement } from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";

import { AdminNotificationEmail } from "@/emails/AdminNotificationEmail";
import { DepositConfirmationEmail } from "@/emails/DepositConfirmationEmail";
import { PaymentLinkEmail } from "@/emails/PaymentLinkEmail";
import { EMAILS, FOOTER } from "@/lib/content";
import { formatPln } from "@/lib/money";

let resendClient: Resend | null = null;

export const DEFAULT_FROM =
  process.env.EMAIL_FROM ?? "MatmaDoPotęgi <noreply@matmadopotegi.pl>";

const DEFAULT_REPLY_TO = FOOTER.email;

const DEFAULT_ADMIN_RECIPIENTS = [
  "kontakt@matmadopotegi.pl",
] as const;

export const ADMIN_NOTIFICATION_RECIPIENTS =
  process.env.ADMIN_NOTIFICATION_EMAILS?.split(",")
    .map((email) => email.trim())
    .filter(Boolean) ?? [...DEFAULT_ADMIN_RECIPIENTS];

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

export async function sendEmail({
  to,
  subject,
  react,
  replyTo = DEFAULT_REPLY_TO,
}: SendEmailInput): Promise<{ ok: boolean }> {
  try {
    const resend = getResend();

    if (!resend) {
      return { ok: false };
    }

    const html = await render(react);

    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error("Resend send failed:", error);
      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    console.error("sendEmail failed:", error);
    return { ok: false };
  }
}

export type PaymentLinkEmailParams = {
  to: string;
  parentName: string;
  packageName?: string | null;
  amountGrosze: number;
  payUrl: string;
  renewal?: boolean;
};

export async function sendPaymentLinkEmail(
  params: PaymentLinkEmailParams,
): Promise<{ ok: boolean }> {
  const copy = EMAILS.paymentLink;
  const renewal = params.renewal ?? false;

  return sendEmail({
    to: params.to,
    subject: renewal ? copy.renewalSubject : copy.subject,
    react: createElement(PaymentLinkEmail, {
      parentName: params.parentName,
      packageName: params.packageName,
      amountFormatted: formatPln(params.amountGrosze),
      payUrl: params.payUrl,
      renewal,
    }),
  });
}

export type DepositConfirmationEmailParams = {
  to: string;
  parentName: string;
  amountGrosze: number;
  packageName?: string | null;
  referralUrl?: string | null;
};

export async function sendDepositConfirmationEmail(
  params: DepositConfirmationEmailParams,
): Promise<{ ok: boolean }> {
  return sendEmail({
    to: params.to,
    subject: EMAILS.depositConfirmation.subject,
    react: createElement(DepositConfirmationEmail, {
      parentName: params.parentName,
      amountFormatted: formatPln(params.amountGrosze),
      packageName: params.packageName,
      referralUrl: params.referralUrl,
    }),
  });
}

export type AdminLeadNotificationParams = {
  parentName: string;
  phone: string;
  email: string;
  packageName: string;
};

export async function sendAdminLeadNotification(
  params: AdminLeadNotificationParams,
): Promise<{ ok: boolean }> {
  const copy = EMAILS.adminNewLead;

  return sendEmail({
    to: ADMIN_NOTIFICATION_RECIPIENTS,
    subject: copy.subject(params.parentName),
    replyTo: params.email,
    react: createElement(AdminNotificationEmail, {
      preview: copy.preview,
      heading: copy.heading,
      intro: copy.intro,
      rows: [
        { label: copy.parentLabel, value: params.parentName },
        { label: copy.phoneLabel, value: params.phone },
        { label: copy.emailLabel, value: params.email },
        { label: copy.packageLabel, value: params.packageName },
      ],
    }),
  });
}

export type AdminDepositNotificationParams = {
  parentName: string;
  packageName: string;
  amountGrosze: number;
  leadId: string;
};

export async function sendAdminDepositNotification(
  params: AdminDepositNotificationParams,
): Promise<{ ok: boolean }> {
  const copy = EMAILS.adminDeposit;

  return sendEmail({
    to: ADMIN_NOTIFICATION_RECIPIENTS,
    subject: copy.subject(params.parentName),
    react: createElement(AdminNotificationEmail, {
      preview: copy.preview,
      heading: copy.heading,
      intro: copy.intro,
      rows: [
        { label: copy.parentLabel, value: params.parentName },
        { label: copy.packageLabel, value: params.packageName },
        { label: copy.amountLabel, value: formatPln(params.amountGrosze) },
        { label: copy.leadIdLabel, value: params.leadId },
      ],
    }),
  });
}
