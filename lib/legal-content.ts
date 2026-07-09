import type { LegalDocumentContent } from "@/lib/legal/types";

import { CONTACT_PHONE } from "@/lib/content";

const LESSON_ADDRESS =
  "ul. Marii i Bolesława Wysłouchów 13/11, 30-611 Kraków";

const LEGAL_UPDATED_AT = "6 lipca 2026";

export const LEGAL = {
  terms: {
    title: "Regulamin świadczenia usług edukacyjnych Matma do potęgi",
    intro:
      "Niniejszy regulamin określa zasady korzystania ze stacjonarnych usług edukacyjnych (korepetycji grupowych) organizowanych przez Matma do potęgi.",
    updatedAt: LEGAL_UPDATED_AT,
    sections: [
      {
        title: "1. Postanowienia ogólne",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              {
                text: "Usługodawcą i Prowadzącym zajęcia jest Paweł Szostak, prowadzący działalność nierejestrowaną, adres e-mail: kontakt@matmadopotegi.pl.",
              },
              {
                text: `Zajęcia stacjonarne odbywają się w lokalu mieszkalnym przystosowanym do celów edukacyjnych, pod adresem: ${LESSON_ADDRESS}.`,
              },
              {
                text: "Zgłoszenie udziału w zajęciach oraz opłacenie zaliczki oznacza pełną akceptację niniejszego Regulaminu.",
              },
            ],
          },
        ],
      },
      {
        title: "2. Rezerwacja miejsca, płatności i prawo odstąpienia",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              {
                text: "Rezerwacja miejsca w wybranej grupie odbywa się poprzez formularz na stronie internetowej serwisu.",
              },
              {
                text: "Warunkiem skutecznej rezerwacji jest opłacenie bezzwrotnej zaliczki (opłaty rezerwacyjnej) za pośrednictwem systemu płatności Stripe.",
              },
              {
                text: "Link do płatności wygenerowany po wypełnieniu formularza jest ważny przez 30 minut. Po tym czasie rezerwacja wygasa, a miejsce zostaje zwolnione. W szczególnych przypadkach Prowadzący może wygenerować nowy link z 24-godzinnym terminem ważności, o ile w grupie nadal są wolne miejsca.",
              },
              {
                text: "Zaliczka jest odliczana od opłaty za pierwszy miesiąc zajęć.",
              },
              {
                text: "Z uwagi na to, że dokładny harmonogram zajęć ustalany jest po rozpoczęciu roku akademickiego, Prowadzący w porozumieniu z Uczniami przedstawia propozycje terminów dla poszczególnych grup w pierwszych tygodniach października. Jeżeli żaden z zaproponowanych terminów nie będzie odpowiadał Uczniowi, wpłacona zaliczka podlega zwrotowi w pełnej wysokości (100%) w terminie 7 dni roboczych, a rezerwacja zostaje anulowana.",
              },
              {
                text: "Zgodnie z art. 38 ust. 1 pkt 1 ustawy o prawach konsumenta, Użytkownik płacąc zaliczkę wyraża wyraźną zgodę na rozpoczęcie świadczenia usługi przed upływem 14-dniowego terminu na odstąpienie od umowy zawartej na odległość i przyjmuje do wiadomości, że w ten sposób traci prawo do odstąpienia od umowy.",
              },
              {
                text: "Czesne za kolejne miesiące nauki ma charakter stałej, miesięcznej opłaty zryczałtowanej (niezależnej od liczby zajęć przypadających w danym miesiącu kalendarzowym). Opłata musi być uiszczana z góry, do 5. dnia każdego miesiąca.",
              },
            ],
          },
        ],
      },
      {
        title: "3. Organizacja zajęć, komunikacja i nieobecności",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              {
                text: "Zajęcia odbywają się według stałego harmonogramu ustalonego na początku semestru.",
              },
              {
                text: "Ze względów logistycznych (brak wydzielonej poczekalni w lokalu), Uczniowie proszeni są o przybywanie na zajęcia **nie wcześniej niż 15 minut** przed ich planowanym rozpoczęciem.",
              },
              {
                text: "Zajęcia rozpoczynają się punktualnie. Prowadzący nie wstrzymuje rozpoczęcia lekcji ze względu na spóźniających się uczestników. Spóźniony uczeń dołącza do grupy w trakcie trwania zajęć, jednak Prowadzący nie wraca do już omówionego materiału. Spóźnienie ucznia nie powoduje przedłużenia zajęć, a czesne za ten czas nie podlega zwrotowi.",
              },
              {
                text: "Nieobecność Ucznia na zajęciach grupowych nie zwalnia z obowiązku opłacenia pełnego miesięcznego czesnego i nie uprawnia do zwrotów kosztów.",
              },
              {
                text: "W przypadku nieobecności Uczeń nie otrzymuje nagrań wideo. Prowadzący przekazuje Uczniowi (poprzez aplikację Messenger lub WhatsApp) informację o zrealizowanym materiale oraz zadaniach domowych do samodzielnego przerobienia.",
              },
              {
                text: "Prowadzący zapewnia wsparcie edukacyjne poza zajęciami za pośrednictwem aplikacji Messenger lub WhatsApp. Komunikacja ta ma na celu bieżącą pomoc, jednak nie ma charakteru wsparcia całodobowego. Prowadzący zastrzega sobie prawo do odpowiedzi w czasie do 24 godzin. Uczniowie proszeni są o szanowanie czasu prywatnego Prowadzącego.",
              },
              {
                text: "Z uwagi na komfort całej grupy, na zajęcia stacjonarne mogą przychodzić wyłącznie osoby zdrowe. W przypadku widocznych objawów infekcji (silny kaszel, katar, gorączka), Prowadzący zastrzega sobie prawo do odmowy uczniowi udziału w zajęciach w danym dniu.",
              },
              {
                text: "W trakcie zajęć dozwolone jest spożywanie napojów w zakręcanych butelkach lub bidonach. Spożywanie posiłków w sali zajęciowej jest dopuszczalne wyłącznie za uprzednią zgodą Prowadzącego.",
              },
              {
                text: "Uczniowie oraz ich opiekunowie ponoszą pełną odpowiedzialność finansową za ewentualne umyślne szkody materialne i zniszczenia sprzętu wyrządzone w lokalu, w którym odbywają się zajęcia.",
              },
            ],
          },
        ],
      },
      {
        title: "4. Ferie, dni wolne i elastyczność harmonogramu",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              {
                text: "W dni ustawowo wolne od pracy (święta państwowe i kościelne) zajęcia domyślnie się nie odbywają. Prowadzący zastrzega sobie prawo do odwołania tych zajęć bez wpływu na wysokość czesnego lub do wyznaczenia odgórnego terminu odróbkowego dla całej grupy.",
              },
              {
                text: "Na czas trwania ferii zimowych (właściwych dla województwa małopolskiego) harmonogram oraz tryb prowadzenia zajęć ustala Prowadzący. Prowadzący zastrzega sobie prawo do:",
                subItems: [
                  "zawieszenia zajęć stacjonarnych w tym okresie,",
                  "przeniesienia zajęć w tryb zdalny (online),",
                  "zorganizowania w tym czasie dodatkowych, dobrowolnych i dodatkowo płatnych maratonów/sprintów maturalnych.",
                ],
              },
            ],
          },
        ],
      },
      {
        title: "5. Odwołanie lub spóźnienie z winy Prowadzącego i zdarzenia losowe",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              {
                text: "W przypadku odwołania zajęć z przyczyn losowych leżących po stronie Prowadzącego (np. nagła choroba) lub zdarzeń o charakterze siły wyższej niezależnych od Prowadzącego (np. nagła awaria instalacji w lokalu, przerwa w dostawie prądu), Prowadzący zobowiązuje się do zorganizowania zajęć odróbkowych w terminie dogodnym dla grupy. W przypadku braku możliwości odrobienia takich zajęć, czesne w kolejnym miesiącu zostanie proporcjonalnie obniżone.",
              },
              {
                text: "W przypadku spóźnienia się Prowadzącego na zajęcia, czas trwania danego spotkania zostaje przedłużony o czas spóźnienia lub odrobiony przy najbliższej okazji, po uzgodnieniu z Uczniami.",
              },
            ],
          },
        ],
      },
      {
        title: "6. Rezygnacja z zajęć (rozwiązanie umowy)",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              {
                text: "Uczestnik (lub jego rodzic/opiekun prawny w przypadku osób niepełnoletnich) ma prawo do rezygnacji z zajęć w trakcie roku szkolnego.",
              },
              {
                text: "Obowiązuje **miesięczny okres wypowiedzenia, ze skutkiem na koniec miesiąca kalendarzowego**. W okresie wypowiedzenia Uczeń ma prawo brać udział w zajęciach i jest zobowiązany do uregulowania opłaty za ten miesiąc.",
              },
              {
                text: "Chęć rezygnacji należy zgłosić w formie dokumentowej – wysyłając wiadomość e-mail na adres: kontakt@matmadopotegi.pl.",
              },
              {
                text: "Prowadzący zastrzega sobie prawo do skreślenia Ucznia z listy uczestników w trybie natychmiastowym w przypadku rażącego łamania zasad kultury osobistej lub zalegania z płatnościami za czesne powyżej 14 dni.",
              },
            ],
          },
        ],
      },
      {
        title: "7. Postanowienia końcowe",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              {
                text: "W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają odpowiednie przepisy Kodeksu cywilnego.",
              },
              {
                text: "Regulamin wchodzi w życie z dniem publikacji na stronie internetowej serwisu.",
              },
            ],
          },
        ],
      },
    ],
  },
  privacy: {
    title: "Polityka prywatności i plików cookies Matma do potęgi",
    intro:
      "Niniejsza Polityka Prywatności określa zasady przetwarzania danych osobowych oraz wykorzystywania plików cookies w związku z korzystaniem z serwisu internetowego oraz usług oferowanych przez Matma do potęgi.",
    updatedAt: LEGAL_UPDATED_AT,
    sections: [
      {
        title: "1. Administrator danych osobowych",
        blocks: [
          {
            kind: "paragraph",
            text: `Administratorem Twoich danych osobowych jest Paweł Szostak, prowadzący działalność nierejestrowaną w rozumieniu art. 5 ustawy Prawo przedsiębiorców, zamieszkały pod adresem: ${LESSON_ADDRESS}.`,
          },
          {
            kind: "paragraph",
            text: "Kontakt z Administratorem jest możliwy:",
          },
          {
            kind: "list",
            ordered: false,
            items: [
              { text: "pod adresem e-mail: kontakt@matmadopotegi.pl" },
              { text: `pod numerem telefonu: ${CONTACT_PHONE}` },
            ],
          },
        ],
      },
      {
        title: "2. Jakie dane zbieramy i w jakim celu?",
        blocks: [
          {
            kind: "paragraph",
            text: "Przetwarzamy dane podane dobrowolnie przez użytkowników w formularzu rezerwacyjnym. Wymogiem zawarcia umowy jest pełnoletność użytkownika (Kupującego). Zbieramy następujące dane:",
          },
          {
            kind: "list",
            ordered: false,
            items: [
              {
                text: "**Dane kontaktowe i identyfikacyjne Kupującego:** imię, nazwisko, adres e-mail, numer telefonu (w celu zawarcia i realizacji umowy, obsługi płatności oraz komunikacji).",
              },
              {
                text: "**Dane ucznia i szczegóły edukacyjne:** wybrana grupa, imię ucznia, obecna ocena z matematyki, oczekiwany wynik (w celu odpowiedniego dostosowania poziomu zajęć i optymalizacji procesu nauczania).",
              },
              {
                text: "**Dane techniczne i analityczne:** adres IP, informacje o przeglądarce i aktywności na stronie (w celach statystycznych, bezpieczeństwa oraz — za odrębną zgodą — marketingowych).",
              },
            ],
          },
        ],
      },
      {
        title: "3. Podstawy prawne przetwarzania (RODO)",
        blocks: [
          {
            kind: "paragraph",
            text: "Twoje dane przetwarzamy na następujących podstawach:",
          },
          {
            kind: "list",
            ordered: false,
            items: [
              {
                text: "**art. 6 ust. 1 lit. b RODO:** wykonanie umowy (rezerwacja miejsca, realizacja zajęć).",
              },
              {
                text: "**art. 6 ust. 1 lit. c RODO:** obowiązek prawny (ewidencja sprzedaży, cele podatkowe).",
              },
              {
                text: "**art. 6 ust. 1 lit. f RODO:** prawnie uzasadniony interes (dochodzenie roszczeń, bezpieczeństwo serwisu).",
              },
              {
                text: "**art. 6 ust. 1 lit. a RODO:** Twoja dobrowolna zgoda (w przypadku plików cookies marketingowych).",
              },
            ],
          },
        ],
      },
      {
        title: "4. Odbiorcy danych (kto ma dostęp do Twoich danych?)",
        blocks: [
          {
            kind: "paragraph",
            text: "Aby zapewnić sprawne działanie serwisu, korzystamy z zaufanych dostawców usług, którzy przetwarzają dane w naszym imieniu:",
          },
          {
            kind: "list",
            ordered: false,
            items: [
              {
                text: "**Stripe, Inc.** – obsługa płatności (zaliczka, czesne). Administrator nie ma dostępu do pełnych danych kart płatniczych.",
              },
              {
                text: "**Supabase, Inc.** – dostawca bazy danych (bezpieczne przechowywanie danych z formularzy).",
              },
              {
                text: "**Vercel, Inc.** – hosting serwisu internetowego.",
              },
              {
                text: "**Resend, Inc.** – infrastruktura pocztowa (wysyłka e-maili i linków do płatności).",
              },
              {
                text: "**Meta Platforms Ireland Limited** – analityka i działania marketingowe (np. Meta Pixel), wyłącznie po wyrażeniu zgody przez użytkownika, jeśli takie narzędzia zostaną uruchomione.",
              },
            ],
          },
        ],
      },
      {
        title: "5. Okres przechowywania danych",
        blocks: [
          {
            kind: "paragraph",
            text: "Dane związane z realizacją usług edukacyjnych przechowujemy przez okres ich świadczenia, a po zakończeniu współpracy – przez czas wymagany przepisami prawa podatkowego (standardowo 5 lat od końca roku kalendarzowego) oraz do czasu przedawnienia ewentualnych roszczeń cywilnoprawnych.",
          },
        ],
      },
      {
        title: "6. Twoje prawa",
        blocks: [
          {
            kind: "paragraph",
            text: "Masz prawo do:",
          },
          {
            kind: "list",
            ordered: false,
            items: [
              { text: "dostępu do swoich danych osobowych oraz otrzymania ich kopii," },
              { text: "sprostowania (poprawiania) danych," },
              {
                text: "usunięcia danych (prawo do bycia zapomnianym), jeśli nie ma prawnych podstaw do ich dalszego przetwarzania,",
              },
              { text: "ograniczenia przetwarzania," },
              { text: "wniesienia sprzeciwu wobec przetwarzania," },
              { text: "przenoszenia danych," },
              {
                text: "cofnięcia zgody na ciasteczka marketingowe w dowolnym momencie.",
              },
            ],
          },
          {
            kind: "paragraph",
            text: "W celu realizacji swoich praw skontaktuj się z Administratorem pod adresem: kontakt@matmadopotegi.pl. Masz również prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).",
          },
        ],
      },
      {
        title: "7. Pliki cookies (ciasteczka)",
        blocks: [
          {
            kind: "paragraph",
            text: "Nasz serwis wykorzystuje pliki cookies:",
          },
          {
            kind: "list",
            ordered: false,
            items: [
              {
                text: "**Niezbędne (techniczne):** wymagane do prawidłowego działania strony (np. mechanizmy płatności Stripe, sesje). Nie wymagają zgody.",
              },
              {
                text: "**Marketingowe i analityczne:** jeśli uruchomimy narzędzia marketingowe (np. Meta Pixel), będą włączane wyłącznie po wyrażeniu zgody na banerze informacyjnym. Zgodę można w każdej chwili wycofać, czyszcząc pliki cookies w przeglądarce.",
              },
            ],
          },
        ],
      },
      {
        title: "8. Zmiany w Polityce Prywatności",
        blocks: [
          {
            kind: "paragraph",
            text: "Zastrzegamy sobie prawo do aktualizacji niniejszej Polityki. Zmiany wchodzą w życie z dniem ich publikacji na stronie.",
          },
        ],
      },
    ],
  },
} as const satisfies {
  terms: LegalDocumentContent;
  privacy: LegalDocumentContent;
};
