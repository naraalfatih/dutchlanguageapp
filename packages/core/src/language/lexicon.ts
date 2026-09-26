/**
 * A compact lexicon of high-frequency Dutch nouns, adjectives and verbs used by the
 * rule-based mistake detector. Nouns listed here are unambiguous in standard Dutch;
 * words whose gender changes meaning (de/het bal, de/het pad) are deliberately omitted.
 */

export type Gender = 'de' | 'het' | 'both';

const HET_NOUNS = `
huis boek water brood bier glas kind meisje jaar uur land werk geld eten weer weekend station
restaurant café cafe hotel museum park strand bed raam dak woord probleem antwoord nummer adres
gesprek verhaal spel feest examen bureau kantoor bedrijf team gebouw dorp centrum ziekenhuis
paspoort ticket recept geluk leven lichaam hoofd hart been oog oor gezicht gezin vlees fruit ei
zout ontbijt diner menu toilet bad balkon appartement contract huurcontract formulier document
bericht telefoonnummer programma nieuws journaal woordenboek schip vliegtuig perron plein
kruispunt verkeerslicht stoplicht fietspad zwembad cadeau gevoel kwartier moment begin einde
doel plan resultaat onderwerp voorbeeld verschil deel stuk bord mes bestek gerecht dessert
salaris loon gemeentehuis stadhuis lokaal rooster klimaat seizoen bos veld paard dier huisdier
konijn varken schaap gras kanaal eiland nederlands engels vlaams sollicitatiegesprek
theater concert boekje weekendje kopje lied gedicht cijfer rijbewijs verjaardagsfeest
kantoorgebouw bureaublad apparaat wachtwoord account abonnement bankpasje pakket
`;

const DE_NOUNS = `
man vrouw jongen vader moeder broer zus zoon dochter opa oma oom tante vriend vriendin collega
buurman buurvrouw baas dokter huisarts leraar lerares docent student ober kassa winkel
supermarkt markt bakker apotheek drogist bank school universiteit stad straat weg fiets auto bus
trein tram metro boot taxi koffie thee melk kaas soep appel banaan aardappel groente wijn
rekening bon pinpas kaart sleutel deur kamer keuken tuin trap muur tafel stoel lamp computer
telefoon tas jas broek schoen trui hoed week dag maand ochtend middag avond nacht tijd les taal
vraag afspraak vergadering baan sollicitatie gemeente belasting brief envelop post huur huurder
verhuurder woning buurt wijk zon regen wind sneeuw lucht zee rivier berg film muziek sport hobby
vakantie reis verjaardag taart agenda pauze lunch boterham pindakaas hagelslag borrel kroeg
fietsenstalling ov-chipkaart halte richting hoek brug gracht kerk hand arm voet neus mond rug
buik keel koorts pijn griep pil zorgverzekering verzekering mening oplossing ervaring toekomst
geschiedenis cultuur mens persoon kat hond vogel koe bloem boom prijs korting aanbieding maat
kleur fles kop beker pan vork lepel bril wereld plek plaats ruimte zin naam leeftijd familie
relatie bruiloft baby rij wachtkamer receptie balie e-mail mail website app vlucht
bagage koffer paraplu jurk rok sok winkelwagen mand tandarts verpleegkundige badkamer slaapkamer woonkamer wasmachine koelkast verwarming lekkage
`;

const BOTH_NOUNS = `idee`;

