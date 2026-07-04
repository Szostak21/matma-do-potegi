-- AlterTable
ALTER TABLE "matma"."Payment"
ADD COLUMN "stripeSessionId" TEXT,
ADD COLUMN "stripeSessionUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeSessionId_key" ON "matma"."Payment"("stripeSessionId");
