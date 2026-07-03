import { Phone } from "lucide-react";

import { ALTERNATE_TERM_CONTACT, CONTACT_PHONE_TEL, DEPOSIT_PAYMENT } from "@/lib/content";

type PhoneGateVariant = "alternate-term" | "payment-doubt";

type AlternateTermPhoneGateProps = {
  variant?: PhoneGateVariant;
};

export function AlternateTermPhoneGate({
  variant = "alternate-term",
}: AlternateTermPhoneGateProps) {
  const title =
    variant === "payment-doubt"
      ? DEPOSIT_PAYMENT.phoneGateTitle
      : ALTERNATE_TERM_CONTACT.title;
  const phone = ALTERNATE_TERM_CONTACT.phone;

  return (
    <div className="rounded-2xl border-2 border-dashed border-ink/15 bg-white/50 p-6 text-center">
      <p className="font-medium text-ink">{title}</p>
      <a
        href={`tel:${CONTACT_PHONE_TEL}`}
        className="mt-3 inline-flex items-center gap-2 font-serif text-xl text-olive-800 underline-offset-4 hover:underline"
      >
        <Phone className="size-5 shrink-0" aria-hidden />
        {phone}
      </a>
    </div>
  );
}
