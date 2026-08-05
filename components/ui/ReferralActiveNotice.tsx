import { cn } from "@/lib/cn";

type ReferralActiveNoticeProps = {
  className?: string;
};

/**
 * Chmurka: zniżka z polecenia jest aktywna (formularz + podsumowanie).
 */
export function ReferralActiveNotice({ className }: ReferralActiveNoticeProps) {
  return (
    <div
      role="status"
      className={cn("relative mx-auto w-fit max-w-full px-1 pb-2.5", className)}
    >
      <div
        className={cn(
          "rounded-[1.75rem] bg-olive-100 px-5 py-2.5",
          "shadow-[0_1px_2px_rgb(0_0_0/0.04),0_6px_18px_rgb(75_80_54/0.08)]",
          "ring-1 ring-olive-200/60",
        )}
      >
        <p className="flex items-baseline justify-center gap-2 text-olive-900">
          <span className="font-serif text-[1.2rem] leading-none tracking-tight">
            −50&nbsp;zł
          </span>
          <span className="font-sans text-[0.8125rem] font-medium leading-none tracking-wide text-olive-700/90">
            zniżka aktywna
          </span>
        </p>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[calc(100%-11px)] -translate-x-1/2"
      >
        <span className="block border-x-[7px] border-t-[8px] border-x-transparent border-t-olive-200/60" />
        <span className="absolute left-1/2 top-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent border-t-olive-100" />
      </span>
    </div>
  );
}
