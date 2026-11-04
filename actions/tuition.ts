"use server";

import { revalidatePath } from "next/cache";
import {
  MessageChannel,
  TuitionPaymentMethod,
  TuitionPeriodStatus,
} from "@prisma/client";

import { assertAdminSecret } from "@/lib/auth";
import { formatTuitionDueDate, parseMonthInputValue } from "@/lib/dates";
import { packageLabel } from "@/lib/labels";
import { getMessageSender } from "@/lib/messages/channel";
import {
  buildMessageVariables,
  findUnknownVariables,
  renderMessage,
} from "@/lib/messages/render";
import { prisma } from "@/lib/prisma";
import {
  ensurePaymentLink,
  listBillingRows,
  markPeriodPaidManually,
  markPeriodWaived,
  setMessageSent,
  TuitionServiceError,
  upsertPeriod,
} from "@/lib/tuition/service";

/**
 * Akcje panelu Płatności. Cała logika siedzi w `lib/tuition/service.ts` — tutaj
 * zostaje autoryzacja, parsowanie wejścia i revalidacja panelu.
 */

export type TuitionActionResult = {
  status: "success" | "error";
  message?: string;
};

class UnauthorizedError extends Error {}

function authorize(secret: string): void {
  try {
    assertAdminSecret(secret);
  } catch {
    throw new UnauthorizedError("Brak uprawnień.");
  }
}

function describeError(error: unknown, fallback: string): string {
  if (error instanceof UnauthorizedError) {
    return "Brak uprawnień.";
  }

  if (error instanceof TuitionServiceError) {
    return error.message;
  }

  console.error("tuition action failed:", error);
  return fallback;
}

function requireMonth(monthValue: string): Date {
  const month = parseMonthInputValue(monthValue);

  if (!month) {
    throw new TuitionServiceError("Nieprawidłowy miesiąc rozliczeniowy.");
  }

  return month;
}

function requireAmount(value: number, label: string): number {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new TuitionServiceError(`${label}: podaj poprawną kwotę.`);
  }

  return value;
}

/** Dopełniacz po przyimku "do": 1 klienta, 2 klientów, 5 klientów. */
function pluralizeClients(count: number): string {
  return count === 1 ? "1 klienta" : `${count} klientów`;
}

export type UpdateBillingRowInput = {
  secret: string;
  leadId: string;
  /** Format `YYYY-MM`. */
  month: string;
  baseAmountGrosze: number;
  discountGrosze: number;
};

/** Kwota bazowa i zniżka jednego klienta w danym miesiącu (materializuje okres). */
export async function updateBillingRow(
  input: UpdateBillingRowInput,
): Promise<TuitionActionResult> {
  try {
    authorize(input.secret);

    const month = requireMonth(input.month);
    const baseAmountGrosze = requireAmount(input.baseAmountGrosze, "Kwota");
    const discountGrosze = requireAmount(input.discountGrosze, "Zniżka");

    if (baseAmountGrosze < 0) {
      throw new TuitionServiceError("Kwota nie może być ujemna.");
    }

    await upsertPeriod(input.leadId, month, {
      baseAmountGrosze,
      discountGrosze,
    });

    revalidatePath("/admin");

    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message: describeError(error, "Nie udało się zapisać kwoty."),
    };
  }
}

export type BulkSetBaseAmountInput = {
  secret: string;
  month: string;
  leadIds: string[];
  baseAmountGrosze: number;
};

/** "Zastosuj kwotę domyślną do zaznaczonych" — zniżki pozostają nietknięte. */
export async function bulkSetBaseAmount(
  input: BulkSetBaseAmountInput,
): Promise<TuitionActionResult> {
  try {
    authorize(input.secret);

    const month = requireMonth(input.month);
    const baseAmountGrosze = requireAmount(input.baseAmountGrosze, "Kwota");

    if (baseAmountGrosze < 0) {
      throw new TuitionServiceError("Kwota nie może być ujemna.");
    }

    if (input.leadIds.length === 0) {
      throw new TuitionServiceError("Nie zaznaczono żadnego klienta.");
    }

    const failures: string[] = [];

    for (const leadId of input.leadIds) {
      try {
        await upsertPeriod(leadId, month, { baseAmountGrosze });
      } catch (error) {
        failures.push(describeError(error, "Nie udało się zapisać kwoty."));
      }
    }

    revalidatePath("/admin");

    if (failures.length === input.leadIds.length) {
      return { status: "error", message: failures[0] };
    }

    return {
      status: "success",
      message:
        failures.length > 0
          ? `Zapisano ${input.leadIds.length - failures.length} z ${input.leadIds.length} — część okresów jest już rozliczona.`
          : `Zastosowano kwotę do ${pluralizeClients(input.leadIds.length)}.`,
    };
  } catch (error) {
    return {
      status: "error",
      message: describeError(error, "Nie udało się zastosować kwoty."),
    };
  }
}

