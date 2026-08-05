-- AlterTable
ALTER TABLE "matma"."Lead" ADD COLUMN "referredById" TEXT,
ADD COLUMN "referralRewardApplied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "firstMonthDiscountGrosze" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "matma"."Lead" ADD CONSTRAINT "Lead_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "matma"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Lead_referredById_idx" ON "matma"."Lead"("referredById");
