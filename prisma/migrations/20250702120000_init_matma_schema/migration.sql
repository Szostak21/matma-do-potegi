-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "matma";

-- CreateEnum
CREATE TYPE "matma"."LeadStatus" AS ENUM ('UNVERIFIED', 'PENDING_DEPOSIT', 'ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "matma"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "matma"."PaymentType" AS ENUM ('DEPOSIT', 'FIRST_MONTH_TOPUP', 'SUBSCRIPTION', 'INDIVIDUAL_LESSON');

-- CreateEnum
CREATE TYPE "matma"."PackageType" AS ENUM ('MATURA_ROZSZERZONA', 'MATURA_PODSTAWOWA', 'OSMOKLASISTA', 'INDYWIDUALNE');

-- CreateEnum
CREATE TYPE "matma"."UserRole" AS ENUM ('OWNER', 'TEACHER', 'STUDENT');

-- CreateTable
CREATE TABLE "matma"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "matma"."UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matma"."Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matma"."Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "packageType" "matma"."PackageType" NOT NULL,
    "scheduleSlot" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL DEFAULT 4,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "priceMonthly" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL DEFAULT 5000,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matma"."Lead" (
    "id" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "studentName" TEXT,
    "status" "matma"."LeadStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "groupId" TEXT,
    "balanceCredit" INTEGER NOT NULL DEFAULT 0,
    "firstMonthPaid" BOOLEAN NOT NULL DEFAULT false,
    "activePaymentId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matma"."Payment" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "matma"."PaymentType" NOT NULL,
    "status" "matma"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "billingPeriod" DATE,
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "matma"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_token_key" ON "matma"."Payment"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_leadId_billingPeriod_type_key" ON "matma"."Payment"("leadId", "billingPeriod", "type");

-- AddForeignKey
ALTER TABLE "matma"."Group" ADD CONSTRAINT "Group_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "matma"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matma"."Lead" ADD CONSTRAINT "Lead_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "matma"."Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matma"."Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "matma"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matma"."Payment" ADD CONSTRAINT "Payment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "matma"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
