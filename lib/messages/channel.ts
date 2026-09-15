import "server-only";

/**
 * Kanał wysyłki wiadomości. Dziś działa wyłącznie tryb manualny: treść
 * generujemy w panelu i wysyłasz ją z telefonu. Po wejściu w SMSAPI dochodzi
 * druga implementacja tego interfejsu — reszta systemu się nie zmienia.
 */

export type SendResult = { ok: boolean; error?: string };

export type MessageSender = {
  id: "manual" | "smsapi";
  /** `true` gdy wiadomości trzeba skopiować ręcznie (panel pokazuje wtedy listę). */
  requiresManualCopy: boolean;
  send(input: { to: string; body: string }): Promise<SendResult>;
};

const manualSender: MessageSender = {
  id: "manual",
  requiresManualCopy: true,
  async send() {
    // Nic nie wysyłamy — wiadomość trafia do panelu do skopiowania.
    return { ok: true };
  },
};

export function getMessageSender(): MessageSender {
  return manualSender;
}
