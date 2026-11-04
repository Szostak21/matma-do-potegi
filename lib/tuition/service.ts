import "server-only";

import {
  LeadStatus,
  PaymentStatus,
  PaymentType,
  Prisma,
  TuitionPaymentMethod,
  TuitionPeriodStatus,
  type Lead,
  type TuitionPeriod,
} from "@prisma/client";

import { leadDisplayName, type AdminBillingRow } from "@/lib/admin-tabs";
import { toMonthInputValue } from "@/lib/dates";
import { buildShortPaymentUrl } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { generatePaymentToken, generateShortCode } from "@/lib/tokens";
import {
  computeAmountDue,
  computeSuggestedAmounts,
  resolveBillingMonth,
  type SuggestedAmounts,
  type SuggestionContext,
} from "@/lib/tuition/amounts";

export { resolveBillingMonth };

/**
 * Serwis czesnego — cała logika kwot, okresów i linków płatniczych.
 *
 * Świadomie bez `FormData` i bez zależności od Reacta: te same funkcje obsłużą
 * dzisiejszy panel manualny i przyszłe crony wysyłające SMS-y automatycznie.
 */

/** Klienci, którzy trafiają na listę płatności. Rezygnacje i anulacje pomijamy. */
const BILLABLE_LEAD_STATUSES: LeadStatus[] = [
  LeadStatus.ACTIVE,
  LeadStatus.PAID_DEPOSIT,
];

export type BillingRow = AdminBillingRow;

export type PeriodPatch = {
  baseAmountGrosze?: number;
  discountGrosze?: number;
};

function sameUtcMonth(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth()
  );
}

function buildTransferTitle(leadId: string, month: Date): string {
  return `MDP ${toMonthInputValue(month)} ${leadId.slice(0, 8)}`;
}

function toBillingRow(
  lead: Lead,
  period: TuitionPeriod | null,
  suggestion: SuggestedAmounts,
  context: SuggestionContext,
  shortCode: string | null,
): BillingRow {
  const baseAmountGrosze =
    period?.baseAmountGrosze ?? suggestion.baseAmountGrosze;
  const discountGrosze = period?.discountGrosze ?? suggestion.discountGrosze;

  return {
    leadId: lead.id,
    periodId: period?.id ?? null,
    parentName: lead.parentName,
    studentName: lead.studentName,
    displayName: leadDisplayName(lead),
    phoneNumber: lead.phoneNumber,
    packageType: lead.requestedPackage,
    baseAmountGrosze,
    discountGrosze,
    amountDueGrosze:
      period?.amountDueGrosze ??
      computeAmountDue(baseAmountGrosze, discountGrosze),
    amountPaidGrosze: period?.amountPaidGrosze ?? 0,
    status: period?.status ?? TuitionPeriodStatus.DUE,
    paymentMethod: period?.paymentMethod ?? null,
    messageSentAt: period?.messageSentAt?.toISOString() ?? null,
    transferTitle: period?.transferTitle ?? null,
    payUrl: shortCode ? buildShortPaymentUrl(shortCode) : null,
    isFirstBillableMonth: context.isFirstBillableMonth,
  };
}

/**
 * Wiersze panelu dla wybranego miesiąca: istniejące okresy plus **wirtualne**
 * propozycje dla klientów, którzy jeszcze go nie mają. Dzięki temu samo wejście
 * na zakładkę nie tworzy rekordów — okres materializuje się przy pierwszej edycji
 * albo przy generowaniu wiadomości.
 */
export async function listBillingRows(month: Date): Promise<BillingRow[]> {
  const leads = await prisma.lead.findMany({
    where: {
      isDeleted: false,
      status: { in: BILLABLE_LEAD_STATUSES },
    },
    orderBy: [{ studentName: "asc" }, { parentName: "asc" }],
  });

  if (leads.length === 0) {
    return [];
  }

  const leadIds = leads.map((lead) => lead.id);

  const [periods, paidDeposits, subscriptionPayments] = await Promise.all([
    prisma.tuitionPeriod.findMany({
      where: { leadId: { in: leadIds } },
      orderBy: { periodMonth: "desc" },
    }),
    prisma.payment.findMany({
      where: {
        leadId: { in: leadIds },
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PAID,
      },
      select: { leadId: true },
    }),
    prisma.payment.findMany({
      where: {
        leadId: { in: leadIds },
        type: PaymentType.SUBSCRIPTION,
        billingPeriod: month,
        shortCode: { not: null },
      },
      select: { leadId: true, shortCode: true },
    }),
  ]);

  const paidDepositLeadIds = new Set(paidDeposits.map((row) => row.leadId));
  const shortCodeByLeadId = new Map(
    subscriptionPayments.map((row) => [row.leadId, row.shortCode]),
  );

  const periodsByLeadId = new Map<string, TuitionPeriod[]>();
  for (const period of periods) {
    const existing = periodsByLeadId.get(period.leadId);
    if (existing) {
      existing.push(period);
    } else {
      periodsByLeadId.set(period.leadId, [period]);
    }
  }

  return leads.map((lead) => {
    const leadPeriods = periodsByLeadId.get(lead.id) ?? [];
    const period =
      leadPeriods.find((candidate) =>
        sameUtcMonth(candidate.periodMonth, month),
      ) ?? null;

    const isFirstBillableMonth = lead.tuitionStartMonth
      ? sameUtcMonth(lead.tuitionStartMonth, month)
      : leadPeriods.length === 0 ||
        (leadPeriods.length === 1 && Boolean(period));

    // Stawka indywidualnych pochodzi z ostatniego wcześniejszego okresu.
    const previousPeriod = leadPeriods.find(
      (candidate) => candidate.periodMonth < month,
    );

    const context: SuggestionContext = {
      isFirstBillableMonth,
      hasPaidDeposit: paidDepositLeadIds.has(lead.id),
      previousBaseAmountGrosze: previousPeriod?.baseAmountGrosze ?? null,
    };

    return toBillingRow(
      lead,
      period,
      computeSuggestedAmounts(lead, context),
      context,
      shortCodeByLeadId.get(lead.id) ?? null,
    );
  });
}

