import { createElement, type ReactElement } from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";

import { DepositConfirmationEmail } from "@/emails/DepositConfirmationEmail";
import { PaymentLinkEmail } from "@/emails/PaymentLinkEmail";
import { EMAILS, FOOTER } from "@/lib/content";
import { formatPln } from "@/lib/money";

let resendClient: Resend | null = null;

export const DEFAULT_FROM =
  process.env.EMAIL_FROM ?? "MatmaDoPotęgi <noreply@matmadopotegi.pl>";

const DEFAULT_REPLY_TO = FOOTER.email;

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
  to: string;
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
  groupName?: string | null;
  scheduleSlot?: string | null;
  amountGrosze: number;
  payUrl: string;
};

export async function sendPaymentLinkEmail(
  params: PaymentLinkEmailParams,
): Promise<{ ok: boolean }> {
  return sendEmail({
    to: params.to,
    subject: EMAILS.paymentLink.subject,
    react: createElement(PaymentLinkEmail, {
      parentName: params.parentName,
      groupName: params.groupName,
      scheduleSlot: params.scheduleSlot,
      amountFormatted: formatPln(params.amountGrosze),
      payUrl: params.payUrl,
    }),
  });
}

export type DepositConfirmationEmailParams = {
  to: string;
  parentName: string;
  amountGrosze: number;
  groupName?: string | null;
  scheduleSlot?: string | null;
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
      groupName: params.groupName,
      scheduleSlot: params.scheduleSlot,
    }),
  });
}