export type GeneratedMessage = {
  leadId: string;
  periodId: string;
  displayName: string;
  phoneNumber: string;
  amountDueGrosze: number;
  payUrl: string;
  body: string;
  messageSentAt: string | null;
};

export type GenerateMessagesResult =
  | {
      status: "success";
      messages: GeneratedMessage[];
      /** Klienci pominięci wraz z powodem (np. okres już opłacony). */
      skipped: Array<{ displayName: string; reason: string }>;
      unknownVariables: string[];
      /** `false` gdy kanał wysyła sam (przyszły SMSAPI) — panel nie pokazuje wtedy listy do kopiowania. */
      requiresManualCopy: boolean;
    }
  | { status: "error"; message: string };

export type GeneratePaymentMessagesInput = {
  secret: string;
  month: string;
  leadIds: string[];
  templateBody: string;
};

/**
 * Serce trybu manualnego: materializuje okresy, dorabia linki i renderuje treści.
 * Ta sama funkcja obsłuży wysyłkę automatyczną — zmieni się tylko `MessageSender`.
 */
export async function generatePaymentMessages(
  input: GeneratePaymentMessagesInput,
): Promise<GenerateMessagesResult> {
  try {
    authorize(input.secret);

    const month = requireMonth(input.month);
    const templateBody = input.templateBody.trim();

    if (!templateBody) {
      throw new TuitionServiceError("Treść wiadomości jest pusta.");
    }

    if (input.leadIds.length === 0) {
      throw new TuitionServiceError("Nie zaznaczono żadnego klienta.");
    }

    const unknownVariables = findUnknownVariables(templateBody);
    const rows = await listBillingRows(month);
    const rowByLeadId = new Map(rows.map((row) => [row.leadId, row]));

    const messages: GeneratedMessage[] = [];
    const skipped: Array<{ displayName: string; reason: string }> = [];
    const dueDateLabel = formatTuitionDueDate(month);
    const sender = getMessageSender();

    for (const leadId of input.leadIds) {
      const row = rowByLeadId.get(leadId);

      if (!row) {
        continue;
      }

      if (row.status !== TuitionPeriodStatus.DUE) {
        skipped.push({
          displayName: row.displayName,
          reason:
            row.status === TuitionPeriodStatus.PAID
              ? "już opłacone"
              : row.status === TuitionPeriodStatus.WAIVED
                ? "umorzone"
                : "opłacone częściowo",
        });
        continue;
      }

      if (row.amountDueGrosze <= 0) {
        skipped.push({
          displayName: row.displayName,
          reason: "kwota do zapłaty to 0 zł",
        });
        continue;
      }

      try {
        const period = await upsertPeriod(leadId, month);
        const link = await ensurePaymentLink(period.id);

        const rendered = renderMessage(
          templateBody,
          buildMessageVariables({
            displayName: row.displayName,
            parentName: row.parentName,
            amountDueGrosze: period.amountDueGrosze,
            month,
            packageName: packageLabel(row.packageType),
            payUrl: link.url,
            dueDateLabel,
            transferTitle: period.transferTitle,
          }),
        );

        // Tryb manualny nic nie wysyła; automat zwróci tu błąd operatora.
        const sendResult = await sender.send({
          to: row.phoneNumber,
          body: rendered.body,
        });

        if (!sendResult.ok) {
          skipped.push({
            displayName: row.displayName,
            reason: sendResult.error ?? "błąd wysyłki",
          });
          continue;
        }

        messages.push({
          leadId,
          periodId: period.id,
          displayName: row.displayName,
          phoneNumber: row.phoneNumber,
          amountDueGrosze: period.amountDueGrosze,
          payUrl: link.url,
          body: rendered.body,
          messageSentAt: period.messageSentAt?.toISOString() ?? null,
        });
      } catch (error) {
        skipped.push({
          displayName: row.displayName,
          reason: describeError(error, "nie udało się utworzyć linku"),
        });
      }
    }

    revalidatePath("/admin");

    return {
      status: "success",
      messages,
      skipped,
      unknownVariables,
      requiresManualCopy: sender.requiresManualCopy,
    };
  } catch (error) {
    return {
      status: "error",
      message: describeError(error, "Nie udało się wygenerować wiadomości."),
    };
  }
}