/** Wyliczenie propozycji dla jednego klienta (materializacja poza panelem). */
async function suggestForLead(
  lead: Lead,
  month: Date,
): Promise<SuggestedAmounts> {
  const [periodCount, previousPeriod, paidDeposit] = await Promise.all([
    prisma.tuitionPeriod.count({ where: { leadId: lead.id } }),
    prisma.tuitionPeriod.findFirst({
      where: { leadId: lead.id, periodMonth: { lt: month } },
      orderBy: { periodMonth: "desc" },
      select: { baseAmountGrosze: true },
    }),
    prisma.payment.findFirst({
      where: {
        leadId: lead.id,
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PAID,
      },
      select: { id: true },
    }),
  ]);

  return computeSuggestedAmounts(lead, {
    isFirstBillableMonth: lead.tuitionStartMonth
      ? sameUtcMonth(lead.tuitionStartMonth, month)
      : periodCount === 0,
    hasPaidDeposit: Boolean(paidDeposit),
    previousBaseAmountGrosze: previousPeriod?.baseAmountGrosze ?? null,
  });
}

export class TuitionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TuitionServiceError";
  }
}

/**
 * Materializacja i edycja okresu. `amountDueGrosze` zawsze przeliczamy z bazy
 * i zniżki, więc nie da się zapisać niespójnej kwoty.
 */
export async function upsertPeriod(
  leadId: string,
  month: Date,
  patch: PeriodPatch = {},
): Promise<TuitionPeriod> {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!lead || lead.isDeleted) {
    throw new TuitionServiceError("Nie znaleziono klienta.");
  }

  const existing = await prisma.tuitionPeriod.findUnique({
    where: { leadId_periodMonth: { leadId, periodMonth: month } },
  });

  if (existing) {
    if (
      existing.status === TuitionPeriodStatus.PAID ||
      existing.status === TuitionPeriodStatus.WAIVED
    ) {
      throw new TuitionServiceError(
        "Okres jest już rozliczony — kwoty nie można zmienić.",
      );
    }

    const baseAmountGrosze =
      patch.baseAmountGrosze ?? existing.baseAmountGrosze;
    const discountGrosze = patch.discountGrosze ?? existing.discountGrosze;

    return prisma.tuitionPeriod.update({
      where: { id: existing.id },
      data: {
        baseAmountGrosze,
        discountGrosze,
        amountDueGrosze: computeAmountDue(baseAmountGrosze, discountGrosze),
      },
    });
  }

  const suggestion = await suggestForLead(lead, month);
  const baseAmountGrosze =
    patch.baseAmountGrosze ?? suggestion.baseAmountGrosze;
  const discountGrosze = patch.discountGrosze ?? suggestion.discountGrosze;

  try {
    return await prisma.tuitionPeriod.create({
      data: {
        leadId,
        periodMonth: month,
        baseAmountGrosze,
        discountGrosze,
        amountDueGrosze: computeAmountDue(baseAmountGrosze, discountGrosze),
        status: TuitionPeriodStatus.DUE,
        transferTitle: buildTransferTitle(leadId, month),
      },
    });
  } catch (error) {
    // Równoległa materializacja tego samego okresu — wygrywa pierwszy zapis.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return upsertPeriod(leadId, month, patch);
    }

    throw error;
  }
}

export type PaymentLink = {
  paymentId: string;
  shortCode: string;
  url: string;
};

/**
 * Idempotentnie zapewnia link płatniczy dla okresu. Kwota nie jest zamrażana:
 * strona `/p/<code>` czyta aktualne `amountDueGrosze`, więc korekta kwoty
 * w panelu nie wymaga rozsyłania nowego linku.
 */
