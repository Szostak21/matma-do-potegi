import { PACKAGES } from "@/lib/constants";
import { formatPln } from "@/lib/money";

export const CONTACT_PHONE = "+48 794 315 519";
export const CONTACT_PHONE_TEL = CONTACT_PHONE.replace(/\s/g, "");

export const NAV_LINKS = [
  { href: "/#o-nas", label: "O nas" },
  { href: "/#nauczyciel", label: "Nauczyciel" },
  { href: "/#oferta", label: "Oferta" },
  { href: "/#opinie", label: "Opinie" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#zapisy", label: "Zapisy" },
] as const;

export const HERO = {
  badge: "Zapisy otwarte",
  title: "Matura z matematyki bez stresu. Otwieramy drzwi na wymarzone studia.",
  subtitle:
    "Kameralne grupy premium (3–4 os.) na krakowskim Kurdwanowie. Autorskie materiały i pełne wsparcie tuż obok Twojego domu.",
  primaryCta: { label: "Zapisz się", href: "/#zapisy" },
  secondaryCta: { label: "Zobacz ofertę", href: "/#oferta" },
} as const;

export const FEATURES = [
  {
    title: "Kameralne grupy 3–4 osoby",
    description:
      "Każdy uczeń ma przestrzeń na pytania. Nie giniesz w tłumie — uczysz się w atmosferze, która sprzyja koncentracji i rozwojowi.",
    icon: "Users" as const,
  },
  {
    title: "Autorskie materiały",
    description:
      "Fizyczna teczka z zadaniami dopasowanymi do poziomu grupy. Cyfrowe paczki po każdej lekcji — także gdy Cię nie było.",
    icon: "BookOpen" as const,
  },
  {
    title: "Wsparcie między zajęciami",
    description:
      "Mikrogrupa na Messengerze dla każdej grupy. Pytasz o zadania asynchronicznie — odpowiadamy, gdy potrzebujesz.",
    icon: "MessageCircle" as const,
  },
  {
    title: "Tuż obok domu",
    description:
      "Zajęcia na krakowskim Kurdwanowie (ul. Wysłouchów). Bez dojazdów przez pół miasta — więcej czasu na naukę i odpoczynek.",
    icon: "MapPin" as const,
  },
] as const;

export const TEACHER = {
  name: "Poznaj nauczyciela",
  title: "Doświadczenie, które buduje pewność siebie",
  description:
    "Prowadzę zajęcia z matematyki od lat, łącząc rzetelną wiedzę z indywidualnym podejściem. Wierzę, że matura to nie loteria — to proces, który można zaplanować i przejść spokojnie. Moi uczniowie doceniają klarowne tłumaczenie trudnych zagadnień i autorskie materiały dopasowane do ich tempa.",
  experience: [
    "Przygotowanie do matury podstawowej i rozszerzonej",
    "Praca z uczniami na różnych poziomach startowych",
    "Autorskie zestawy zadań i arkusze treningowe",
  ],
} as const;

export const PRICING = [
  {
    id: "matura-rozszerzona",
    name: PACKAGES.MATURA_ROZSZERZONA.name,
    price: formatPln(PACKAGES.MATURA_ROZSZERZONA.priceMonthly),
    period: "/ miesiąc",
    duration: `${PACKAGES.MATURA_ROZSZERZONA.durationMinutes} min / zajęcia`,
    highlighted: true,
    features: [
      "Grupy 3–4 osobowe",
      "120 minut intensywnej pracy",
      "Autorskie materiały w cenie",
      "Wsparcie na Messengerze",
    ],
  },
  {
    id: "matura-podstawowa",
    name: PACKAGES.MATURA_PODSTAWOWA.name,
    price: formatPln(PACKAGES.MATURA_PODSTAWOWA.priceMonthly),
    period: "/ miesiąc",
    duration: `${PACKAGES.MATURA_PODSTAWOWA.durationMinutes} min / zajęcia`,
    highlighted: false,
    features: [
      "Grupy 3–4 osobowe",
      "90 minut skupionej nauki",
      "Autorskie materiały w cenie",
      "Wsparcie na Messengerze",
    ],
  },
  {
    id: "osmoklasista",
    name: PACKAGES.OSMOKLASISTA.name,
    price: formatPln(PACKAGES.OSMOKLASISTA.priceMonthly),
    period: "/ miesiąc",
    duration: `${PACKAGES.OSMOKLASISTA.durationMinutes} min / zajęcia`,
    highlighted: false,
    features: [
      "Grupy 3–4 osobowe",
      "90 minut zajęć",
      "Przygotowanie do egzaminu ósmoklasisty",
      "Materiały i wsparcie w cenie",
    ],
  },
  {
    id: "indywidualne",
    name: PACKAGES.INDYWIDUALNE.name,
    price: formatPln(PACKAGES.INDYWIDUALNE.priceHourly),
    period: "/ godzina",
    duration: `${PACKAGES.INDYWIDUALNE.durationMinutes} min / lekcja`,
    highlighted: false,
    features: [
      "Formuła 1:1",
      "60 minut indywidualnej pracy",
      "Elastyczny harmonogram",
      "Idealne do nadrobienia braków",
    ],
  },
] as const;

export const REVIEWS = [
  {
    quote:
      "Syn przestał bać się matematyki. Kameralna grupa i spokojne tłumaczenie zrobiły różnicę — w końcu rozumie, a nie wkuwa na pamięć.",
    author: "Anna K.",
    role: "Rodzic maturzysty",
  },
  {
    quote:
      "Materiały są świetne — konkretne, bez lania wody. Na maturze rozszerzonej zdałem na 82%, choć na początku roku miałem ledwo 4.",
    author: "Michał W.",
    role: "Maturzysta 2025",
  },
  {
    quote:
      "Córka chodzi z przyjemnością. Lokalizacja na Kurdwanowie to ogromny plus — nie tracimy godzin na dojazdy.",
    author: "Piotr M.",
    role: "Rodzic ósmoklasistki",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "Ile osób jest w grupie?",
    answer:
      "Grupy liczą maksymalnie 3–4 osoby. Dzięki temu każdy uczeń ma czas na pytania, a nauczyciel zna indywidualne potrzeby grupy.",
  },
  {
    question: "Co jeśli uczeń opuści zajęcia?",
    answer:
      "Opłata to abonament za miejsce — brak zwrotów za nieobecności. Po każdej lekcji nieobecny uczeń otrzymuje cyfrową paczkę materiałów. Można też dokupić lekcję indywidualną 1:1.",
  },
  {
    question: "Jak wygląda proces zapisu?",
    answer:
      `Wypełniasz formularz kontaktowy, wybierasz termin grupy i wpłacasz zaliczkę 50 zł. Po potwierdzeniu wpłaty miejsce jest zarezerwowane. Możesz też zadzwonić pod numer ${CONTACT_PHONE} i umówić się na rozmowę przed decyzją.`,
  },
  {
    question: "Gdzie odbywają się zajęcia?",
    answer:
      "Na krakowskim Kurdwanowie, ul. Wysłouchów. Dokładny adres przekażemy po rezerwacji miejsca.",
  },
  {
    question: "Czy mogę zapisać się na zajęcia indywidualne?",
    answer:
      "Tak. Lekcje 1:1 kosztują 120 zł za godzinę i są idealne do nadrobienia konkretnych zagadnień lub przygotowania do sprawdzianu.",
  },
] as const;

export const CONTACT = {
  title: "Zapisz się na zajęcia",
  description:
    "Wypełnij formularz, wybierz termin i zabezpiecz miejsce w grupie. Pola oznaczone * są wymagane.",
} as const;

export const TERMS = {
  acceptancePrefix: "Przeczytałem/am i akceptuję",
  linkLabel: "regulamin",
  href: "/regulamin",
  validationError: "Zaakceptuj regulamin, aby kontynuować",
  pageTitle: "Regulamin",
  placeholder:
    "Treść regulaminu zostanie opublikowana wkrótce. W razie pytań skontaktuj się z nami przed zapisem na zajęcia.",
} as const;

export const GROUP_SELECTION = {
  title: "Wybierz termin zajęć",
  description: "Wybierz dogodny termin dla wybranej grupy",
  reserveButton: "Zarezerwuj miejsce",
  reserving: "Rezerwowanie miejsca...",
  loading: "Ładowanie dostępnych terminów...",
  noGroupsTitle: "Brak wolnych terminów",
  noGroupsDescription:
    "Niestety nie mamy teraz wolnych miejsc dla tego pakietu. Twoje zgłoszenie zostało zapisane — skontaktuj się z nami, a pomożemy znaleźć rozwiązanie.",
  contactPrompt: "Skontaktuj się z nami:",
  errorReserve: "Nie udało się zarezerwować miejsca. Spróbuj ponownie.",
  selectGroup: "Wybierz termin, aby kontynuować.",
} as const;

export const DEPOSIT_PAYMENT = {
  depositNote:
    "Kwota zaliczki jest w pełni odliczana od pierwszej płatności za zajęcia.",
  phoneGateTitle: "Masz wątpliwości? Zadzwoń do nas przed wpłatą!",
  reservationTitle: "Dziękujemy za rezerwację!",
  reservationHint:
    "Cieszymy się na wspólne zajęcia! Aby ostatecznie potwierdzić chęć udziału, prosimy o wpłatę zaliczki. Zarezerwowaliśmy to miejsce specjalnie dla Ciebie na najbliższe 30 minut.",
  payButtonLabel: "Przejdź do płatności",
  summarySchedule: "Termin zajęć",
  successTitle: "Płatność zakończona",
  successProcessingTitle: "Przetwarzamy wpłatę",
  successMessage:
    "Zaliczka została opłacona. Wkrótce skontaktujemy się w sprawie dalszych kroków zapisu.",
  successProcessingMessage:
    "Otrzymaliśmy informację o płatności. Za chwilę potwierdzimy wpłatę w systemie.",
  paidMessage:
    "Zaliczka została opłacona. Wkrótce skontaktujemy się w sprawie dalszych kroków zapisu.",
  expiredTitle: "Link wygasł",
  expiredMessage:
    "Ten link płatności nie jest już aktywny. Skontaktuj się z nami, aby otrzymać nowy.",
  invalidTitle: "Płatność nieważna",
  invalidMessage:
    "Ta płatność została anulowana lub wygasła. Skontaktuj się z nami po pomoc.",
  cancelTitle: "Płatność przerwana",
  cancelMessage:
    "Nie dokończono płatności. Możesz spróbować ponownie z linku od nas lub skontaktować się telefonicznie.",
  summaryReserver: "Rezerwujący",
  summaryGroup: "Grupa",
  summaryType: "Wpłata zaliczki",
  backHome: "Wróć na stronę główną",
} as const;

export const ALTERNATE_TERM_CONTACT = {
  title: "Szukasz innego terminu? Zadzwoń do nas!",
  phone: CONTACT_PHONE,
} as const;

/** Domyślna pojemność grupy (zgodna ze schematem Prisma). Używane w UI bez zmiany API. */
export const GROUP_MAX_CAPACITY = 4;

export function formatRemainingSpots(
  displayedAvailable: number,
  maxCapacity: number,
): string {
  if (displayedAvailable === 1) {
    return `Zostało ${displayedAvailable} z ${maxCapacity} miejsc`;
  }

  return `Zostały ${displayedAvailable} z ${maxCapacity} miejsc`;
}

export function getDisplayedAvailableSpots(actualAvailable: number): number {
  return actualAvailable >= 3 ? 2 : actualAvailable;
}

export const FOOTER = {
  brand: "Matma do potęgi",
  location: "Kraków, Kurdwanów · ul. Wysłouchów",
  email: "kontakt@matmadopotegi.pl",
  phone: CONTACT_PHONE,
  copyright: `© ${new Date().getFullYear()} Matma do potęgi. Wszelkie prawa zastrzeżone.`,
} as const;

export const EMAILS = {
  paymentLink: {
    subject: "Link do wpłaty zaliczki — Matma do potęgi",
    preview: "Opłać zaliczkę 50 zł, aby zarezerwować miejsce w grupie.",
    title: "Zaliczka",
    greeting: (parentName: string) => `Dzień dobry, ${parentName}!`,
    intro:
      "Przygotowaliśmy dla Ciebie link do opłacenia zaliczki. Po wpłacie miejsce w grupie zostanie oficjalnie zarezerwowane.",
    groupLabel: "Grupa",
    scheduleLabel: "Termin zajęć",
    amountLabel: "Kwota zaliczki",
    expiryLabel: "Czas na opłacenie",
    expiryValue: "24 godziny od wysłania tego maila",
    cta: "Opłać zaliczkę",
    linkFallback: "Jeśli przycisk nie działa, skopiuj i wklej ten link w przeglądarce:",
  },
  depositConfirmation: {
    subject: "Potwierdzenie wpłaty zaliczki — Matma do potęgi",
    preview: "Dziękujemy za wpłatę zaliczki.",
    greeting: (parentName: string) => `Dzień dobry, ${parentName}!`,
    thanks:
      "Dziękujemy za opłacenie zaliczki. Twoja wpłata została zaksięgowana.",
    confirmedWithGroup:
      "Potwierdzamy rezerwację miejsca w wybranej grupie. Cieszymy się, że dołączasz do nas!",
    confirmedWithoutGroup:
      "Skontaktujemy się wkrótce w sprawie przydziału do konkretnej grupy i dalszych kroków zapisu.",
    groupLabel: "Grupa",
    scheduleLabel: "Termin zajęć",
    amountLabel: "Wpłacona kwota",
    closing: "Do zobaczenia na zajęciach!",
  },
} as const;

export const PACKAGE_OPTIONS = [
  { value: "", label: "Wybierz grupę" },
  { value: "MATURA_ROZSZERZONA", label: PACKAGES.MATURA_ROZSZERZONA.name },
  { value: "MATURA_PODSTAWOWA", label: PACKAGES.MATURA_PODSTAWOWA.name },
  { value: "OSMOKLASISTA", label: PACKAGES.OSMOKLASISTA.name },
  { value: "INDYWIDUALNE", label: PACKAGES.INDYWIDUALNE.name },
] as const;
