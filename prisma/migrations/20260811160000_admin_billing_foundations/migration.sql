-- LeadStatus: remap legacy values, then replace enum
-- 1) Map UNVERIFIED / SUSPENDED before dropping them
UPDATE "matma"."Lead" AS l
SET "status" = 'PENDING_DEPOSIT'::"matma"."LeadStatus"
WHERE l."status"::text = 'UNVERIFIED';

UPDATE "matma"."Lead" AS l
SET "status" = (
  CASE
    WHEN EXISTS (
      SELECT 1 FROM "matma"."Payment" p
      WHERE p."leadId" = l."id"
        AND p."type" = 'DEPOSIT'
        AND p."status" = 'PAID'
    ) THEN 'PAID_DEPOSIT'
    ELSE 'CANCELLED'
  END
)::"matma"."LeadStatus"
WHERE l."status"::text = 'SUSPENDED';

-- 2) New enum type
CREATE TYPE "matma"."LeadStatus_new" AS ENUM (
  'PENDING_DEPOSIT',
  'PAID_DEPOSIT',
  'ACTIVE',
  'CANCELLED',
  'RESIGNED',
  'REFUNDED'
);

ALTER TABLE "matma"."Lead"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "matma"."Lead"
  ALTER COLUMN "status" TYPE "matma"."LeadStatus_new"
  USING ("status"::text::"matma"."LeadStatus_new");

ALTER TABLE "matma"."Lead"
  ALTER COLUMN "status" SET DEFAULT 'PENDING_DEPOSIT'::"matma"."LeadStatus_new";

DROP TYPE "matma"."LeadStatus";

ALTER TYPE "matma"."LeadStatus_new" RENAME TO "LeadStatus";

-- Lead operational fields
ALTER TABLE "matma"."Lead"
  ADD COLUMN IF NOT EXISTS "skipDeposit" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "resignedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "tuitionStartMonth" DATE;

CREATE INDEX IF NOT EXISTS "Lead_status_idx" ON "matma"."Lead"("status");
CREATE INDEX IF NOT EXISTS "Lead_requestedPackage_idx" ON "matma"."Lead"("requestedPackage");

-- TuitionPeriod enums + table
CREATE TYPE "matma"."TuitionPeriodStatus" AS ENUM ('DUE', 'PAID', 'PARTIAL', 'WAIVED');
CREATE TYPE "matma"."TuitionPaymentMethod" AS ENUM ('TRANSFER', 'CASH', 'STRIPE', 'OTHER');

CREATE TABLE "matma"."TuitionPeriod" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "periodMonth" DATE NOT NULL,
  "amountDueGrosze" INTEGER NOT NULL,
  "amountPaidGrosze" INTEGER NOT NULL DEFAULT 0,
  "status" "matma"."TuitionPeriodStatus" NOT NULL DEFAULT 'DUE',
  "paidAt" TIMESTAMP(3),
  "paymentMethod" "matma"."TuitionPaymentMethod",
  "transferTitle" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TuitionPeriod_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TuitionPeriod_leadId_periodMonth_key" ON "matma"."TuitionPeriod"("leadId", "periodMonth");
CREATE INDEX "TuitionPeriod_status_periodMonth_idx" ON "matma"."TuitionPeriod"("status", "periodMonth");

ALTER TABLE "matma"."TuitionPeriod"
  ADD CONSTRAINT "TuitionPeriod_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "matma"."Lead"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