export async function ensurePaymentLink(
  periodId: string,
): Promise<PaymentLink> {
  const period = await prisma.tuitionPeriod.findUnique({
    where: { id: periodId },
  });

  if (!period) {
    throw new TuitionServiceError("Nie znaleziono okresu rozliczeniowego.");
  }

  if (period.amountDueGrosze <= 0) {
    throw new TuitionServiceError(
      "Kwota do zapłaty wynosi 0 — link nie jest potrzebny.",
    );
  }

  const existing = await prisma.payment.findUnique({
    where: {
      leadId_billingPeriod_type: {
        leadId: period.leadId,
        billingPeriod: period.periodMonth,
        type: PaymentType.SUBSCRIPTION,
      },
    },
  });

  if (existing) {
    if (existing.shortCode && existing.status === PaymentStatus.PENDING) {
      return {
        paymentId: existing.id,
        shortCode: existing.shortCode,
        url: buildShortPaymentUrl(existing.shortCode),
      };
    }

    if (existing.status === PaymentStatus.PAID) {
      throw new TuitionServiceError("Ten okres został już opłacony online.");
    }

    // Anulowany lub bez kodu (np. po ręcznym oznaczeniu, a potem korekcie) — reaktywujemy.
    const shortCode = existing.shortCode ?? (await claimShortCode());

    const updated = await prisma.payment.update({
      where: { id: existing.id },
      data: {
        shortCode,
        status: PaymentStatus.PENDING,
        amount: period.amountDueGrosze,
        tuitionPeriodId: period.id,
        expiresAt: null,
        providerSessionId: null,
        providerCheckoutUrl: null,
      },
    });

    return {
      paymentId: updated.id,
      shortCode,
      url: buildShortPaymentUrl(shortCode),
    };
  }

  const shortCode = await claimShortCode();

  const created = await prisma.payment.create({
    data: {
      token: generatePaymentToken(),
      shortCode,
      leadId: period.leadId,
      type: PaymentType.SUBSCRIPTION,
      amount: period.amountDueGrosze,
      billingPeriod: period.periodMonth,
      tuitionPeriodId: period.id,
      // Czesne nie wygasa z czasem — o ważności decyduje status okresu.
      expiresAt: null,
    },
  });

  return {
    paymentId: created.id,
    shortCode,
    url: buildShortPaymentUrl(shortCode),
  };
}

const SHORT_CODE_ATTEMPTS = 5;

/** Losuje kod i sprawdza unikalność; kolizja przy 31^10 możliwościach jest skrajnie rzadka. */
async function claimShortCode(): Promise<string> {
  for (let attempt = 0; attempt < SHORT_CODE_ATTEMPTS; attempt += 1) {
    const candidate = generateShortCode();
    const taken = await prisma.payment.findUnique({
      where: { shortCode: candidate },
      select: { id: true },
    });

    if (!taken) {
      return candidate;
    }
  }

  throw new TuitionServiceError(
    "Nie udało się wygenerować unikalnego kodu linku.",
  );
}

/** Wpłata poza bramką (gotówka, przelew) — zamyka okres i wyłącza link. */
export async function markPeriodPaidManually(
  periodId: string,
  method: TuitionPaymentMethod,
): Promise<void> {
  const period = await prisma.tuitionPeriod.findUnique({
    where: { id: periodId },
    include: { payments: true },
  });

  if (!period) {
    throw new TuitionServiceError("Nie znaleziono okresu rozliczeniowego.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.tuitionPeriod.update({
      where: { id: periodId },
      data: {
        status: TuitionPeriodStatus.PAID,
        amountPaidGrosze: period.amountDueGrosze,
        paidAt: new Date(),
        paymentMethod: method,
      },
    });

    const pendingPaymentIds = period.payments
      .filter((payment) => payment.status === PaymentStatus.PENDING)
      .map((payment) => payment.id);

    if (pendingPaymentIds.length > 0) {
      await tx.payment.updateMany({
        where: { id: { in: pendingPaymentIds } },
        data: { status: PaymentStatus.CANCELLED },
      });
    }
  });
}

/** Umorzenie — okres przestaje być należny, link traci ważność. */
export async function markPeriodWaived(periodId: string): Promise<void> {
  const period = await prisma.tuitionPeriod.findUnique({
    where: { id: periodId },
    include: { payments: true },
  });

  if (!period) {
    throw new TuitionServiceError("Nie znaleziono okresu rozliczeniowego.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.tuitionPeriod.update({
      where: { id: periodId },
      data: { status: TuitionPeriodStatus.WAIVED, paidAt: null },
    });

    const pendingPaymentIds = period.payments
      .filter((payment) => payment.status === PaymentStatus.PENDING)
      .map((payment) => payment.id);

    if (pendingPaymentIds.length > 0) {
      await tx.payment.updateMany({
        where: { id: { in: pendingPaymentIds } },
        data: { status: PaymentStatus.CANCELLED },
      });
    }
  });
}

/** Znacznik "Wysłane" — w trybie manualnym przełączany ręcznie z panelu. */
export async function setMessageSent(
  periodId: string,
  sent: boolean,
): Promise<void> {
  await prisma.tuitionPeriod.update({
    where: { id: periodId },
    data: { messageSentAt: sent ? new Date() : null },
  });
}
