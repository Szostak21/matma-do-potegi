import type { PackageType } from "@prisma/client";

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
    "Profesjonalne zajęcia matematyki w kameralnych grupach. Nowoczesna sala w centrum Krakowa, sprawdzone metody i spokojna atmosfera, której zaufali uczniowie oraz ich rodzice.",
  primaryCta: { label: "Zapisz się", href: "/#zapisy" },
  secondaryCta: { label: "Zobacz ofertę", href: "/#oferta" },
} as const;

export const ABOUT = {
  title: "Inwestycja w pewne rezultaty",
  description:
    "Systematyczna praca w komfortowej przestrzeni w centrum miasta. Stawiamy na doskonały kontakt z młodzieżą, indywidualną analizę potrzeb każdego ucznia oraz angażujący sposób tłumaczenia."
} as const;

export const FEATURES = [
  {
    title: "Kameralne grupy",
    description:
      "Każdy uczeń ma przestrzeń na pytania. Dzięki małym grupom, zapewniamy indywidualnie podejście do każdego ucznia.",
    icon: "Users" as const,
  },
  {
    title: "Wyselekcjonowane zadania",
    description:
      "Pracujemy na starannie wyselekcjonowanych zadaniach i arkuszach, ucząc schematów gwarantujących wyniki.",
    icon: "BookOpen" as const,
  },
  {
    title: "Wsparcie między zajęciami",
    description:
      "Grupa na Messengerze lub WhatsApp dla każdej grupy. Odpowiadamy, na pytania uczniów kiedy potrzebują.",
    icon: "MessageCircle" as const,
  },
  {
    title: "Świetna lokalizacja",
    description:
      "Nowoczesna sala w centrum Krakowa. Świetny dojazd bezpośrednio z większości krakowskich szkół średnich.",
    icon: "MapPin" as const,
  },
] as const;

export const TEACHER = {
  name: "Poznaj nauczyciela",
  title: "Paweł Szostak",
  description:
    "Wierzę, że matura to nie loteria - to proces, który można zaplanować i przejść spokojnie. Doskonale wiem, jak to zrobić, ponieważ sam napisałem maturę z matematyki (podstawową i rozszerzoną) na równe 100%. Od lat z sukcesami tłumaczę ten przedmiot innym, zaczynając od przygotowywania znajomych i rodziny. Na moich zajęciach stawiam na cierpliwość. Zamiast podawać gotowe wzory i rozwiązania na tacy, wolę zadawać odpowiednie pytania i delikatnie naprowadzać. Dzięki temu uczniowie samodzielnie dochodzą do prawidłowych odpowiedzi, co najlepiej utrwala wiadomości i buduje pewność siebie przed egzaminem.",
  experience: [
    "Wynik 100% z matury podstawowej i rozszerzonej",
    "Wieloletnie doświadczenie i sprawdzone metody tłumaczenia",
    "Praca wyłącznie na wyselekcjonowanych zadaniach i arkuszach CKE",
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
      "Kameralne, małe grupy",
      "120 minut zajęć",
      "Wyselekcjonowane zadania i próbne arkusze",
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
      "Kameralne, małe grupy",
      "90 minut zajęć",
      "Wyselekcjonowane zadania i próbne arkusze",
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
      "Kameralne, małe grupy",
      "90 minut zajęć",
      "Przygotowanie do egzaminu ósmoklasisty",
      "Zestawy zadań i próbne arkusze w cenie",
    ],
  },
  {
    id: "indywidualne",
    name: PACKAGES.INDYWIDUALNE.name,
    price: `od ${formatPln(PACKAGES.INDYWIDUALNE.priceHourly)}`,
    period: "/ godzina",
    duration: `${PACKAGES.INDYWIDUALNE.durationMinutes} min / lekcja`,
    highlighted: false,
    features: [
      "120 zł/h u ucznia, 180 zł/h w sali",
      "60 minut zajęć",
      "Elastyczny harmonogram",
      "Idealne do nadrobienia braków",
    ],
  },
] as const;

