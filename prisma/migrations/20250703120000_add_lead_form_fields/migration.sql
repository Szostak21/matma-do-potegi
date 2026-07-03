-- AlterTable
ALTER TABLE "matma"."Lead" ADD COLUMN "requestedPackage" "matma"."PackageType",
ADD COLUMN "currentGrade" TEXT,
ADD COLUMN "expectedResult" TEXT;
