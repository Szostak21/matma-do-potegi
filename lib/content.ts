import { PACKAGES } from "@/lib/constants";
import { formatPln } from "@/lib/money";

export const NAV_LINKS = [
  { href: "#o-nas", label: "O nas" },
  { href: "#nauczyciel", label: "Nauczyciel" },
  { href: "#oferta", label: "Oferta" },
  { href: "#opinie", label: "Opinie" },
  { href: "#faq", label: "FAQ" },
  { href: "#zapis", label: "Zapis" },
] as const;

export const HERO = {
  badge: "Zapisy otwarte",
  title: "Matura z matematyki bez stresu. Wynik, który otwiera drzwi na wymarzone studia.",
  subtitle:
    "Kameralne grupy premium (3–4 os.) na krakowskim Kurdwanowie. Autorskie materiały i pełne wsparcie tuż obok Twojego domu.",
  primaryCta: { label: "Zapisz się", href: "#zapis" },
  secondaryCta: { label: "Zobacz ofertę", href: "#oferta" },
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
      "Wypełniasz formularz kontaktowy, wybierasz termin grupy i wpłacasz kaucję 50 zł. Po potwierdzeniu wpłaty miejsce jest zarezerwowane. Możesz też zadzwonić i umówić się na rozmowę przed decyzją.",
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
    "Wypełnij formularz, wybierz termin i opłać kaucję, aby zarezerwować miejsce. Pola oznaczone * są wymagane.",
} as const;

export const GROUP_SELECTION = {
  title: "Wybierz termin zajęć",
  description:
    "Wybierz dogodny termin grupy dla wybranego pakietu. Po rezerwacji masz 15 minut na opłacenie kaucji 50 zł.",
  reserveButton: "Rezerwuj miejsce",
  reserving: "Rezerwowanie...",
  loading: "Ładowanie dostępnych terminów...",
  noGroupsTitle: "Brak wolnych terminów",
  noGroupsDescription:
    "Niestety nie mamy teraz wolnych miejsc dla tego pakietu. Twoje zgłoszenie zostało zapisane — skontaktuj się z nami, a pomożemy znaleźć rozwiązanie.",
  contactPrompt: "Skontaktuj się z nami:",
  spotsLabel: "wolnych miejsc",
  errorReserve: "Nie udało się zarezerwować miejsca. Spróbuj ponownie.",
  selectGroup: "Wybierz termin, aby kontynuować.",
} as const;

export const FOOTER = {
  brand: "Matma do potęgi",
  location: "Kraków, Kurdwanów · ul. Wysłouchów",
  email: "kontakt@matmadopotegi.pl",
  phone: "+48 000 000 000",
  copyright: `© ${new Date().getFullYear()} Matma do potęgi. Wszelkie prawa zastrzeżone.`,
} as const;

export const PACKAGE_OPTIONS = [
  { value: "", label: "Wybierz pakiet" },
  { value: "MATURA_ROZSZERZONA", label: PACKAGES.MATURA_ROZSZERZONA.name },
  { value: "MATURA_PODSTAWOWA", label: PACKAGES.MATURA_PODSTAWOWA.name },
  { value: "OSMOKLASISTA", label: PACKAGES.OSMOKLASISTA.name },
  { value: "INDYWIDUALNE", label: PACKAGES.INDYWIDUALNE.name },
] as const;
