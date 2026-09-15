import { randomInt, randomUUID } from "crypto";

export function generatePaymentToken(): string {
  return randomUUID();
}

/**
 * Alfabet bez znaków dwuznacznych (brak 0/O, 1/I/L), żeby klient mógł przepisać
 * kod z SMS-a bez pomyłki.
 */
const SHORT_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const SHORT_CODE_LENGTH = 10;

/**
 * Kod do krótkiego linku `/p/<code>`. Kolizje łapie unikalny indeks w bazie,
 * więc wywołujący ponawia z nowym kodem.
 */
export function generateShortCode(): string {
  let code = "";

  for (let index = 0; index < SHORT_CODE_LENGTH; index += 1) {
    code += SHORT_CODE_ALPHABET[randomInt(SHORT_CODE_ALPHABET.length)];
  }

  return code;
}
