-- Tryb manualny płatności: linki provider-agnostyczne, rozbicie kwoty czesnego, szablony wiadomości.

-- 1) Nowe enumy
CREATE TYPE "matma"."PaymentProvider" AS ENUM ('STRIPE', 'TPAY');
CREATE TYPE "matma"."MessageChannel" AS ENUM ('SMS', 'EMAIL');

-- 2) Payment: uniezależnienie od Stripe (rename zachowuje dane) + krótki kod + powiązanie z okresem
ALTER TABLE "matma"."Payment"
  RENAME COLUMN "stripeSessionId" TO "providerSessionId";

ALTER TABLE "matma"."Payment"
  RENAME COLUMN "stripeSessionUrl" TO "providerCheckoutUrl";

ALTER INDEX IF EXISTS "matma"."Payment_stripeSessionId_key"
  RENAME TO "Payment_providerSessionId_key";

ALTER TABLE "matma"."Payment"
  ADD COLUMN IF NOT EXISTS "shortCode" TEXT,
  ADD COLUMN IF NOT EXISTS "provider" "matma"."PaymentProvider" NOT NULL DEFAULT 'STRIPE',
  ADD COLUMN IF NOT EXISTS "tuitionPeriodId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_shortCode_key"
  ON "matma"."Payment"("shortCode");

CREATE INDEX IF NOT EXISTS "Payment_tuitionPeriodId_idx"
  ON "matma"."Payment"("tuitionPeriodId");

ALTER TABLE "matma"."Payment"
  ADD CONSTRAINT "Payment_tuitionPeriodId_fkey"
  FOREIGN KEY ("tuitionPeriodId") REFERENCES "matma"."TuitionPeriod"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 3) Lead: stała zniżka miesięczna
ALTER TABLE "matma"."Lead"
  ADD COLUMN IF NOT EXISTS "standingDiscountGrosze" INTEGER NOT NULL DEFAULT 0;

-- 4) TuitionPeriod: rozbicie kwoty na bazę i zniżkę + znacznik wysłania
ALTER TABLE "matma"."TuitionPeriod"
  ADD COLUMN IF NOT EXISTS "baseAmountGrosze" INTEGER,
  ADD COLUMN IF NOT EXISTS "discountGrosze" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "messageSentAt" TIMESTAMP(3);

-- Backfill: istniejące okresy nie miały rozbicia, więc baza = dotychczasowa kwota należna.
UPDATE "matma"."TuitionPeriod"
SET "baseAmountGrosze" = "amountDueGrosze"
WHERE "baseAmountGrosze" IS NULL;

ALTER TABLE "matma"."TuitionPeriod"
  ALTER COLUMN "baseAmountGrosze" SET NOT NULL;

-- 5) Szablony wiadomości
CREATE TABLE "matma"."MessageTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "channel" "matma"."MessageChannel" NOT NULL DEFAULT 'SMS',
  "body" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MessageTemplate_channel_sortOrder_idx"
  ON "matma"."MessageTemplate"("channel", "sortOrder");

-- 6) RLS zgodnie z hardeningiem schematu matma (Prisma łączy się jako postgres, więc jest nietknięta).
-- TuitionPeriod dostaje ją tu, bo migracja tworząca tabelę ją pominęła.
ALTER TABLE "matma"."TuitionPeriod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "matma"."MessageTemplate" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "matma"."MessageTemplate" FROM PUBLIC;
REVOKE ALL ON TABLE "matma"."MessageTemplate" FROM anon, authenticated;
GRANT ALL ON TABLE "matma"."MessageTemplate" TO postgres;