export type ToggleMessageSentInput = {
  secret: string;
  periodId: string;
  sent: boolean;
};

export async function toggleMessageSent(
  input: ToggleMessageSentInput,
): Promise<TuitionActionResult> {
  try {
    authorize(input.secret);
    await setMessageSent(input.periodId, input.sent);
    revalidatePath("/admin");

    return { status: "success" };
  } catch (error) {
    return {
      status: "error",
      message: describeError(error, "Nie udało się zmienić znacznika."),
    };
  }
}

export type MarkPeriodPaidInput = {
  secret: string;
  periodId: string;
  /** `WAIVED` jako metoda oznacza umorzenie okresu. */
  method: TuitionPaymentMethod | "WAIVED";
};

export async function markPeriodPaid(
  input: MarkPeriodPaidInput,
): Promise<TuitionActionResult> {
  try {
    authorize(input.secret);

    if (input.method === "WAIVED") {
      await markPeriodWaived(input.periodId);
      revalidatePath("/admin");
      return { status: "success", message: "Okres umorzony." };
    }

    await markPeriodPaidManually(input.periodId, input.method);
    revalidatePath("/admin");

    return { status: "success", message: "Oznaczono jako opłacone." };
  } catch (error) {
    return {
      status: "error",
      message: describeError(error, "Nie udało się oznaczyć wpłaty."),
    };
  }
}

export type SaveMessageTemplateInput = {
  secret: string;
  /** Brak `id` = nowy szablon. */
  id?: string;
  name: string;
  body: string;
};

export async function saveMessageTemplate(
  input: SaveMessageTemplateInput,
): Promise<TuitionActionResult> {
  try {
    authorize(input.secret);

    const name = input.name.trim();
    const body = input.body.trim();

    if (!name) {
      throw new TuitionServiceError("Podaj nazwę szablonu.");
    }

    if (!body) {
      throw new TuitionServiceError("Treść szablonu jest pusta.");
    }

    const unknown = findUnknownVariables(body);

    if (unknown.length > 0) {
      throw new TuitionServiceError(
        `Nieznane zmienne: ${unknown.map((name) => `{${name}}`).join(", ")}`,
      );
    }

    if (input.id) {
      await prisma.messageTemplate.update({
        where: { id: input.id },
        data: { name, body },
      });
    } else {
      const count = await prisma.messageTemplate.count({
        where: { channel: MessageChannel.SMS },
      });

      await prisma.messageTemplate.create({
        data: {
          name,
          body,
          channel: MessageChannel.SMS,
          sortOrder: count,
        },
      });
    }

    revalidatePath("/admin");

    return { status: "success", message: "Szablon zapisany." };
  } catch (error) {
    return {
      status: "error",
      message: describeError(error, "Nie udało się zapisać szablonu."),
    };
  }
}

export type DeleteMessageTemplateInput = {
  secret: string;
  id: string;
};

export async function deleteMessageTemplate(
  input: DeleteMessageTemplateInput,
): Promise<TuitionActionResult> {
  try {
    authorize(input.secret);

    await prisma.messageTemplate.delete({ where: { id: input.id } });
    revalidatePath("/admin");

    return { status: "success", message: "Szablon usunięty." };
  } catch (error) {
    return {
      status: "error",
      message: describeError(error, "Nie udało się usunąć szablonu."),
    };
  }
}

export type UpdateStandingDiscountInput = {
  secret: string;
  leadId: string;
  standingDiscountGrosze: number;
};

/** Stała zniżka klienta — edytowana na karcie klienta, stosowana w każdym miesiącu. */
export async function updateStandingDiscount(
  input: UpdateStandingDiscountInput,
): Promise<TuitionActionResult> {
  try {
    authorize(input.secret);

    const standingDiscountGrosze = requireAmount(
      input.standingDiscountGrosze,
      "Zniżka",
    );

    await prisma.lead.update({
      where: { id: input.leadId },
      data: { standingDiscountGrosze },
    });

    revalidatePath("/admin");

    return { status: "success", message: "Stała zniżka zapisana." };
  } catch (error) {
    return {
      status: "error",
      message: describeError(error, "Nie udało się zapisać zniżki."),
    };
  }
}
