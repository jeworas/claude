/**
 * UI internationalization dictionary (English + Polish).
 *
 * Scope: this translates the app *chrome* — navigation, section headings,
 * labels, buttons, disclaimers. It deliberately does NOT translate guideline
 * *content* (titles, summaries, recommendations): those stay in their source
 * language (Polish guidelines in Polish, US/EU guidelines in English), which is
 * what a clinician expects.
 */

export type Lang = 'en' | 'pl';
export const LANGS: Lang[] = ['en', 'pl'];
export const DEFAULT_LANG: Lang = 'en';
export const LANG_STORAGE_KEY = 'ga-lang';

type Dict = Record<string, string>;

const en: Dict = {
  'nav.home': 'Home',
  'nav.search': 'Search',
  'nav.conditions': 'Conditions',
  'nav.drugs': 'Medicines',
  'nav.societies': 'Societies',
  'nav.coverage': 'Coverage',
  'nav.about': 'About',
  'conditions.title': 'Browse conditions',
  'conditions.subtitle':
    'Every condition in the index, grouped by specialty. Each gathers the matching guidelines from all mapped societies.',
  'conditions.filter.title': 'Browse by specialty',
  'conditions.filter.all': 'All specialties',
  'drugs.title': 'Browse medicines',
  'drugs.subtitle':
    'Every medicine in the atlas, cross-referenced to the conditions it is recommended for. Open one to see its indications, therapy line and standard dosing across guidelines.',
  'drugs.search': 'Filter medicines…',
  'drugs.none': 'No medicines match.',
  'drugs.count.conditions': 'conditions',
  'drugs.count.guidelines': 'guidelines',
  'drug.crumb': 'Medicine',
  'drug.alsoknown': 'Also known as',
  'drug.usedacross': 'Recommended across',
  'drug.condition.one': 'condition',
  'drug.condition.many': 'conditions',
  'drug.in': 'in',
  'drug.guideline.one': 'guideline',
  'drug.guideline.many': 'guidelines',
  'drug.line': 'Line',
  'drug.evidence': 'Evidence',
  'drug.dosing': 'Standard dosing',
  'drug.dosing.note':
    'Standard adult regimens for quick reference only — they omit contraindications, renal/hepatic adjustment, monitoring and interactions. Always verify against the source guideline and local formulary.',
  'drug.viewcondition': 'View condition',
  'drug.viewguideline': 'View guideline',
  'drug.empty': 'This medicine has no indexed uses yet.',
  'search.medicine': 'Medicine',
  'search.medicine.used': 'recommended for',
  'search.medicine.cta': 'see all uses',
  'search.condition': 'Condition',
  'search.condition.cta': 'open condition',
  'lang.toggle.aria': 'Switch language',
  'a11y.skip': 'Skip to content',

  'disclaimer.text':
    'Reference tool for healthcare professionals. Summaries are hand-curated demo data and may be incomplete or out of date — always verify against the original guideline before making clinical decisions. Not a medical device and not a substitute for clinical judgement.',

  'footer.poc': 'GuidelineAtlas — proof of concept',
  'footer.note':
    'Demonstration project. Guideline summaries are hand-curated sample data for a limited set of US, European and Polish societies and are not a complete or authoritative source. Always consult the original publication. This tool does not provide medical advice.',

  'home.hero.title1': 'Find current treatment guidelines,',
  'home.hero.title2': 'in English or Polish',
  'home.hero.subtitle':
    'One search across US, European and Polish medical societies. Type a condition, drug, or abbreviation in either language — see a treatment summary and jump straight to the source guideline.',
  'home.try': 'Try:',
  'home.stat.guidelines': 'Guidelines',
  'home.stat.societies': 'Societies',
  'home.stat.regions': 'Regions',
  'home.stat.conditions': 'Conditions',
  'home.browse.title': 'Browse common conditions',
  'home.browse.subtitle':
    'Each condition gathers the matching guidelines from every mapped society, side by side.',
  'home.card.guideline': 'guideline',
  'home.card.guidelines': 'guidelines',
  'home.why.title': 'Why GuidelineAtlas',
  'home.feature.bilingual.title': 'Bilingual by design',
  'home.feature.bilingual.body':
    'Search in English or Polish. “WZJG”, “wrzodziejące zapalenie jelita grubego”, “UC” and “ulcerative colitis” all resolve to the same condition — and we show you which term matched.',
  'home.feature.freshness.title': 'Freshness at a glance',
  'home.feature.freshness.body':
    'Every guideline shows its publication year and a currency badge, so an out-of-date recommendation is obvious before you rely on it.',
  'home.feature.source.title': 'Straight to the source',
  'home.feature.source.body':
    'Structured treatment summaries are attributed to one guideline and link directly to the original publication for the full text.',

  'searchbar.placeholder': 'Search a condition, drug, or society — e.g. colitis, WZJG, H. pylori',
  'searchbar.button': 'Search',
  'searchbar.aria': 'Search guidelines',

  'search.results.for': 'for',
  'search.results.guideline': 'guideline',
  'search.results.guidelines': 'guidelines',
  'search.results.of': 'of',
  'search.none.title': 'No guidelines matched',
  'search.none.hint':
    'Try a condition (colitis, GERD), an abbreviation (UC, WZJG, IBS), a drug (budesonide), or a Polish term (refluks, cukrzyca).',
  'search.start.title': 'Start typing to search.',
  'search.start.try': 'Try:',
  'search.filters': 'Filters',
  'search.filters.clear': 'Clear',
  'search.filter.country': 'Country',
  'search.filter.society': 'Society',
  'search.filter.specialty': 'Specialty',
  'search.nofilter': 'No results with these filters.',
  'search.nofilter.clear': 'Clear filters',

  'answer.quickref': 'Quick reference',
  'answer.note':
    'Compiled from structured guideline summaries for quick reference — verify against the source before acting. Exact source-passage quoting will follow once full guideline texts are ingested.',
  'answer.intent.dosing': 'Dosing',
  'answer.intent.first-line': 'First-line treatment',
  'answer.intent.diagnosis': 'Diagnosis',
  'answer.intent.screening': 'Screening',
  'answer.intent.maintenance': 'Maintenance',
  'answer.intent.drug': 'Drug',

  'region.US': 'United States',
  'region.EU': 'Europe',
  'region.PL': 'Poland',
  'region.UK': 'United Kingdom',
  'region.INT': 'International',

  'line.diagnosis': 'Diagnosis',
  'line.screening': 'Screening',
  'line.first-line': 'First-line',
  'line.second-line': 'Second-line',
  'line.escalation': 'Escalation',
  'line.maintenance': 'Maintenance',
  'line.refractory': 'Refractory',
  'line.prevention': 'Prevention',
  'line.supportive': 'Supportive',

  'fresh.current': 'Current',
  'fresh.superseded': 'Superseded',
  'fresh.old': 'yrs old — check for update',

  'condition.crumb': 'Condition',
  'condition.summary.current': 'current',
  'condition.summary.guideline': 'guideline',
  'condition.summary.guidelines': 'guidelines',
  'condition.summary.across': 'across',
  'condition.summary.region': 'region',
  'condition.summary.regions': 'regions',
  'condition.summary.tail': 'see where US, European and Polish societies agree and where they differ.',
  'condition.alsoknown': 'Also known as:',
  'condition.compare.title': 'How the regions compare',
  'condition.compare.subtitle.a': 'Current recommendations aligned by line of therapy.',
  'condition.compare.subtitle.consensus': '= the same drug is recommended in another region (consensus);',
  'condition.compare.subtitle.specific': '= region-specific. Polish and English drug names are matched across languages.',
  'condition.compare.therapyline': 'Therapy line',
  'condition.compare.expand': 'tap to expand the side-by-side matrix',
  'condition.timeline.title': 'How the guidance evolved',
  'condition.timeline.subtitle':
    'Successive editions from each society. The most recent is current; earlier editions are superseded but kept for reference.',
  'condition.timeline.current': 'current',
  'condition.timeline.superseded': 'superseded',
  'condition.byregion.title': 'Current guidelines by region',

  'card.view': 'View summary',
  'langhint.via': 'matched via',
  'langhint.src.name-en': 'English name',
  'langhint.src.name-pl': 'Polish name',
  'langhint.src.synonym-en': 'English synonym',
  'langhint.src.synonym-pl': 'Polish synonym',
  'langhint.src.abbreviation': 'abbreviation',

  'guideline.overview': 'Overview',
  'guideline.keyrec.title': 'Key treatment recommendations',
  'guideline.keyrec.subtitle':
    'Condensed for quick reference — consult the full guideline for complete criteria, dosing, and caveats.',
  'guideline.dosing.title': 'Dosing quick-reference',
  'guideline.dosing.subtitle':
    'Standard adult regimens for quick reference only — they omit contraindications, renal/hepatic adjustment, monitoring and interactions. Always verify against the source guideline and local formulary before prescribing.',
  'guideline.dosing.drug': 'Drug',
  'guideline.dosing.indication': 'Indication',
  'guideline.dosing.regimen': 'Regimen',
  'guideline.read': 'Read the full guideline',
  'guideline.print': 'Print / Save PDF',
  'guideline.lastverified': 'Last verified',
  'guideline.sourceofrecord': 'Source of record:',
  'guideline.demo.warn':
    'Hand-curated demo summary. Verify every recommendation against the original publication before clinical use.',
  'guideline.related': 'Other guidelines for the same condition',
  'guideline.superseded.warn': 'This is a superseded edition, shown for historical reference.',
  'guideline.superseded.current': 'The current version is',

  'societies.title': 'Mapped societies',
  'societies.subtitle':
    'The guideline-issuing bodies mapped so far — major societies across many specialties in the US, Europe, the UK, Poland and international bodies. Full guideline text is ingested for the gastroenterology cluster first; every other society links out to its own guidelines index.',
  'societies.viewguidelines': 'View guidelines',
  'societies.site': 'Society site',
  'societies.guidelines': 'guidelines',
  'societies.guidelines.title': 'Guidelines',
  'societies.homepage': 'Homepage',
  'societies.index': 'Guidelines index',
  'societies.none':
    'No guidelines have been ingested into the atlas for this society yet — it is mapped as a source. Open its guidelines index above to browse them at the publisher.',
  'societies.filter.title': 'Browse by specialty',
  'societies.filter.all': 'All specialties',
  'societies.filter.count': 'societies',

  'coverage.title': 'Coverage dashboard',
  'coverage.subtitle':
    'How the atlas covers each specialty across regions — current guidelines by discipline and region, the conditions indexed for each, and how many current guidelines are aging. Gaps (a discipline with conditions but few guidelines) are where the atlas grows next.',
  'coverage.stat.guidelines': 'Current guidelines',
  'coverage.stat.specialties': 'Specialties',
  'coverage.stat.regions': 'Regions covered',
  'coverage.stat.conditions': 'Conditions',
  'coverage.col.specialty': 'Specialty',
  'coverage.col.total': 'Total',
  'coverage.col.conditions': 'Conditions',
  'coverage.col.aging': 'Aging',
  'coverage.row.total': 'All specialties',
  'coverage.note':
    'Counts reflect current (non-superseded) guidelines in this demo dataset. “Aging” counts current guidelines older than 5 years — a prompt to check the source for a newer edition. Select a specialty to browse its conditions.',
  'coverage.recent.title': 'Recently published',
  'coverage.recent.subtitle': 'The newest current guidelines in the atlas, most recent first.',
  'coverage.aging.title': 'Due for review',
  'coverage.aging.subtitle':
    'Current guidelines more than 5 years old, oldest first — each is a prompt to check the source for a newer edition.',
  'coverage.aging.more': 'more older than 5 years',

  'about.title': 'About GuidelineAtlas',
  'about.intro':
    'GuidelineAtlas is a proof-of-concept for a bilingual index of clinical practice guidelines. It gathers treatment recommendations from medical societies in the United States, Europe and Poland into one searchable place, so a clinician can find the current guidance for a condition — in English or Polish — in seconds instead of hunting across dozens of society websites.',
  'about.contains.title': 'What this demo contains',
  'about.contains.note':
    'A hand-curated sample covering gastroenterology and hepatology in depth, with a growing spread across cardiology, diabetology, nephrology, pulmonology, oncology, urology, ophthalmology, infectious disease and primary-care prevention — drawn from US, European, Polish and international societies. It is deliberately limited and is not a complete or authoritative catalogue.',
  'about.search.title': 'How search works',
  'about.search.body':
    'Every condition carries its English and Polish names, common synonyms, and abbreviations. A query is first resolved against this bilingual thesaurus — so “colitis”, “UC”, “WZJG” and “wrzodziejące zapalenie jelita grubego” all find ulcerative colitis — and then run through a fuzzy full-text index that also matches drug names and society names. Results show which term matched, so the cross-language behaviour is transparent.',
  'about.fresh.title': 'Keeping data current',
  'about.fresh.body':
    'Guidelines are updated on irregular schedules, so freshness is a first-class feature: each record shows its publication year and a currency badge, superseded editions are kept in a revision timeline, and the repository ships a demonstration update-checker that reads a society’s public guidelines index and reports guidelines it does not yet know about — a sketch of the monitoring pipeline a production version would run automatically.',
  'about.data.title': 'Data, sources and copyright',
  'about.data.body':
    'Summaries are original short paraphrases written for quick reference, each linking to the original publication for the full text. The app stores only metadata, brief summaries and links — it does not reproduce or host the full guidelines or their PDFs. In a production system, content would be maintained by qualified editors with a documented review cadence, and publisher terms for each source would be reviewed.',
  'about.limits.title': 'Important limitations',
  'about.limits.1': 'This is demonstration data and may contain errors, omissions or out-of-date content.',
  'about.limits.2': 'Summaries and dosing are condensed and omit criteria, contraindications and caveats.',
  'about.limits.3': 'Always read the original guideline before making any clinical decision.',
  'about.reg.title': 'Not a medical device · not medical advice',
  'about.reg.body':
    'GuidelineAtlas is an informational reference index for healthcare professionals. It does not diagnose, does not recommend treatment for any individual patient, and is not intended to be clinical decision support within the meaning of applicable medical-device regulation (for example, the EU Medical Device Regulation, or the clinical-decision-support provisions of the US 21st Century Cures Act). It is not a substitute for professional judgement. Any real-world clinical deployment would require formal regulatory and legal review.',
};

