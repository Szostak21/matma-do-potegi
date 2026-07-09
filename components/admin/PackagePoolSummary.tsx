import type { PackageType } from "@prisma/client";

import { Card } from "@/components/ui/Card";
import { PACKAGES } from "@/lib/constants";
import type { PackageAvailability } from "@/lib/packages";

type PackagePoolSummaryProps = {
  availability: PackageAvailability[];
};

export function PackagePoolSummary({ availability }: PackagePoolSummaryProps) {
  return (
    <Card className="mb-8">
      <h2 className="font-serif text-lg text-ink">Pula miejsc na poziomach</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {availability.map((entry) => (
          <div
            key={entry.packageType}
            className="rounded-2xl bg-oatmeal/80 px-4 py-3 ring-1 ring-ink/5"
          >
            <p className="text-sm font-medium text-ink">
              {PACKAGES[entry.packageType as PackageType]?.name ??
                entry.packageType}
            </p>
            <p className="mt-1 text-xs text-ink/60">
              Zajęte: {entry.taken} / {entry.capacity} · Wolne:{" "}
              {entry.available}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
