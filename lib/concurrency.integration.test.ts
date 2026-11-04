import {
  LeadStatus,
  PackageType,
  PaymentStatus,
  PaymentType,
  PrismaClient,
  TuitionPeriodStatus,
} from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.INTEGRATION_DATABASE_URL;
const PARALLEL = 8;

describe.skipIf(!url)("concurrency against PostgreSQL", () => {
  let db: PrismaClient;
  let markPaymentPaid: typeof import("@/lib/payment-completion").markPaymentPaid;
  let assertPackageHasCapacity: typeof import("@/lib/packages").assertPackageHasCapacity;
  let appPrisma: typeof import("@/lib/prisma").prisma;
  const createdLeadIds: string[] = [];

  beforeAll(async () => {
    const host = new URL(url!).hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      throw new Error(
        `INTEGRATION_DATABASE_URL must point at localhost, got ${host}`,
      );
    }

    // Prisma fills missing env vars from .env; explicit empty values keep email and ads off.
    process.env.DATABASE_URL = url;
    process.env.DIRECT_URL = url;
    process.env.RESEND_API_KEY = "";
    process.env.META_CAPI_ACCESS_TOKEN = "";
    process.env.STRIPE_SECRET_KEY = "";
    db = new PrismaClient({ datasourceUrl: url });

    ({ markPaymentPaid } = await import("@/lib/payment-completion"));
    ({ assertPackageHasCapacity } = await import("@/lib/packages"));
    ({ prisma: appPrisma } = await import("@/lib/prisma"));
  });

  afterAll(async () => {
    for (const id of createdLeadIds) {
      await db.lead.delete({ where: { id } }).catch(() => undefined);
    }
    await db.$disconnect();
    await appPrisma?.$disconnect();
  });

  async function createLead(
    overrides: { requestedPackage?: PackageType; status?: LeadStatus } = {},
  ) {
    const lead = await db.lead.create({
      data: {
        parentName: "Race Test",
        phoneNumber: "+48 500 000 000",
        email: `race-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
        requestedPackage:
          overrides.requestedPackage ?? PackageType.OSMOKLASISTA,
        status: overrides.status ?? LeadStatus.PENDING_DEPOSIT,
      },
    });
    createdLeadIds.push(lead.id);
    return lead;
  }

  it("marks a deposit paid exactly once when the webhook and the return page race", async () => {
    const lead = await createLead();
    const payment = await db.payment.create({
      data: { leadId: lead.id, type: PaymentType.DEPOSIT, amount: 20000 },
    });

    const results = await Promise.all(
      Array.from({ length: PARALLEL }, () => markPaymentPaid(payment.id)),
    );

    expect(results.filter((r) => r.didTransition)).toHaveLength(1);
    const after = await db.payment.findUniqueOrThrow({
      where: { id: payment.id },
    });
    expect(after.status).toBe(PaymentStatus.PAID);
    const leadAfter = await db.lead.findUniqueOrThrow({
      where: { id: lead.id },
    });
    expect(leadAfter.status).toBe(LeadStatus.PAID_DEPOSIT);
  });

  it("adds a tuition payment to its period once, not once per caller", async () => {
    const lead = await createLead({ status: LeadStatus.ACTIVE });
    const period = await db.tuitionPeriod.create({
      data: {
        leadId: lead.id,
        periodMonth: new Date("2026-10-01"),
        baseAmountGrosze: 41000,
        amountDueGrosze: 41000,
      },
    });
    const payment = await db.payment.create({
      data: {
        leadId: lead.id,
        type: PaymentType.SUBSCRIPTION,
        amount: 41000,
        billingPeriod: new Date("2026-10-01"),
        tuitionPeriodId: period.id,
      },
    });

    await Promise.all(
      Array.from({ length: PARALLEL }, () => markPaymentPaid(payment.id)),
    );

    const after = await db.tuitionPeriod.findUniqueOrThrow({
      where: { id: period.id },
    });
    expect(after.amountPaidGrosze).toBe(41000);
    expect(after.status).toBe(TuitionPeriodStatus.PAID);
  });

  it("lets only one of several parallel sign-ups take the last seat", async () => {
    const packageType = PackageType.OSMOKLASISTA;
    const taken = await db.lead.count({
      where: {
        requestedPackage: packageType,
        isDeleted: false,
        status: {
          in: [
            LeadStatus.PENDING_DEPOSIT,
            LeadStatus.PAID_DEPOSIT,
            LeadStatus.ACTIVE,
          ],
        },
      },
    });
    const { PACKAGE_CAPACITY } = await import("@/lib/constants");
    for (let i = taken; i < PACKAGE_CAPACITY[packageType] - 1; i += 1) {
      await createLead({ requestedPackage: packageType });
    }

    const attempts = await Promise.allSettled(
      Array.from({ length: PARALLEL }, () =>
        appPrisma.$transaction(async (tx) => {
          await assertPackageHasCapacity(packageType, tx);
          const lead = await tx.lead.create({
            data: {
              parentName: "Race Test",
              phoneNumber: "+48 500 000 000",
              email: `race-seat-${Math.random().toString(36).slice(2)}@example.com`,
              requestedPackage: packageType,
            },
          });
          createdLeadIds.push(lead.id);
          return lead;
        }),
      ),
    );

    expect(attempts.filter((a) => a.status === "fulfilled")).toHaveLength(1);
  });
});
