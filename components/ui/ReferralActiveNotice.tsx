type ReferralActiveNoticeProps = {
  className?: string;
};

/**
 * Spokojny komunikat: zniżka z polecenia jest aktywna (bez agresywnego CTA).
 */
export function ReferralActiveNotice({ className }: ReferralActiveNoticeProps) {
  return (
    <div
      className={
        className ??
        "rounded-2xl border border-olive-200 bg-olive-50/70 px-4 py-3 ring-1 ring-ink/5"
      }
      role="status"
    >
      <p className="text-sm leading-relaxed text-olive-900">
        Zniżka -50zł na pierwszy miesiąc aktywna!
      </p>
    </div>
  );
}