export const REVIEWS = [
  {
    quote:
      "Syn przestał bać się matematyki. Mała grupa i spokojne tłumaczenie zrobiły różnicę - w końcu rozumie, a nie wkuwa na pamięć.",
    author: "Anna K.",
    role: "Rodzic maturzysty",
  },
  {
    quote:
      "Najbardziej doceniam to, że Paweł nie rozwiązywał zadań za mnie, tylko naprowadzał, żebym sam wpadł na pomysł. Wynik 86% z rozszerzenia mówi sam za siebie.",
    author: "Michał W.",
    role: "Maturzysta 2025",
  },
  {
    quote:
      "Przyszłam na zajęcia z ogromnymi brakami. Zajęcia bardzo pomogły mi poukładać wiedzę, a na właściwym egzaminie nic mnie nie zaskoczyło. Zdałam bez problemu na 72%!",
    author: "Kasia M.",
    role: "Maturzystka 2025",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "Kiedy odbywają się zajęcia?",
    answer:
      "Dokładne dni oraz godziny zajęć są ustalane we wrześniu tak aby pasowały do planów lekcji oraz grafików wszystkich osób w grupie.",
  },
  {
    question: "Jak wyglądają zajęcia wrześniowe?",
    answer:
      "Zajęcia we wrześniu są w 100% darmowe (pierwszy abonament płacą Państwo dopiero w październiku). Wrzesień przeznaczamy na test poziomujący oraz lekcje wstępne, aby precyzyjnie dobrać grupę i grafik do każdego ucznia.",
  },
  {
    question: "Ile osób jest w grupie?",
    answer:
      "Grupy liczą od 4 do 8 osób - pozwala nam to zapewnić indywidualne podejście do każdego ucznia, prowadzić angażujące dyskusje oraz uniknąć wywierania nadmiernej presji na uczniach.",
  },
  {
    question: "Co jeśli uczeń opuści zajęcia?",
    answer:
      "Żadna lekcja nie przepadnie! W przypadku nieobecności uczeń otrzymuje podsumowanie danych zajęć, listę zadań do zrobienia oraz pomoc nauczyciela na dedykowanej grupie w razie problemów z materiałem.",
  },
  {
    question: "Gdzie odbywają się zajęcia?",
    answer:
      "Na ulicy Chocimskiej 9, w nowoczesnym lokalu w centrum Krakowa. Dokładne szczegóły przekażemy po potwierdzeniu rezerwacji miejsca.",
  },
] as const;

export const CONTACT = {
  title: "Zapisz się na zajęcia",
  description:
    "Pierwszy krok do lepszych wyników z matematyki zaczyna się tutaj.",
} as const;

export const PACKAGE_POOL_FULL_MESSAGE =
  "Brak wolnych miejsc na wybranym poziomie. Napisz do nas - zobaczymy co da się zrobić!";

export const PACKAGE_AVAILABILITY = {
  loading: "Sprawdzanie dostępności miejsc...",
  spotsRemaining: (count: number) =>
    count === 1
      ? "Zostało 1 wolne miejsce na wybranym poziomie"
      : `Zostały ${count} wolne miejsca na wybranym poziomie`,
  noSpots:
    "Brak wolnych miejsc na wybranym poziomie. Napisz do nas - zobaczymy co da się zrobić!",
  octoberNote:
    "Start zajęć na początku października. Dokładny dzień i godzinę ustalimy wspólnie po zebraniu grupy oraz krótkim, darmowym teście poziomującym.",
} as const;

export const TERMS = {
  acceptancePrefix: "Przeczytałem/am i akceptuję",
  linkLabel: "regulamin",
  href: "/regulamin",
  privacyLinkLabel: "politykę prywatności",
  privacyHref: "/polityka-prywatnosci",
  validationError:
    "Zaakceptuj regulamin i politykę prywatności, aby kontynuować",
  pageTitle: "Regulamin",
} as const;

export const DEPOSIT_PAYMENT = {
  depositNote:
    "Kwota zaliczki jest w pełni odliczana od pierwszej płatności za zajęcia.",
  phoneGateTitle: "Masz wątpliwości? Zadzwoń do nas przed wpłatą!",
  reservationTitle: "Dziękujemy za rezerwację!",
  reservationHint:
    "Cieszymy się na wspólne zajęcia! Aby ostatecznie potwierdzić chęć udziału, prosimy o wpłatę zaliczki. Zarezerwowaliśmy to miejsce specjalnie dla Ciebie na najbliższe 30 minut.",
  payButtonLabel: "Przejdź do płatności",
  summaryPackage: "Poziom zajęć",
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
  summaryType: "Wpłata zaliczki",
  backHome: "Wróć na stronę główną",
} as const;

export const ALTERNATE_TERM_CONTACT = {
  title: "Szukasz innego terminu? Zadzwoń do nas!",
  phone: CONTACT_PHONE,
} as const;

/** Domyślna pojemność grupy (zgodna ze schematem Prisma). Używane w UI bez zmiany API. */
export const GROUP_MAX_CAPACITY = 8;

export function formatRemainingSpots(
  displayedAvailable: number,
  maxCapacity: number,
): string {
  if (displayedAvailable === 1) {
    return `Zostało ${displayedAvailable} z ${maxCapacity} miejsc`;
  }

  return `Zostały ${displayedAvailable} z ${maxCapacity} miejsc`;
}

export function getDisplayedAvailableSpots(
  actualAvailable: number,
  packageType: PackageType,
): number | null {
  if (packageType === "INDYWIDUALNE") {
    return null;
  }

  return actualAvailable >= 4 ? 4 : actualAvailable;
}

