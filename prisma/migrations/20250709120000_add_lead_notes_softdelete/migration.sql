-- AlterTable
ALTER TABLE "matma"."Lead" ADD COLUMN "notes" TEXT,
ADD COLUMN "placementTestNotes" TEXT,
ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