const pl: Dict = {
  'nav.home': 'Strona główna',
  'nav.search': 'Szukaj',
  'nav.conditions': 'Choroby',
  'nav.drugs': 'Leki',
  'nav.societies': 'Towarzystwa',
  'nav.coverage': 'Zasięg',
  'nav.about': 'O aplikacji',
  'conditions.title': 'Przeglądaj choroby',
  'conditions.subtitle':
    'Wszystkie choroby w indeksie, pogrupowane według specjalności. Każda zbiera pasujące wytyczne ze wszystkich uwzględnionych towarzystw.',
  'conditions.filter.title': 'Przeglądaj według specjalności',
  'conditions.filter.all': 'Wszystkie specjalności',
  'drugs.title': 'Przeglądaj leki',
  'drugs.subtitle':
    'Każdy lek w atlasie, powiązany z chorobami, w których jest zalecany. Otwórz lek, aby zobaczyć wskazania, linię leczenia i standardowe dawkowanie w różnych wytycznych.',
  'drugs.search': 'Filtruj leki…',
  'drugs.none': 'Brak pasujących leków.',
  'drugs.count.conditions': 'chorób',
  'drugs.count.guidelines': 'wytycznych',
  'drug.crumb': 'Lek',
  'drug.alsoknown': 'Znany też jako',
  'drug.usedacross': 'Zalecany w',
  'drug.condition.one': 'chorobie',
  'drug.condition.many': 'chorobach',
  'drug.in': 'w',
  'drug.guideline.one': 'wytycznej',
  'drug.guideline.many': 'wytycznych',
  'drug.line': 'Linia',
  'drug.evidence': 'Dowody',
  'drug.dosing': 'Standardowe dawkowanie',
  'drug.dosing.note':
    'Standardowe schematy dla dorosłych wyłącznie jako szybkie odniesienie — pomijają przeciwwskazania, modyfikacje przy niewydolności nerek/wątroby, monitorowanie i interakcje. Zawsze weryfikuj ze źródłową wytyczną i lokalnym receptariuszem.',
  'drug.viewcondition': 'Zobacz chorobę',
  'drug.viewguideline': 'Zobacz wytyczną',
  'drug.empty': 'Ten lek nie ma jeszcze zindeksowanych zastosowań.',
  'search.medicine': 'Lek',
  'search.medicine.used': 'zalecany w',
  'search.medicine.cta': 'zobacz wszystkie zastosowania',
  'search.condition': 'Choroba',
  'search.condition.cta': 'otwórz chorobę',
  'lang.toggle.aria': 'Zmień język',
  'a11y.skip': 'Przejdź do treści',

  'disclaimer.text':
    'Narzędzie referencyjne dla pracowników ochrony zdrowia. Podsumowania są przygotowanymi ręcznie danymi demonstracyjnymi i mogą być niekompletne lub nieaktualne — przed podjęciem decyzji klinicznych zawsze zweryfikuj je z oryginalną wytyczną. To nie jest wyrób medyczny ani substytut oceny klinicznej.',

  'footer.poc': 'GuidelineAtlas — prototyp',
  'footer.note':
    'Projekt demonstracyjny. Podsumowania wytycznych to przygotowane ręcznie przykładowe dane dla ograniczonej liczby towarzystw z USA, Europy i Polski i nie stanowią kompletnego ani autorytatywnego źródła. Zawsze korzystaj z oryginalnej publikacji. To narzędzie nie udziela porad medycznych.',

  'home.hero.title1': 'Znajdź aktualne wytyczne leczenia,',
  'home.hero.title2': 'po polsku lub angielsku',
  'home.hero.subtitle':
    'Jedno wyszukiwanie w towarzystwach medycznych z USA, Europy i Polski. Wpisz chorobę, lek lub skrót w dowolnym języku — zobacz podsumowanie leczenia i przejdź prosto do źródłowej wytycznej.',
  'home.try': 'Wypróbuj:',
  'home.stat.guidelines': 'Wytyczne',
  'home.stat.societies': 'Towarzystwa',
  'home.stat.regions': 'Regiony',
  'home.stat.conditions': 'Choroby',
  'home.browse.title': 'Przeglądaj częste choroby',
  'home.browse.subtitle':
    'Każda choroba zbiera pasujące wytyczne ze wszystkich uwzględnionych towarzystw, obok siebie.',
  'home.card.guideline': 'wytyczna',
  'home.card.guidelines': 'wytycznych',
  'home.why.title': 'Dlaczego GuidelineAtlas',
  'home.feature.bilingual.title': 'Dwujęzyczny z założenia',
  'home.feature.bilingual.body':
    'Szukaj po polsku lub angielsku. „WZJG”, „wrzodziejące zapalenie jelita grubego”, „UC” i „ulcerative colitis” prowadzą do tej samej choroby — i pokazujemy, który termin pasował.',
  'home.feature.freshness.title': 'Aktualność na pierwszy rzut oka',
  'home.feature.freshness.body':
    'Każda wytyczna pokazuje rok publikacji i znacznik aktualności, więc nieaktualne zalecenie jest widoczne, zanim na nim polegniesz.',
  'home.feature.source.title': 'Prosto do źródła',
  'home.feature.source.body':
    'Ustrukturyzowane podsumowania leczenia są przypisane do jednej wytycznej i linkują bezpośrednio do oryginalnej publikacji z pełnym tekstem.',

  'searchbar.placeholder': 'Szukaj choroby, leku lub towarzystwa — np. colitis, WZJG, H. pylori',
  'searchbar.button': 'Szukaj',
  'searchbar.aria': 'Szukaj wytycznych',

  'search.results.for': 'dla',
  'search.results.guideline': 'wytyczna',
  'search.results.guidelines': 'wytycznych',
  'search.results.of': 'z',
  'search.none.title': 'Brak wytycznych dla',
  'search.none.hint':
    'Spróbuj choroby (colitis, GERD), skrótu (UC, WZJG, IBS), leku (budezonid) lub polskiego terminu (refluks, cukrzyca).',
  'search.start.title': 'Zacznij pisać, aby wyszukać.',
  'search.start.try': 'Wypróbuj:',
  'search.filters': 'Filtry',
  'search.filters.clear': 'Wyczyść',
  'search.filter.country': 'Region',
  'search.filter.society': 'Towarzystwo',
  'search.filter.specialty': 'Specjalność',
  'search.nofilter': 'Brak wyników przy tych filtrach.',
  'search.nofilter.clear': 'Wyczyść filtry',

  'answer.quickref': 'Szybka referencja',
  'answer.note':
    'Zestawione z ustrukturyzowanych podsumowań wytycznych dla szybkiej referencji — przed działaniem zweryfikuj ze źródłem. Cytowanie dokładnych fragmentów źródła pojawi się po wczytaniu pełnych tekstów wytycznych.',
  'answer.intent.dosing': 'Dawkowanie',
  'answer.intent.first-line': 'Leczenie pierwszego rzutu',
  'answer.intent.diagnosis': 'Rozpoznanie',
  'answer.intent.screening': 'Badania przesiewowe',
  'answer.intent.maintenance': 'Leczenie podtrzymujące',
  'answer.intent.drug': 'Lek',

  'region.US': 'Stany Zjednoczone',
  'region.EU': 'Europa',
  'region.PL': 'Polska',
  'region.UK': 'Wielka Brytania',
  'region.INT': 'Międzynarodowe',

  'line.diagnosis': 'Rozpoznanie',
  'line.screening': 'Badania przesiewowe',
  'line.first-line': 'Pierwszego rzutu',
  'line.second-line': 'Drugiego rzutu',
  'line.escalation': 'Eskalacja',
  'line.maintenance': 'Podtrzymujące',
  'line.refractory': 'Oporne',
  'line.prevention': 'Profilaktyka',
  'line.supportive': 'Wspomagające',

  'fresh.current': 'Aktualna',
  'fresh.superseded': 'Zastąpiona',
  'fresh.old': 'lat — sprawdź aktualizację',

  'condition.crumb': 'Choroba',
  'condition.summary.current': 'aktualnych',
  'condition.summary.guideline': 'wytyczna',
  'condition.summary.guidelines': 'wytycznych',
  'condition.summary.across': 'w',
  'condition.summary.region': 'regionie',
  'condition.summary.regions': 'regionach',
  'condition.summary.tail': 'zobacz, gdzie towarzystwa z USA, Europy i Polski się zgadzają, a gdzie różnią.',
  'condition.alsoknown': 'Znane również jako:',
  'condition.compare.title': 'Jak porównują się regiony',
  'condition.compare.subtitle.a': 'Aktualne zalecenia zestawione według linii leczenia.',
  'condition.compare.subtitle.consensus': '= ten sam lek jest zalecany w innym regionie (konsensus);',
  'condition.compare.subtitle.specific': '= charakterystyczny dla regionu. Polskie i angielskie nazwy leków są dopasowywane między językami.',
  'condition.compare.therapyline': 'Linia leczenia',
  'condition.compare.expand': 'rozwiń tabelę porównawczą',
  'condition.timeline.title': 'Jak zmieniały się wytyczne',
  'condition.timeline.subtitle':
    'Kolejne edycje każdego towarzystwa. Najnowsza jest aktualna; wcześniejsze zostały zastąpione, ale zachowane dla referencji.',
  'condition.timeline.current': 'aktualna',
  'condition.timeline.superseded': 'zastąpiona',
  'condition.byregion.title': 'Aktualne wytyczne według regionu',

  'card.view': 'Zobacz podsumowanie',
  'langhint.via': 'dopasowano przez',
  'langhint.src.name-en': 'nazwę angielską',
  'langhint.src.name-pl': 'nazwę polską',
  'langhint.src.synonym-en': 'synonim angielski',
  'langhint.src.synonym-pl': 'synonim polski',
  'langhint.src.abbreviation': 'skrót',

  'guideline.overview': 'Przegląd',
  'guideline.keyrec.title': 'Kluczowe zalecenia terapeutyczne',
  'guideline.keyrec.subtitle':
    'Skondensowane dla szybkiej referencji — pełne kryteria, dawkowanie i zastrzeżenia znajdziesz w pełnej wytycznej.',
  'guideline.dosing.title': 'Szybka referencja dawkowania',
  'guideline.dosing.subtitle':
    'Standardowe schematy dla dorosłych, wyłącznie dla szybkiej referencji — pomijają przeciwwskazania, dostosowanie nerkowe/wątrobowe, monitorowanie i interakcje. Przed przepisaniem zawsze zweryfikuj z wytyczną źródłową i lokalnym formularzem.',
  'guideline.dosing.drug': 'Lek',
  'guideline.dosing.indication': 'Wskazanie',
  'guideline.dosing.regimen': 'Schemat',
  'guideline.read': 'Przeczytaj pełną wytyczną',
  'guideline.print': 'Drukuj / Zapisz PDF',
  'guideline.lastverified': 'Ostatnio zweryfikowano',
  'guideline.sourceofrecord': 'Źródło:',
  'guideline.demo.warn':
    'Ręcznie przygotowane podsumowanie demonstracyjne. Przed użyciem klinicznym zweryfikuj każde zalecenie z oryginalną publikacją.',
  'guideline.related': 'Inne wytyczne dla tej samej choroby',
  'guideline.superseded.warn': 'To jest zastąpiona edycja, pokazana w celach historycznych.',
  'guideline.superseded.current': 'Aktualna wersja to',

  'societies.title': 'Uwzględnione towarzystwa',
  'societies.subtitle':
    'Instytucje wydające wytyczne uwzględnione do tej pory — najważniejsze towarzystwa z wielu specjalności w USA, Europie, Wielkiej Brytanii i Polsce oraz organizacje międzynarodowe. Pełny tekst wytycznych zaindeksowano najpierw dla gastroenterologii; pozostałe towarzystwa odsyłają do własnych indeksów wytycznych.',
  'societies.viewguidelines': 'Zobacz wytyczne',
  'societies.site': 'Strona towarzystwa',
  'societies.guidelines': 'wytycznych',
  'societies.guidelines.title': 'Wytyczne',
  'societies.homepage': 'Strona główna',
  'societies.index': 'Indeks wytycznych',
  'societies.none':
    'Do atlasu nie dodano jeszcze wytycznych tego towarzystwa — jest ono zmapowane jako źródło. Otwórz indeks wytycznych powyżej, aby przeglądać je u wydawcy.',
  'societies.filter.title': 'Przeglądaj według specjalności',
  'societies.filter.all': 'Wszystkie specjalności',
  'societies.filter.count': 'towarzystw',

  'coverage.title': 'Panel zasięgu',
  'coverage.subtitle':
    'Jak atlas pokrywa poszczególne specjalności w różnych regionach — aktualne wytyczne według dziedziny i regionu, zindeksowane dla nich choroby oraz liczba starzejących się aktualnych wytycznych. Luki (dziedzina z chorobami, ale nielicznymi wytycznymi) to kierunki dalszego rozwoju atlasu.',
  'coverage.stat.guidelines': 'Aktualne wytyczne',
  'coverage.stat.specialties': 'Specjalności',
  'coverage.stat.regions': 'Uwzględnione regiony',
  'coverage.stat.conditions': 'Choroby',
  'coverage.col.specialty': 'Specjalność',
  'coverage.col.total': 'Razem',
  'coverage.col.conditions': 'Choroby',
  'coverage.col.aging': 'Starzejące się',
  'coverage.row.total': 'Wszystkie specjalności',
  'coverage.note':
    'Liczby odzwierciedlają aktualne (niezastąpione) wytyczne w tym demonstracyjnym zbiorze danych. „Starzejące się” to aktualne wytyczne starsze niż 5 lat — sygnał, aby sprawdzić u źródła nowsze wydanie. Wybierz specjalność, aby przeglądać jej choroby.',
  'coverage.recent.title': 'Ostatnio opublikowane',
  'coverage.recent.subtitle': 'Najnowsze aktualne wytyczne w atlasie, od najnowszych.',
  'coverage.aging.title': 'Do przeglądu',
  'coverage.aging.subtitle':
    'Aktualne wytyczne starsze niż 5 lat, od najstarszych — każda to sygnał, aby sprawdzić u źródła nowsze wydanie.',
  'coverage.aging.more': 'więcej starszych niż 5 lat',

  'about.title': 'O aplikacji GuidelineAtlas',
  'about.intro':
    'GuidelineAtlas to prototyp dwujęzycznego indeksu wytycznych praktyki klinicznej. Zbiera zalecenia terapeutyczne towarzystw medycznych ze Stanów Zjednoczonych, Europy i Polski w jednym przeszukiwalnym miejscu, aby klinicysta mógł znaleźć aktualne wytyczne dla danej choroby — po polsku lub angielsku — w kilka sekund, zamiast przeszukiwać dziesiątki stron towarzystw.',
  'about.contains.title': 'Co zawiera ta wersja demonstracyjna',
  'about.contains.note':
    'Ręcznie przygotowana próbka obejmująca szczegółowo gastroenterologię i hepatologię, z rosnącym zasięgiem w kardiologii, diabetologii, nefrologii, pulmonologii, onkologii, urologii, okulistyce, chorobach zakaźnych oraz profilaktyce w podstawowej opiece zdrowotnej — z towarzystw amerykańskich, europejskich, polskich i międzynarodowych. Jest celowo ograniczona i nie stanowi kompletnego ani autorytatywnego katalogu.',
  'about.search.title': 'Jak działa wyszukiwanie',
  'about.search.body':
    'Każda choroba ma swoje nazwy angielskie i polskie, częste synonimy i skróty. Zapytanie jest najpierw rozwiązywane w tym dwujęzycznym tezaurusie — więc „colitis”, „UC”, „WZJG” i „wrzodziejące zapalenie jelita grubego” prowadzą do wrzodziejącego zapalenia jelita grubego — a następnie przetwarzane przez rozmyty indeks pełnotekstowy, który dopasowuje także nazwy leków i towarzystw. Wyniki pokazują, który termin pasował, więc zachowanie międzyjęzykowe jest przejrzyste.',
  'about.fresh.title': 'Utrzymywanie aktualności danych',
  'about.fresh.body':
    'Wytyczne są aktualizowane w nieregularnych odstępach, więc aktualność jest funkcją pierwszoplanową: każdy rekord pokazuje rok publikacji i znacznik aktualności, zastąpione edycje są zachowane na osi czasu rewizji, a repozytorium zawiera demonstracyjne narzędzie sprawdzające aktualizacje, które czyta publiczny indeks wytycznych towarzystwa i zgłasza wytyczne jeszcze nieznane — szkic potoku monitorowania, który wersja produkcyjna uruchamiałaby automatycznie.',
  'about.data.title': 'Dane, źródła i prawa autorskie',
  'about.data.body':
    'Podsumowania to oryginalne krótkie parafrazy napisane dla szybkiej referencji, każde z linkiem do oryginalnej publikacji z pełnym tekstem. Aplikacja przechowuje wyłącznie metadane, krótkie podsumowania i linki — nie odtwarza ani nie hostuje pełnych wytycznych ani ich plików PDF. W systemie produkcyjnym treści byłyby utrzymywane przez wykwalifikowanych redaktorów z udokumentowaną kadencją przeglądów, a warunki wydawców dla każdego źródła byłyby weryfikowane.',
  'about.limits.title': 'Ważne ograniczenia',
  'about.limits.1': 'To są dane demonstracyjne i mogą zawierać błędy, pominięcia lub nieaktualne treści.',
  'about.limits.2': 'Podsumowania i dawkowanie są skondensowane i pomijają kryteria, przeciwwskazania i zastrzeżenia.',
  'about.limits.3': 'Przed podjęciem jakiejkolwiek decyzji klinicznej zawsze przeczytaj oryginalną wytyczną.',
  'about.reg.title': 'Nie wyrób medyczny · nie porada medyczna',
  'about.reg.body':
    'GuidelineAtlas jest informacyjnym indeksem referencyjnym dla pracowników ochrony zdrowia. Nie diagnozuje, nie zaleca leczenia dla żadnego konkretnego pacjenta i nie jest przeznaczony do bycia systemem wspomagania decyzji klinicznych w rozumieniu obowiązujących przepisów o wyrobach medycznych (na przykład unijnego rozporządzenia MDR ani przepisów o wspomaganiu decyzji klinicznych amerykańskiej ustawy 21st Century Cures Act). Nie zastępuje oceny profesjonalnej. Jakiekolwiek rzeczywiste wdrożenie kliniczne wymagałoby formalnej weryfikacji regulacyjnej i prawnej.',
};

export const translations: Record<Lang, Dict> = { en, pl };

export function translate(lang: Lang, key: string): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}