export const FOOTER = {
  brand: "Matma do potęgi",
  location: "Kraków · ul. Chocimska 9",
  email: "kontakt@matmadopotegi.pl",
  phone: CONTACT_PHONE,
  copyright: `© ${new Date().getFullYear()} Matma do potęgi. Wszelkie prawa zastrzeżone.`,
  legalLinks: [
    { href: "/regulamin", label: "Regulamin" },
    { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
  ],
} as const;

export const EMAILS = {
  paymentLink: {
    subject: "Link do wpłaty zaliczki - Matma do potęgi",
    preview: "Opłać zaliczkę 50 zł, aby zarezerwować miejsce.",
    title: "Zaliczka",
    greeting: (parentName: string) => `Dzień dobry, ${parentName}!`,
    intro:
      "Przygotowaliśmy dla Ciebie link do opłacenia zaliczki. Po wpłacie miejsce na wybranym poziomie zostanie oficjalnie zarezerwowane.",
    packageLabel: "Poziom zajęć",
    amountLabel: "Kwota zaliczki",
    expiryLabel: "Czas na opłacenie",
    expiryValue: "24 godziny od wysłania tego maila",
    cta: "Opłać zaliczkę",
    renewalSubject: "Nowy link do wpłaty zaliczki - Matma do potęgi",
    renewalPreview: "Poprzedni link wygasł - oto nowy, ważny 24 godziny.",
    renewalIntro:
      "Poprzedni link do płatności wygasł. Przesyłamy nowy link do opłacenia zaliczki - jest ważny przez 24 godziny od wysłania tej wiadomości.",
    linkFallback: "Jeśli przycisk nie działa, skopiuj i wklej ten link w przeglądarce:",
  },
  depositConfirmation: {
    subject: "Zaliczka potwierdzona — Matma do potęgi",
    preview: "Dziękujemy za wpłatę zaliczki.",
    greeting: (parentName: string) => `Dzień dobry, ${parentName}!`,
    thanks:
      "Dziękujemy za opłacenie zaliczki. Twoja wpłata została zaksięgowana.",
    confirmed:
      "Potwierdzamy rezerwację miejsca na wybranym poziomie.",
    confirmedNextSteps:
      "We wrześniu wyślemy na podany numer telefonu dostępne terminy na test poziomujący oraz zajęcia organizacyjne.",
    confirmedClosing: "Cieszymy się, że dołączacie do nas!",
    packageLabel: "Poziom zajęć",
    amountLabel: "Wpłacona kwota",
    referralHeading: "Zaproś znajomego i płać mniej!",
    referralBodyLine1:
      "Zafunduj Sobie i znajomemu 50zł zniżki na pierwszy miesiąc!",
    referralBodyLine2:
      "Przekaż znajomemu link poniżej - po rezerwacji oboje otrzymacie zniżkę!",
    referralLinkLabel: "Twój link polecający",
    referralCta: "Wyślij link znajomemu",
    referralMailtoSubject: "Polecam korepetycje z matematyki — Matma do potęgi",
    referralMailtoBody: (referralUrl: string) =>
      `Cześć! Rezerwuję miejsce w Matmie do potęgi i mam dla Ciebie 50 zł zniżki na pierwszy miesiąc. Zapisz się tutaj:\n\n${referralUrl}`,
  },
  adminNewLead: {
    subject: (parentName: string) => `Nowe zgłoszenie - ${parentName}`,
    preview: "Nowe zgłoszenie z formularza na stronie.",
    heading: "Nowe zgłoszenie",
    intro: "Ktoś właśnie wypełnił formularz zgłoszeniowy na stronie.",
    parentLabel: "Rodzic",
    phoneLabel: "Telefon",
    emailLabel: "E-mail",
    packageLabel: "Poziom zajęć",
  },
  adminDeposit: {
    subject: (parentName: string) => `Opłacona zaliczka - ${parentName}`,
    preview: "Klient opłacił zaliczkę.",
    heading: "Opłacona zaliczka",
    intro: "Lead właśnie opłacił zaliczkę.",
    parentLabel: "Rodzic",
    packageLabel: "Poziom zajęć",
    amountLabel: "Kwota",
    leadIdLabel: "ID leada",
  },
} as const;

export const PACKAGE_OPTIONS = [
  { value: "", label: "Wybierz typ zajęć" },
  { value: "MATURA_ROZSZERZONA", label: PACKAGES.MATURA_ROZSZERZONA.name },
  { value: "MATURA_PODSTAWOWA", label: PACKAGES.MATURA_PODSTAWOWA.name },
  { value: "OSMOKLASISTA", label: PACKAGES.OSMOKLASISTA.name },
  { value: "INDYWIDUALNE", label: PACKAGES.INDYWIDUALNE.name },
] as const;
