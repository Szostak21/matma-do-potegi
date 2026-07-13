-- AlterTable
ALTER TABLE "matma"."Group" ALTER COLUMN "maxCapacity" SET DEFAULT 8;

-- Update existing groups from old capacity limit
UPDATE "matma"."Group" SET "maxCapacity" = 8 WHERE "maxCapacity" = 4;
