import { formatBillingMonth } from "@/lib/dates";
import { formatPln } from "@/lib/money";

/**
 * Renderowanie szablonów wiadomości. Wspólne dla trybu manualnego (kopiuj-wklej)
 * i przyszłej wysyłki automatycznej — treść powstaje dokładnie tak samo.
 */

export type MessageVariables = {
  imie: string;
  rodzic: string;
  kwota: string;
  miesiac: string;
  poziom: string;
  link: string;
  termin: string;
  tytul_przelewu: string;
};

export const MESSAGE_VARIABLE_NAMES = [
  "imie",
  "rodzic",
  "kwota",
  "miesiac",
  "poziom",
  "link",
  "termin",
  "tytul_przelewu",
] as const satisfies ReadonlyArray<keyof MessageVariables>;

/** Opisy do podpowiedzi w panelu — jedno źródło prawdy dla UI i walidacji. */
export const MESSAGE_VARIABLE_HINTS: Record<keyof MessageVariables, string> = {
  imie: "Imię ucznia (gdy brak — rodzica)",
  rodzic: "Imię i nazwisko rodzica",
  kwota: "Kwota do zapłaty, np. 410,00 zł",
  miesiac: "Miesiąc rozliczeniowy, np. październik 2026",
  poziom: "Poziom zajęć",
  link: "Link do płatności",
  termin: "Termin płatności, np. 5 października",
  tytul_przelewu: "Tytuł przelewu dla wpłat ręcznych",
};

const PLACEHOLDER_PATTERN = /\{([a-z_]+)\}/g;

export type RenderResult = {
  body: string;
  /** Zmienne użyte w szablonie, których nie znamy — panel ostrzega przed literówką. */
  unknownVariables: string[];
};

export function renderMessage(
  template: string,
  variables: MessageVariables,
): RenderResult {
  const unknownVariables = new Set<string>();

  const body = template.replace(PLACEHOLDER_PATTERN, (match, name: string) => {
    if (name in variables) {
      return variables[name as keyof MessageVariables];
    }

    unknownVariables.add(name);
    return match;
  });

  return { body, unknownVariables: [...unknownVariables] };
}

/** Znajduje nierozpoznane zmienne bez renderowania (walidacja przy zapisie szablonu). */
export function findUnknownVariables(template: string): string[] {
  const unknown = new Set<string>();

  for (const match of template.matchAll(PLACEHOLDER_PATTERN)) {
    const name = match[1];
    if (!MESSAGE_VARIABLE_NAMES.includes(name as keyof MessageVariables)) {
      unknown.add(name);
    }
  }

  return [...unknown];
}

/** Pierwszy człon imienia — w SMS-ie brzmi naturalniej niż pełna nazwa. */
function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export type MessageVariablesInput = {
  displayName: string;
  parentName: string;
  amountDueGrosze: number;
  month: Date;
  packageName: string;
  payUrl: string;
  dueDateLabel: string;
  transferTitle: string | null;
};

export function buildMessageVariables(
  input: MessageVariablesInput,
): MessageVariables {
  return {
    imie: firstName(input.displayName),
    rodzic: input.parentName,
    kwota: formatPln(input.amountDueGrosze),
    miesiac: formatBillingMonth(input.month),
    poziom: input.packageName,
    link: input.payUrl,
    termin: input.dueDateLabel,
    tytul_przelewu: input.transferTitle ?? "",
  };
}

const GSM7_SEGMENT_LENGTH = 160;
const UCS2_SEGMENT_LENGTH = 70;

/**
 * Polskie znaki diakrytyczne wypychają SMS do kodowania UCS-2, co skraca segment
 * ze 160 do 70 znaków. Panel pokazuje to, żeby nie wysyłać przypadkiem 3 SMS-ów.
 */
export function countSmsSegments(body: string): {
  characters: number;
  segments: number;
  isUnicode: boolean;
} {
  const characters = [...body].length;
  const isUnicode = /[^\u0000-\u007F]/.test(body);
  const segmentLength = isUnicode ? UCS2_SEGMENT_LENGTH : GSM7_SEGMENT_LENGTH;

  return {
    characters,
    segments: characters === 0 ? 0 : Math.ceil(characters / segmentLength),
    isUnicode,
  };
}
