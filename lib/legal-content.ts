import type { LegalDocumentContent } from "@/lib/legal/types";

import { CONTACT_PHONE } from "@/lib/content";

// Adres do korespondencji / adres przedsiębiorcy
const CORRESPONDENCE_ADDRESS =
  "ul. Marii i Bolesława Wysłouchów 13/11, 30-611 Kraków";
// Miejsce świadczenia usług (sala)
const SERVICE_ADDRESS = "ul. Chocimska 9, 30-057 Kraków";
// NIP: uzupełnić po przejściu na JDG
// const COMPANY_NIP = "____________";

const LEGAL_UPDATED_AT = "6 sierpnia 2026";

export const LEGAL = {
  terms: {
    title: "Regulamin świadczenia usług edukacyjnych Matma do potęgi",
    intro:
      "Niniejszy regulamin określa zasady świadczenia usług edukacyjnych (korepetycji grupowych oraz indywidualnych) organizowanych pod marką Matma do potęgi. Przedmiotem umowy jest udział w usłudze edukacyjnej o uzgodnionym zakresie i poziomie, a nie gwarancja prowadzenia zajęć przez konkretną osobę fizyczną.",
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
                text: "**Usługodawcą** jest Paweł Szostak, prowadzący działalność nierejestrowaną, adres e-mail: kontakt@matmadopotegi.pl (dalej: „Usługodawca”).",
              },
              {
                text: "**Prowadzącym** zajęcia (dalej: „Prowadzący”) może być Usługodawca albo inna wykwalifikowana osoba wyznaczona przez Usługodawcę do realizacji usługi edukacyjnej (w szczególności nauczyciel współpracujący lub zatrudniony).",
              },
              {
                text: "Klient (Kupujący) nabywa udział w usłudze edukacyjnej Matma do potęgi (zajęcia na wskazanym poziomie / w uzgodnionym zakresie), a nie prawo do zajęć wyłącznie z konkretną osobą. Wskazanie osoby prowadzącej ma charakter organizacyjny i nie stanowi elementu istotnego świadczenia w rozumieniu gwarancji personalnej.",
              },
              {
                text: "Usługodawca ma prawo w trakcie semestru zmienić Prowadzącego zajęć (w szczególności z przyczyn zdrowotnych, organizacyjnych, kadrowych lub jakościowych) bez konieczności aneksowania umowy i bez wpływu na wysokość czesnego ani innych opłat. O istotnej zmianie Prowadzącego Usługodawca poinformuje Kupującego w rozsądnym terminie, w szczególności pocztą elektroniczną lub za pośrednictwem dotychczasowego kanału komunikacji grupy.",
              },
              {
                text: `Zajęcia stacjonarne odbywają się w profesjonalnej sali szkoleniowej (przestrzeń coworkingowa), pod adresem: ${SERVICE_ADDRESS}. Adres do korespondencji: ${CORRESPONDENCE_ADDRESS}.`,
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
                text: "Link do płatności wygenerowany po wypełnieniu formularza jest ważny przez 30 minut. Po tym czasie rezerwacja wygasa, a miejsce zostaje zwolnione. W szczególnych przypadkach Usługodawca może wygenerować nowy link z 24-godzinnym terminem ważności, o ile w grupie nadal są wolne miejsca.",
              },
              {
                text: "Zaliczka jest odliczana od opłaty za pierwszy miesiąc zajęć.",
              },
              {
                text: "Z uwagi na to, że dokładny harmonogram zajęć ustalany jest po rozpoczęciu roku akademickiego, Usługodawca w porozumieniu z Uczniami przedstawia propozycje terminów dla poszczególnych grup w pierwszych tygodniach października. Jeżeli żaden z zaproponowanych terminów nie będzie odpowiadał Uczniowi, wpłacona zaliczka podlega zwrotowi w pełnej wysokości (100%) w terminie 7 dni roboczych, a rezerwacja zostaje anulowana.",
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
        title: "3. Program poleceń",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              {
                text: "Usługodawca prowadzi program poleceń polegający na przyznaniu zniżki w wysokości 50 zł (pięćdziesiąt złotych) na pierwsze pełne miesięczne czesne (dalej: „Zniżka z polecenia”), aktywowany poprzez indywidualny link polecający udostępniany po opłaceniu zaliczki.",
              },
              {
                text: "Warunkiem przyznania Zniżki z polecenia jest skuteczne powiązanie zgłoszenia nowej osoby (poleconego) z linkiem polecającym oraz opłacenie przez poleconego zaliczki rezerwacyjnej. Zaliczka nie podlega obniżeniu w ramach programu poleceń.",
              },
              {
                text: "Po spełnieniu warunków, o których mowa powyżej, Zniżka z polecenia przysługuje zarówno poleconemu, jak i osobie polecającej — każdorazowo jako obniżenie należności za **pierwszy pełny miesiąc czesnego**. Zniżka jest jednorazowa względem danego zgłoszenia poleconego (dla poleconego: jeden raz na to zgłoszenie; dla polecającego: 50 zł za każdego skutecznie opłaconego poleconego, z możliwością kumulacji przy kolejnych skutecznych poleceniach).",
              },
              {
                text: "Zniżka z polecenia nie łączy się z innymi promocjami, kodami rabatowymi ani obniżkami o charakterze marketingowym, chyba że Usługodawca wyraźnie postanowi inaczej w warunkach danej akcji.",
              },
              {
                text: "Zniżka z polecenia nie podlega wymianie na gotówkę ani wypłacie w innej formie. W szczególności w przypadku rezygnacji, anulowania rezerwacji lub rozwiązania umowy **przed rozpoczęciem zajęć** Zniżka z polecenia nie jest wypłacana ani „wypłacana częściowo” — niewykorzystana zniżka wygasa.",
              },
              {
                text: "Usługodawca zastrzega sobie prawo do odmowy przyznania lub anulowania Zniżki z polecenia w przypadku nadużycia programu (w szczególności auto-polecenia tymi samymi lub pozornie różnymi danymi kontaktowymi, działań pozornych albo naruszenia Regulaminu).",
              },
              {
                text: "Szczegóły techniczne działania linku polecającego wynikają z funkcjonalności serwisu; w razie rozbieżności pierwszeństwo mają postanowienia niniejszego paragrafu.",
              },
            ],
          },
        ],
      },
      {
        title: "4. Organizacja zajęć, komunikacja i nieobecności",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              {
                text: "Zajęcia odbywają się według stałego harmonogramu ustalonego na początku semestru.",
              },
              {
                text: "Ze względów organizacyjnych Uczniowie proszeni są o przybywanie na zajęcia **nie wcześniej niż 15 minut** przed ich planowanym rozpoczęciem.",
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
        title: "5. Zajęcia indywidualne",
        blocks: [
          {
            kind: "list",
            ordered: true,
            items: [
              {
                text: "Niezależnie od zajęć grupowych Usługodawca oferuje odpłatne zajęcia indywidualne (w formule 1:1), realizowane na podstawie indywidualnych ustaleń co do terminu oraz miejsca ich prowadzenia. Usługodawca może powierzyć prowadzenie zajęć indywidualnych wyznaczonemu Prowadzącemu.",
              },
              {
                text: "Wysokość wynagrodzenia za zajęcia indywidualne uzależniona jest od miejsca ich realizacji i wynosi:",
                subItems: [
                  `120 zł za godzinę zegarową (60 minut) - w przypadku zajęć z dojazdem Prowadzącego do Ucznia, wyłącznie na terenie miasta Krakowa,`,
                  `180 zł za godzinę zegarową (60 minut) - w przypadku zajęć odbywających się w sali szkoleniowej Prowadzącego pod adresem: ${SERVICE_ADDRESS}.`,
                ],
              },
              {
                text: "Zajęcia indywidualne z dojazdem Prowadzącego świadczone są wyłącznie w granicach administracyjnych miasta Krakowa. Prowadzący nie realizuje zajęć z dojazdem poza terenem Krakowa.",
              },
              {
                text: "Warunkiem przeprowadzenia zajęć z dojazdem jest zapewnienie przez Ucznia (lub jego opiekuna) odpowiednich warunków do nauki, tj. cichego i oświetlonego miejsca z dostępem do stołu oraz miejsc siedzących.",
              },
              {
                text: "Termin zajęć indywidualnych ustalany jest każdorazowo indywidualnie. Odwołanie lub zmiana ustalonego terminu przez Ucznia wymaga powiadomienia Prowadzącego z wyprzedzeniem co najmniej 24 godzin.",
              },
              {
                text: "W przypadku odwołania zajęć w terminie krótszym niż 24 godziny, nieobecności Ucznia pod ustalonym adresem lub braku możliwości przeprowadzenia zajęć z przyczyn leżących po stronie Ucznia, Prowadzący zachowuje prawo do wynagrodzenia za zaplanowane zajęcia - z tytułu zarezerwowanego czasu oraz poniesionych kosztów dojazdu.",
              },
            ],
          },
        ],
      },
      {
        title: "6. Ferie, dni wolne i elastyczność harmonogramu",
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
        title: "7. Odwołanie lub spóźnienie z winy Prowadzącego i zdarzenia losowe",
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
        title: "8. Rezygnacja z zajęć (rozwiązanie umowy)",
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
                text: "Usługodawca zastrzega sobie prawo do skreślenia Ucznia z listy uczestników w trybie natychmiastowym w przypadku rażącego łamania zasad kultury osobistej lub zalegania z płatnościami za czesne powyżej 14 dni.",
              },
            ],
          },
        ],
      },
      {
        title: "9. Postanowienia końcowe",
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
            text: `Administratorem Twoich danych osobowych jest Paweł Szostak, prowadzący działalność nierejestrowaną w rozumieniu art. 5 ustawy Prawo przedsiębiorców, adres do korespondencji: ${CORRESPONDENCE_ADDRESS}. Zajęcia stacjonarne odbywają się pod adresem: ${SERVICE_ADDRESS}.`,
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
                text: "**Dane dotyczące poziomu i organizacji nauki:** wybrany poziom / pakiet zajęć, klasa szkolna oraz ewentualne uwagi z formularza (w celu organizacji grupy i realizacji usługi edukacyjnej). W toku realizacji usługi Usługodawca (Administrator) może przetwarzać także dane niezbędne do prowadzenia zajęć przekazane później przez Kupującego (np. imię Ucznia), w zakresie niezbędnym do świadczenia usługi — w tym udostępniane Prowadzącemu zajęć.",
              },
              {
                text: "**Dane programu poleceń:** identyfikator powiązania z osobą polecającą (np. parametr linku polecającego zapisany w przeglądarce i przekazany przy zgłoszeniu) oraz informacja o przysługującej zniżce na pierwsze czesne — w celu realizacji programu poleceń opisanego w Regulaminie (art. 6 ust. 1 lit. b RODO).",
              },
              {
                text: "**Dane atrybucji / UTM:** parametry źródła ruchu (np. utm_source, utm_medium, utm_campaign, utm_content), jeśli obecne w adresie URL przy pierwszej wizycie — w celu analizy skuteczności działań marketingowych i organizacji sprzedaży (art. 6 ust. 1 lit. f RODO).",
              },
              {
                text: "**Dane techniczne, analityczne i marketingowe:** adres IP, informacje o przeglądarce, aktywność na stronie oraz dane zbierane przez Google Analytics 4, Microsoft Clarity i narzędzia Meta (Meta Pixel oraz Meta Conversions API) - np. odwiedzone podstrony, źródło ruchu, zdarzenia konwersji (Lead, InitiateCheckout, Purchase), nagrania sesji, heatmapy kliknięć. W ramach Meta Conversions API mogą być przekazywane także zahashowane identyfikatory podane w formularzu (adres e-mail, numer telefonu, imię i nazwisko) oraz identyfikatory cookies Meta (`_fbp`, `_fbc`). Hashowanie nie oznacza anonimizacji w rozumieniu RODO. Przetwarzanie w tych celach następuje wyłącznie po wyrażeniu zgody w banerze cookies.",
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
                text: "**art. 6 ust. 1 lit. b RODO:** wykonanie umowy (rezerwacja miejsca, realizacja zajęć, program poleceń i rozliczenie zniżki na pierwsze czesne).",
              },
              {
                text: "**art. 6 ust. 1 lit. c RODO:** obowiązek prawny (ewidencja sprzedaży, cele podatkowe).",
              },
              {
                text: "**art. 6 ust. 1 lit. f RODO:** prawnie uzasadniony interes (dochodzenie roszczeń, bezpieczeństwo serwisu, atrybucja źródeł ruchu / UTM, organizacja sprzedaży).",
              },
              {
                text: "**art. 6 ust. 1 lit. a RODO:** Twoja dobrowolna zgoda (pliki cookies analityczne Google Analytics 4 i Microsoft Clarity oraz narzędzia marketingowe Meta: Meta Pixel i Meta Conversions API, w tym zaawansowane dopasowywanie konwersji).",
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
            text: "Aby zapewnić sprawne działanie serwisu oraz prawidłową realizację usługi edukacyjnej, korzystamy z zaufanych dostawców usług oraz możemy powierzać lub udostępniać dane osobom współpracującym przy prowadzeniu zajęć, w zakresie niezbędnym do wykonania umowy:",
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
                text: "**Google Ireland Limited (Google Analytics 4)** – narzędzie analityczne służące do mierzenia ruchu na stronie, analizy zachowań użytkowników oraz optymalizacji serwisu. Google Analytics 4 korzysta z plików cookies i uruchamia się wyłącznie po wyrażeniu zgody w banerze cookies na tej stronie.",
              },
              {
                text: "**Microsoft Ireland Operations Limited (Microsoft Clarity)** – narzędzie analityczne służące do analizy zachowań użytkowników na stronie (np. heatmapy kliknięć, nagrania sesji, czas spędzony na podstronach). Microsoft Clarity korzysta z plików cookies i uruchamia się wyłącznie po wyrażeniu zgody w banerze cookies na tej stronie.",
              },
              {
                text: "**Meta Platforms Ireland Limited (Meta Pixel oraz Meta Conversions API)** – narzędzia analityczne i marketingowe służące do mierzenia skuteczności kampanii reklamowych Meta (Facebook, Instagram), analizy konwersji, tworzenia grup odbiorców oraz kierowania spersonalizowanych reklam. Dane mogą być przekazywane zarówno przez skrypt w przeglądarce (Meta Pixel), jak i przez bezpieczne wywołania serwerowe (Meta Conversions API). Uruchomienie następuje wyłącznie po wyrażeniu zgody w banerze cookies na tej stronie; wybór „Tylko niezbędne” oznacza brak Pixela i brak Conversions API.",
              },
              {
                text: "**Nauczyciele i inne osoby współpracujące przy realizacji usługi edukacyjnej** — osoby fizyczne lub podmioty, z którymi Usługodawca (Administrator) zawiera umowy współpracy / świadczenia usług oraz — w zakresie wymaganym przepisami — umowy powierzenia przetwarzania danych osobowych (art. 28 RODO) albo którym Administrator udziela upoważnienia do przetwarzania danych. Zakres danych obejmuje w szczególności dane niezbędne do prowadzenia zajęć i kontaktu organizacyjnego (np. imię i nazwisko Kupującego lub Ucznia, klasa / poziom grupy, dane kontaktowe Kupującego w zakresie potrzebnym do realizacji zajęć). Dane są udostępniane wyłącznie w celu prawidłowej realizacji usługi edukacyjnej i nie są wykorzystywane przez te osoby do własnych celów marketingowych.",
              },
            ],
          },
          {
            kind: "paragraph",
            text: "W ramach korzystania z Google Analytics 4, Microsoft Clarity oraz narzędzi Meta (Pixel i Conversions API) dane mogą być przekazywane do podmiotów z grupy Google LLC, Microsoft Corporation oraz Meta Platforms, Inc. z siedzibą w Stanach Zjednoczonych. Transfer odbywa się na podstawie decyzji Komisji Europejskiej w sprawie adekwatności ochrony (EU-US Data Privacy Framework) lub standardowych klauzul umownych zatwierdzonych przez Komisję Europejską.",
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
          {
            kind: "paragraph",
            text: "Decyzja o wyrażeniu lub odmowie zgody na pliki cookies analityczne i marketingowe jest zapisywana lokalnie w przeglądarce użytkownika (localStorage) oraz - w zakresie niezbędnym do respektowania tej decyzji także po stronie serwera (m.in. Meta Conversions API) - w pliku cookie preferencji `matma_cookie_consent`. Preferencje są przechowywane do momentu ich wycofania lub usunięcia danych przeglądarki. Po upływie 12 miesięcy od ostatniej decyzji baner cookies może zostać wyświetlony ponownie w celu potwierdzenia preferencji.",
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
                text: "cofnięcia zgody na pliki cookies analityczne (Google Analytics 4, Microsoft Clarity) i marketingowe (Meta Pixel oraz Meta Conversions API) w dowolnym momencie - poprzez link „Ustawienia plików cookies” w stopce strony lub kontakt z Administratorem.",
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
            text: "Nasz serwis wykorzystuje pliki cookies. Narzędzia analityczne i marketingowe (Google Analytics 4, Microsoft Clarity, Meta Pixel oraz Meta Conversions API) uruchamiają się wyłącznie po kliknięciu „Akceptuj wszystkie” w banerze cookies wyświetlanym przy pierwszej wizycie na stronie.",
          },
          {
            kind: "list",
            ordered: false,
            items: [
              {
                text: "**Niezbędne (techniczne):** wymagane do prawidłowego działania strony (np. mechanizmy płatności Stripe, bezpieczeństwo serwisu). Nie wymagają zgody i są aktywne niezależnie od ustawień banera.",
              },
              {
                text: "**Preferencje zgody (`matma_cookie_consent`):** zapisują Twój wybór dotyczący cookies analitycznych i marketingowych, abyśmy mogli go respektować także po stronie serwera (np. przy Meta Conversions API). Cookie preferencji nie służy do śledzenia reklamowego.",
              },
              {
                text: "**Analityczne (Google Analytics 4):** służą do zbierania statystyk odwiedzin i korzystania ze strony (np. liczba odsłon, źródła ruchu, zachowanie użytkowników). Skrypt Google Analytics 4 oraz powiązane pliki cookies są ładowane wyłącznie po wyrażeniu zgody w banerze cookies.",
              },
              {
                text: "**Analityczne (Microsoft Clarity):** służą do analizy zachowań użytkowników na stronie (np. heatmapy kliknięć, nagrania sesji, czas spędzony na podstronach). Skrypt Microsoft Clarity oraz powiązane pliki cookies są ładowane wyłącznie po wyrażeniu zgody w banerze cookies.",
              },
              {
                text: "**Marketingowe (Meta Pixel i Meta Conversions API):** służą do mierzenia konwersji, analizy ruchu z kampanii Meta Ads oraz kierowania spersonalizowanych reklam w serwisach Meta. Ta sama zgoda obejmuje skrypt Meta Pixel w przeglądarce oraz serwerowy pomiar konwersji (Conversions API). Uruchomienie następuje wyłącznie po wyrażeniu zgody w banerze cookies.",
              },
              {
                text: "**Zarządzanie zgodą:** wybór „Tylko niezbędne” oznacza odmowę narzędzi analitycznych i marketingowych - Google Analytics 4, Microsoft Clarity, Meta Pixel i Meta Conversions API nie zostaną uruchomione. Zgodę możesz w każdej chwili wycofać lub zmienić, klikając link „Ustawienia plików cookies” w stopce strony - baner cookies pojawi się ponownie i umożliwi nowy wybór. Decyzja jest zapisywana w localStorage oraz w cookie preferencji `matma_cookie_consent`.",
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