function toSet(block: string): string[] {
  return block
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

export const NOUN_GENDER: ReadonlyMap<string, Gender> = new Map<string, Gender>([
  ...toSet(HET_NOUNS).map((w) => [w, 'het'] as [string, Gender]),
  ...toSet(DE_NOUNS).map((w) => [w, 'de'] as [string, Gender]),
  ...toSet(BOTH_NOUNS).map((w) => [w, 'both'] as [string, Gender]),
]);

const DIMINUTIVE = /^[a-z]{2,}(?:je|tje|pje|kje|etje)$/;
const NOT_DIMINUTIVE = new Set(['alsjeblieft', 'dankjewel']);

/** Grammatical gender of a singular noun, or undefined if unknown. Diminutives are always het. */
export function nounGender(noun: string): Gender | undefined {
  const word = noun.toLowerCase();
  const known = NOUN_GENDER.get(word);
  if (known) return known;
  if (DIMINUTIVE.test(word) && !NOT_DIMINUTIVE.has(word)) return 'het';
  return undefined;
}

export function isDiminutive(noun: string): boolean {
  const word = noun.toLowerCase();
  return DIMINUTIVE.test(word) && !NOT_DIMINUTIVE.has(word);
}

/** Adjective base form → inflected (-e) form. */
export const ADJECTIVES: ReadonlyMap<string, string> = new Map(
  Object.entries({
    groot: 'grote',
    klein: 'kleine',
    mooi: 'mooie',
    nieuw: 'nieuwe',
    oud: 'oude',
    lekker: 'lekkere',
    leuk: 'leuke',
    goed: 'goede',
    duur: 'dure',
    goedkoop: 'goedkope',
    rood: 'rode',
    wit: 'witte',
    zwart: 'zwarte',
    blauw: 'blauwe',
    groen: 'groene',
    geel: 'gele',
    lang: 'lange',
    kort: 'korte',
    warm: 'warme',
    koud: 'koude',
    druk: 'drukke',
    rustig: 'rustige',
    gezellig: 'gezellige',
    snel: 'snelle',
    lief: 'lieve',
    dik: 'dikke',
    dun: 'dunne',
    hoog: 'hoge',
    laag: 'lage',
    jong: 'jonge',
    leeg: 'lege',
    vol: 'volle',
    schoon: 'schone',
    vies: 'vieze',
    zwaar: 'zware',
    licht: 'lichte',
    donker: 'donkere',
    belangrijk: 'belangrijke',
    moeilijk: 'moeilijke',
    makkelijk: 'makkelijke',
    fijn: 'fijne',
    slecht: 'slechte',
    aardig: 'aardige',
    vriendelijk: 'vriendelijke',
    bekend: 'bekende',
    heerlijk: 'heerlijke',
    prachtig: 'prachtige',
    bruin: 'bruine',
    grijs: 'grijze',
    breed: 'brede',
    smal: 'smalle',
    zoet: 'zoete',
    vers: 'verse',
    ziek: 'zieke',
    blij: 'blije',
    boos: 'boze',
    eerlijk: 'eerlijke',
    rijk: 'rijke',
    arm: 'arme',
    nieuwsgierig: 'nieuwsgierige',
    interessant: 'interessante',
    saai: 'saaie',
    stil: 'stille',
    ruim: 'ruime',
    gratis: 'gratis',
  }),
);

const INFLECTED_TO_BASE: ReadonlyMap<string, string> = new Map(
  [...ADJECTIVES].filter(([base, inflected]) => base !== inflected).map(([b, i]) => [i, b]),
);

export function adjectiveForms(word: string): { base: string; inflected: string } | undefined {
  const w = word.toLowerCase();
  if (ADJECTIVES.has(w)) return { base: w, inflected: ADJECTIVES.get(w)! };
  const base = INFLECTED_TO_BASE.get(w);
  if (base) return { base, inflected: w };
  return undefined;
}

export const SUBJECT_PRONOUNS = ['ik', 'jij', 'je', 'hij', 'zij', 'ze', 'we', 'wij', 'jullie', 'u'] as const;

/** Finite verb forms frequently produced by learners (used to detect verb position). */
export const FINITE_VERBS = new Set(
  toSet(`
ben bent is zijn heb hebt heeft hebben ga gaat gaan wil wilt willen kan kun kunt kunnen moet moeten
mag mogen zal zult zullen woon woont wonen werk werkt werken kom komt komen heet heten spreek
spreekt spreken vind vindt vinden weet weten zie ziet zien doe doet doen leer leert leren studeer
studeert studeren eet eten drink drinkt drinken koop koopt kopen maak maakt maken speel speelt
spelen lees leest lezen schrijf schrijft schrijven denk denkt denken hoop hoopt hopen blijf
blijft blijven word wordt worden sta staat staan zit zitten lig ligt liggen fiets fietst fietsen
kook kookt koken slaap slaapt slapen bel belt bellen was waren had hadden ging gingen kwam kwamen
`),
);

/** Common infinitives (for "modal + infinitive goes to the end"). */
export const INFINITIVES = new Set(
  toSet(`
hebben zijn gaan doen komen werken wonen eten drinken zien maken kopen betalen spelen leren
kijken lezen schrijven praten spreken bellen helpen halen brengen nemen geven krijgen zeggen
vragen zoeken vinden proberen beginnen stoppen bestellen reserveren huren boeken bezoeken
bezichtigen ontmoeten afspreken ophalen opbellen meenemen uitnodigen regelen sturen
`),
);

/** Present-tense 2nd person forms that drop -t when jij/je follows (werkt jij → werk jij). */
export const JIJ_INVERSION: ReadonlyMap<string, string> = new Map(
  Object.entries({
    werkt: 'werk',
    woont: 'woon',
    komt: 'kom',
    gaat: 'ga',
    hebt: 'heb',
    wilt: 'wil',
    kunt: 'kun',
    spreekt: 'spreek',
    drinkt: 'drink',
    leert: 'leer',
    doet: 'doe',
    ziet: 'zie',
    wordt: 'word',
    vindt: 'vind',
    zegt: 'zeg',
    maakt: 'maak',
    speelt: 'speel',
    studeert: 'studeer',
    kookt: 'kook',
    fietst: 'fiets',
    bent: 'ben',
    denkt: 'denk',
    hoopt: 'hoop',
    blijft: 'blijf',
    koopt: 'koop',
    leest: 'lees',
    schrijft: 'schrijf',
    belt: 'bel',
    staat: 'sta',
    slaapt: 'slaap',
    loopt: 'loop',
    neemt: 'neem',
    geeft: 'geef',
    krijgt: 'krijg',
  }),
);

/** Participles that take `zijn` in the perfect tense (never `hebben`). */
export const ZIJN_PARTICIPLES = new Set(
  toSet(
    `gegaan gekomen geweest gebleven geworden vertrokken gestorven geboren gevallen begonnen verhuisd
     teruggekomen aangekomen opgestaan meegegaan uitgegaan weggegaan thuisgekomen verdwenen gegroeid
     gebeurd geslaagd`,
  ),
);

/** Intransitive activity participles that take `hebben` (a person can't be their passive subject). */
export const HEBBEN_PARTICIPLES = new Set(
  toSet(
    `gewerkt gegeten gedronken geslapen gewoond gekookt gedanst gestudeerd gewacht gekeken gelachen
     gehuild gepraat gesport geluisterd gespeeld gewinkeld gezongen gerookt`,
  ),
);

/** Separable verbs learners often leave unsplit in main clauses: unsplit form → [verb, particle]. */
export const SEPARABLE_UNSPLIT: ReadonlyMap<string, [string, string]> = new Map(
  Object.entries({
    opbel: ['bel', 'op'],
    opbelt: ['belt', 'op'],
    opsta: ['sta', 'op'],
    opstaat: ['staat', 'op'],
    aankom: ['kom', 'aan'],
    aankomt: ['komt', 'aan'],
    meega: ['ga', 'mee'],
    meegaat: ['gaat', 'mee'],
    meeneem: ['neem', 'mee'],
    meeneemt: ['neemt', 'mee'],
    terugkom: ['kom', 'terug'],
    terugkomt: ['komt', 'terug'],
    uitga: ['ga', 'uit'],
    uitgaat: ['gaat', 'uit'],
    opruim: ['ruim', 'op'],
    opruimt: ['ruimt', 'op'],
    afwas: ['was', 'af'],
    afwast: ['wast', 'af'],
    uitnodig: ['nodig', 'uit'],
    uitnodigt: ['nodigt', 'uit'],
    afspreek: ['spreek', 'af'],
    afspreekt: ['spreekt', 'af'],
    ophaal: ['haal', 'op'],
    ophaalt: ['haalt', 'op'],
    aankleed: ['kleed', 'aan'],
    aankleedt: ['kleedt', 'aan'],
  }),
);

export const NUMBER_WORDS = new Set(
  toSet(
    `een twee drie vier vijf zes zeven acht negen tien elf twaalf dertien veertien vijftien zestien
     zeventien achttien negentien twintig dertig veertig vijftig zestig zeventig tachtig negentig
     honderd duizend`,
  ),
);
