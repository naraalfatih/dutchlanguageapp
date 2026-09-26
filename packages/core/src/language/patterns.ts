import type { MistakeCategory } from '../schemas/common.js';
import type { Exercise } from '../schemas/content.js';

/**
 * The catalogue of recurring learner mistakes. Every correction — from the rule-based
 * detector or from the AI — is tagged with one of these ids so the Mistake Diary can
 * group, trend and drill them.
 */
export interface MistakePattern {
  id: string;
  title: string;
  category: MistakeCategory;
  /** One-sentence rule shown in the diary. */
  rule: string;
  /** Longer explanation for the pattern detail page. */
  explanation: string;
  examples: { wrong: string; right: string }[];
  /** A small bank of targeted practice (mixed with the learner's own sentences). */
  drills: Exercise[];
}

const p = (pattern: MistakePattern) => pattern;

export const MISTAKE_PATTERNS: MistakePattern[] = [
  p({
    id: 'word-order-v2',
    title: 'Word order: verb in second place',
    category: 'grammar',
    rule: 'In a main clause the conjugated verb is always the second element. If you start with a time or place, the subject moves after the verb.',
    explanation:
      "Dutch main clauses are 'verb-second' (V2). The first slot can hold the subject, but also a time ('Morgen'), a place ('In Utrecht') or an object. Whatever comes first, the finite verb comes next, and the subject follows it: 'Morgen ga ik naar Amsterdam', not 'Morgen ik ga…'.",
    examples: [
      { wrong: 'Morgen ik ga naar Amsterdam.', right: 'Morgen ga ik naar Amsterdam.' },
      { wrong: 'In het weekend wij spelen voetbal.', right: 'In het weekend spelen wij voetbal.' },
    ],
    drills: [
      { id: 'drill.v2.1', type: 'order', patternId: 'word-order-v2', en: 'Tomorrow I am going to Utrecht.', words: ['Morgen', 'ga', 'ik', 'naar', 'Utrecht'] },
      { id: 'drill.v2.2', type: 'order', patternId: 'word-order-v2', en: 'On Saturday we are having dinner with friends.', words: ['Zaterdag', 'eten', 'we', 'met', 'vrienden'] },
      { id: 'drill.v2.3', type: 'translate', patternId: 'word-order-v2', prompt: 'Today I have no time.', accept: ['Vandaag heb ik geen tijd', 'Vandaag heb ik geen tijd.'] },
      { id: 'drill.v2.4', type: 'fill', patternId: 'word-order-v2', sentence: 'Vanavond ___ ik naar de film.', en: 'Tonight I am going to the cinema.', accept: ['ga'] },
      { id: 'drill.v2.5', type: 'translate', patternId: 'word-order-v2', prompt: 'Sometimes she works from home.', accept: ['Soms werkt ze thuis', 'Soms werkt zij thuis', 'Soms werkt ze vanuit huis', 'Soms werkt zij vanuit huis'] },
    ],
  }),
  p({
    id: 'verb-final-subclause',
    title: 'Verb at the end after omdat, dat, als…',
    category: 'grammar',
    rule: "In a subordinate clause (after omdat, dat, als, wanneer, terwijl, toen…) the conjugated verb goes to the end. 'Want' is the exception: it keeps normal order.",
    explanation:
      "Subordinating conjunctions send the verb to the end of their clause: 'Ik blijf thuis omdat ik moe ben.' Compare 'want', which is coordinating and keeps normal order: 'Ik blijf thuis, want ik ben moe.' Both mean the same thing.",
    examples: [
      { wrong: 'Ik blijf thuis omdat ik ben moe.', right: 'Ik blijf thuis omdat ik moe ben.' },
      { wrong: 'Ik denk dat hij is ziek.', right: 'Ik denk dat hij ziek is.' },
    ],
    drills: [
      { id: 'drill.vf.1', type: 'order', patternId: 'verb-final-subclause', en: '…because I am tired.', words: ['omdat', 'ik', 'moe', 'ben'] },
      { id: 'drill.vf.2', type: 'translate', patternId: 'verb-final-subclause', prompt: 'I think that it is a good idea.', accept: ['Ik denk dat het een goed idee is'] },
      { id: 'drill.vf.3', type: 'fill', patternId: 'verb-final-subclause', sentence: 'Ik weet niet of hij vandaag ___.', en: "I don't know if he is coming today.", accept: ['komt'] },
      { id: 'drill.vf.4', type: 'choose', patternId: 'verb-final-subclause', prompt: 'Which sentence is correct?', options: ['Ik ga niet, want ik ben ziek.', 'Ik ga niet, want ik ziek ben.'], answer: 0, explanation: "'Want' keeps normal word order." },
    ],
  }),
  p({
    id: 'infinitive-end',
    title: 'Infinitive at the end',
    category: 'grammar',
    rule: "With willen, kunnen, moeten, mogen, gaan, zullen the second verb (infinitive) goes to the end: 'Ik wil een fiets kopen.'",
    explanation:
      "Dutch builds a 'bracket' around the middle of the sentence: the conjugated verb in second place, the infinitive at the end. Everything else (objects, times, places) sits in between: 'Mag ik een koffie?' / 'Ik ga morgen boodschappen doen.'",
    examples: [
      { wrong: 'Ik wil kopen een fiets.', right: 'Ik wil een fiets kopen.' },
      { wrong: 'Mag ik hebben een koffie?', right: 'Mag ik een koffie?' },
    ],
    drills: [
      { id: 'drill.inf.1', type: 'order', patternId: 'infinitive-end', en: 'I want to buy a bike.', words: ['Ik', 'wil', 'een', 'fiets', 'kopen'] },
      { id: 'drill.inf.2', type: 'translate', patternId: 'infinitive-end', prompt: 'Can I pay by card?', accept: ['Kan ik pinnen', 'Kan ik met de pinpas betalen', 'Kan ik met pin betalen', 'Kan ik met mijn pinpas betalen', 'Kan ik met de kaart betalen'] },
      { id: 'drill.inf.3', type: 'order', patternId: 'infinitive-end', en: 'We are going to visit my mother tomorrow.', words: ['We', 'gaan', 'morgen', 'mijn', 'moeder', 'bezoeken'] },
    ],
  }),
  p({
    id: 'separable-verbs',
    title: 'Separable verbs',
    category: 'grammar',
    rule: "Verbs like opbellen, opstaan and meegaan split in a main clause: the prefix goes to the end. 'Ik sta om zeven uur op.'",
    explanation:
      "Many Dutch verbs have a stressed prefix (op-, aan-, mee-, uit-, af-, terug-…). In a main clause in the present or past tense the prefix separates and goes to the end: 'Ik bel je morgen op.' In subordinate clauses and in the infinitive they stay together: '…omdat ik vroeg opsta.'",
    examples: [
      { wrong: 'Ik opsta om zeven uur.', right: 'Ik sta om zeven uur op.' },
      { wrong: 'Ik opbel je morgen.', right: 'Ik bel je morgen op.' },
    ],
    drills: [
      { id: 'drill.sep.1', type: 'order', patternId: 'separable-verbs', en: 'I get up at seven.', words: ['Ik', 'sta', 'om', 'zeven', 'uur', 'op'] },
      { id: 'drill.sep.2', type: 'translate', patternId: 'separable-verbs', prompt: 'Are you coming along?', accept: ['Ga je mee', 'Ga jij mee', 'Kom je mee', 'Kom jij mee'] },
      { id: 'drill.sep.3', type: 'fill', patternId: 'separable-verbs', sentence: 'Ik bel je morgen ___.', en: "I'll call you tomorrow.", accept: ['op'] },
    ],
  }),
  p({
    id: 'perfect-zijn',
    title: 'Perfect tense with zijn',
    category: 'grammar',
    rule: "Verbs of movement to a place or change of state use zijn: 'Ik ben naar huis gegaan', 'Hij is gekomen', 'Ik ben geweest'.",
    explanation:
      "Most verbs form the perfect with hebben, but verbs that express a change of place or state (gaan, komen, vertrekken, blijven, worden, beginnen, verhuizen, sterven) — and 'zijn' itself — use zijn: 'Ik ben in Amsterdam geweest.'",
    examples: [
      { wrong: 'Ik heb naar huis gegaan.', right: 'Ik ben naar huis gegaan.' },
      { wrong: 'Wij hebben in Parijs geweest.', right: 'Wij zijn in Parijs geweest.' },
    ],
    drills: [
      { id: 'drill.pz.1', type: 'fill', patternId: 'perfect-zijn', sentence: 'Ik ___ gisteren naar de markt gegaan.', en: 'I went to the market yesterday.', accept: ['ben'] },
      { id: 'drill.pz.2', type: 'fill', patternId: 'perfect-zijn', sentence: 'Hoe laat ___ je gisteren thuisgekomen?', en: 'What time did you get home yesterday?', accept: ['ben'] },
      { id: 'drill.pz.3', type: 'translate', patternId: 'perfect-zijn', prompt: 'We have been to Belgium.', accept: ['We zijn in België geweest', 'Wij zijn in België geweest', 'We zijn naar België geweest', 'Wij zijn naar België geweest'] },
    ],
  }),
  p({
    id: 'perfect-hebben',
    title: 'Perfect tense with hebben',
    category: 'grammar',
    rule: "Activities without movement to a place use hebben: 'Ik heb gewerkt', 'We hebben gegeten'.",
    explanation:
      "Hebben is the default auxiliary. Learners who have just learned the zijn-rule sometimes overuse it: 'Ik ben gewerkt' sounds like a passive ('I was worked'). Say 'Ik heb gewerkt.'",
    examples: [
      { wrong: 'Ik ben gisteren lang gewerkt.', right: 'Ik heb gisteren lang gewerkt.' },
      { wrong: 'Wij zijn in een restaurant gegeten.', right: 'Wij hebben in een restaurant gegeten.' },
    ],
    drills: [
      { id: 'drill.ph.1', type: 'fill', patternId: 'perfect-hebben', sentence: 'We ___ gisteren pizza gegeten.', en: 'We ate pizza yesterday.', accept: ['hebben'] },
      { id: 'drill.ph.2', type: 'fill', patternId: 'perfect-hebben', sentence: '___ je goed geslapen?', en: 'Did you sleep well?', accept: ['Heb', 'heb'] },
    ],
  }),
  p({
    id: 'de-het',
    title: 'de or het',
    category: 'grammar',
    rule: "About two thirds of nouns are 'de'-words; 'het' has to be learned per word. All plurals and all people are 'de'. All diminutives (-je) are 'het'.",
    explanation:
      "There's no reliable rule for every noun, so learn each noun with its article ('het huis', 'de fiets'). Helpful rules: plurals are always 'de'; diminutives are always 'het' (het meisje, het kopje); words ending in -ing, -heid, -tie are 'de'; languages and verbs used as nouns are 'het' (het Nederlands, het eten).",
    examples: [
      { wrong: 'de huis', right: 'het huis' },
      { wrong: 'het fiets', right: 'de fiets' },
    ],
    drills: [
      { id: 'drill.dh.1', type: 'choose', patternId: 'de-het', prompt: '___ huis is groot.', options: ['De', 'Het'], answer: 1 },
      { id: 'drill.dh.2', type: 'choose', patternId: 'de-het', prompt: '___ fiets staat buiten.', options: ['De', 'Het'], answer: 0 },
      { id: 'drill.dh.3', type: 'choose', patternId: 'de-het', prompt: '___ weekend was gezellig.', options: ['De', 'Het'], answer: 1 },
      { id: 'drill.dh.4', type: 'choose', patternId: 'de-het', prompt: '___ afspraak is om drie uur.', options: ['De', 'Het'], answer: 0 },
      { id: 'drill.dh.5', type: 'choose', patternId: 'de-het', prompt: '___ meisje heet Lotte.', options: ['De', 'Het'], answer: 1, explanation: 'Diminutives (-je) are always het.' },
      { id: 'drill.dh.6', type: 'choose', patternId: 'de-het', prompt: '___ koffie is lekker.', options: ['De', 'Het'], answer: 0 },
    ],
  }),
  p({
    id: 'adjective-e',
    title: 'Adjective ending -e',
    category: 'grammar',
    rule: "Before a noun, adjectives get -e — except with a het-word after een/geen (or no article): 'een groot huis' but 'het grote huis', 'een grote fiets'.",
    explanation:
      "Add -e to an adjective in front of a noun in almost all cases: 'de mooie fiets', 'het mooie huis', 'mooie huizen'. The single exception: a singular het-word with een, geen, or no article — 'een mooi huis', 'geen groot probleem'. Spelling changes with -e: groot → grote, wit → witte, lief → lieve.",
    examples: [
      { wrong: 'een grote huis', right: 'een groot huis' },
      { wrong: 'de mooi fiets', right: 'de mooie fiets' },
    ],
    drills: [
      { id: 'drill.adj.1', type: 'fill', patternId: 'adjective-e', sentence: 'Ze woont in een ___ huis. (groot)', en: 'She lives in a big house.', accept: ['groot'] },
      { id: 'drill.adj.2', type: 'fill', patternId: 'adjective-e', sentence: 'Ik heb een ___ fiets gekocht. (nieuw)', en: 'I bought a new bike.', accept: ['nieuwe'] },
      { id: 'drill.adj.3', type: 'fill', patternId: 'adjective-e', sentence: 'Het ___ restaurant is dicht. (oud)', en: 'The old restaurant is closed.', accept: ['oude'] },
    ],
  }),
  p({
    id: 'geen-niet',
    title: 'geen vs niet',
    category: 'grammar',
    rule: "Use 'geen' to negate a noun with 'een' or without an article: 'Ik heb geen auto', not 'Ik heb niet een auto'. Use 'niet' for everything else.",
    explanation:
      "'Geen' = 'not a / not any'. It replaces 'een' or stands in front of a noun without article: 'Ik heb geen tijd', 'Dat is geen probleem'. 'Niet' negates verbs, adjectives, and nouns with de/het/mijn: 'Ik kom niet', 'Het is niet duur', 'Dat is niet mijn fiets'.",
    examples: [
      { wrong: 'Ik heb niet een auto.', right: 'Ik heb geen auto.' },
      { wrong: 'Ik heb niet tijd.', right: 'Ik heb geen tijd.' },
    ],
    drills: [
      { id: 'drill.gn.1', type: 'fill', patternId: 'geen-niet', sentence: 'Sorry, ik heb ___ tijd.', en: "Sorry, I don't have time.", accept: ['geen'] },
      { id: 'drill.gn.2', type: 'fill', patternId: 'geen-niet', sentence: 'Het is ___ duur.', en: "It isn't expensive.", accept: ['niet'] },
      { id: 'drill.gn.3', type: 'translate', patternId: 'geen-niet', prompt: "That's not a problem.", accept: ['Dat is geen probleem', 'Geen probleem'] },
    ],
  }),
  p({
    id: 'object-pronouns',
    title: 'Pronouns after prepositions',
    category: 'grammar',
    rule: "After a preposition use the object form: met mij, voor jou, bij hem, met ons, van haar.",
    explanation:
      "Subject pronouns (ik, jij, hij, wij) change after prepositions like met, voor, bij, van, naar, over: 'Hoe gaat het met jou?', 'Dit is voor hem', 'Kom je bij ons eten?'",
    examples: [
      { wrong: 'Hoe gaat het met jij?', right: 'Hoe gaat het met jou?' },
      { wrong: 'Dit cadeau is voor hij.', right: 'Dit cadeau is voor hem.' },
    ],
    drills: [
      { id: 'drill.op.1', type: 'fill', patternId: 'object-pronouns', sentence: 'En hoe gaat het met ___? (jij)', en: 'And how are you?', accept: ['jou'] },
      { id: 'drill.op.2', type: 'fill', patternId: 'object-pronouns', sentence: 'Wil je met ___ mee? (wij)', en: 'Do you want to come with us?', accept: ['ons'] },
    ],
  }),
  p({
    id: 'subject-verb-agreement',
    title: 'Verb forms of hebben and zijn',
    category: 'grammar',
    rule: 'ik ben / heb · jij bent / hebt · hij is / heeft · wij, jullie, zij zijn / hebben.',
    explanation:
      "Zijn and hebben are irregular and very frequent, so small slips are common: 'ik heb' (not 'ik heeft'), 'hij heeft' (not 'hij heb'), 'jij bent', 'wij zijn'. When jij comes after the verb, the -t drops: 'Ben jij…?', 'Heb jij…?'",
    examples: [
      { wrong: 'Ik heeft een broer.', right: 'Ik heb een broer.' },
      { wrong: 'Jij ben erg aardig.', right: 'Jij bent erg aardig.' },
    ],
    drills: [
      { id: 'drill.sva.1', type: 'fill', patternId: 'subject-verb-agreement', sentence: 'Hij ___ twee kinderen.', en: 'He has two children.', accept: ['heeft'] },
      { id: 'drill.sva.2', type: 'fill', patternId: 'subject-verb-agreement', sentence: 'Jullie ___ welkom!', en: 'You are welcome! (plural)', accept: ['zijn'] },
      { id: 'drill.sva.3', type: 'fill', patternId: 'subject-verb-agreement', sentence: 'Ik ___ een beetje moe.', en: "I'm a bit tired.", accept: ['ben'] },
    ],
  }),
  p({
    id: 'jij-inversion-t',
    title: 'Drop the -t before jij/je',
    category: 'grammar',
    rule: "When jij/je comes after the verb, drop the -t: 'Werk jij hier?', 'Waar woon je?' (but: 'Werkt u hier?').",
    explanation:
      "In questions and inverted sentences the jij-form loses its -t: 'jij werkt' → 'werk jij?', 'jij woont' → 'waar woon je?'. This only happens with jij/je, not with u or hij.",
    examples: [
      { wrong: 'Waar woont jij?', right: 'Waar woon jij?' },
      { wrong: 'Werkt je hier?', right: 'Werk je hier?' },
    ],
    drills: [
      { id: 'drill.jt.1', type: 'fill', patternId: 'jij-inversion-t', sentence: 'Waar ___ je? (wonen)', en: 'Where do you live?', accept: ['woon'] },
      { id: 'drill.jt.2', type: 'fill', patternId: 'jij-inversion-t', sentence: '___ jij Nederlands? (spreken)', en: 'Do you speak Dutch?', accept: ['Spreek', 'spreek'] },
    ],
  }),
  p({
    id: 'heten',
    title: 'Saying your name: ik heet',
    category: 'vocabulary',
    rule: "'Ik heet…' (from heten, to be called) or 'Ik ben…' — not 'Ik ben heet' or 'Mijn naam heet'.",
    explanation:
      "'Heet' is also an adjective meaning 'hot' (temperature — and yes, sometimes the cheeky meaning too). So 'Ik ben heet' means 'I am hot'. To give your name, use the verb heten: 'Ik heet Amira', or simply 'Ik ben Amira'. 'Mijn naam is Amira' is correct but more formal.",
    examples: [
      { wrong: 'Ik ben heet Amira.', right: 'Ik heet Amira.' },
      { wrong: 'Mijn naam heet Tom.', right: 'Mijn naam is Tom. / Ik heet Tom.' },
    ],
    drills: [
      { id: 'drill.ht.1', type: 'translate', patternId: 'heten', prompt: 'My name is Sam.', accept: ['Ik heet Sam', 'Ik ben Sam', 'Mijn naam is Sam'] },
      { id: 'drill.ht.2', type: 'translate', patternId: 'heten', prompt: 'What is your name? (informal)', accept: ['Hoe heet je', 'Hoe heet jij', 'Wat is je naam', 'Wat is jouw naam'] },
    ],
  }),
  p({
    id: 'age-zijn',
    title: 'Age: ik ben … jaar',
    category: 'vocabulary',
    rule: "In Dutch you ARE an age: 'Ik ben 20 (jaar oud)', not 'Ik heb 20 jaar'.",
    explanation:
      "Like English and German, Dutch uses 'zijn' for age: 'Ik ben dertig', 'Hoe oud ben je?'. 'Ik heb 20 jaar' is a calque from French/Spanish/Italian/Arabic and sounds like 'I have (a period of) 20 years'.",
    examples: [
      { wrong: 'Ik heb 20 jaar.', right: 'Ik ben 20 jaar.' },
      { wrong: 'Hoeveel jaar heb je?', right: 'Hoe oud ben je?' },
    ],
    drills: [
      { id: 'drill.age.1', type: 'translate', patternId: 'age-zijn', prompt: 'I am 25 years old.', accept: ['Ik ben 25 jaar', 'Ik ben 25 jaar oud', 'Ik ben 25', 'Ik ben vijfentwintig jaar', 'Ik ben vijfentwintig jaar oud', 'Ik ben vijfentwintig'] },
      { id: 'drill.age.2', type: 'translate', patternId: 'age-zijn', prompt: 'How old are you? (informal)', accept: ['Hoe oud ben je', 'Hoe oud ben jij'] },
    ],
  }),
  p({
    id: 'het-koud-warm',
    title: 'Ik heb het koud / warm',
    category: 'vocabulary',
    rule: "To say you feel cold or warm: 'Ik heb het koud', 'Ik heb het warm'.",
    explanation:
      "'Ik ben koud' describes your character (a cold person), and 'Ik ben warm' your body temperature as if you were an object. For how you feel, Dutch says 'Ik heb het koud/warm' — literally 'I have it cold'.",
    examples: [
      { wrong: 'Ik ben koud.', right: 'Ik heb het koud.' },
      { wrong: 'Ik heb warm.', right: 'Ik heb het warm.' },
    ],
    drills: [
      { id: 'drill.kw.1', type: 'translate', patternId: 'het-koud-warm', prompt: "I'm cold.", accept: ['Ik heb het koud'] },
      { id: 'drill.kw.2', type: 'translate', patternId: 'het-koud-warm', prompt: 'Are you warm? (informal)', accept: ['Heb je het warm', 'Heb jij het warm'] },
    ],
  }),
  p({
    id: 'honger-dorst',
    title: 'Ik heb honger / dorst',
    category: 'vocabulary',
    rule: "Hunger, thirst and sleepiness use hebben: 'Ik heb honger', 'Ik heb dorst', 'Ik heb slaap' (Flemish).",
    explanation:
      "'Honger' and 'dorst' are nouns, so you 'have' them: 'Ik heb honger'. 'Hongerig' and 'dorstig' exist but sound bookish in conversation.",
    examples: [
      { wrong: 'Ik ben honger.', right: 'Ik heb honger.' },
      { wrong: 'Ik ben dorstig.', right: 'Ik heb dorst.' },
    ],
    drills: [
      { id: 'drill.hd.1', type: 'translate', patternId: 'honger-dorst', prompt: "I'm hungry.", accept: ['Ik heb honger'] },
      { id: 'drill.hd.2', type: 'translate', patternId: 'honger-dorst', prompt: 'Are you thirsty? (informal)', accept: ['Heb je dorst', 'Heb jij dorst'] },
    ],
  }),
  p({
    id: 'duration-al',
    title: "Duration: 'al' + time",
    category: 'naturalness',
    rule: "For something that started in the past and still continues: 'Ik woon al twee jaar in Utrecht.' 'Sinds' needs a moment: 'sinds 2022', 'sinds maandag'.",
    explanation:
      "English says 'for two years', and learners often translate it as 'voor twee jaar' or 'sinds twee jaar'. For an ongoing situation Dutch uses 'al' + duration, with the verb in the present tense: 'Ik leer al drie maanden Nederlands.' 'Voor twee jaar' means a planned period ('I'm going for two years').",
    examples: [
      { wrong: 'Ik woon hier sinds twee jaar.', right: 'Ik woon hier al twee jaar.' },
      { wrong: 'Ik leer Nederlands voor drie maanden.', right: 'Ik leer al drie maanden Nederlands.' },
    ],
    drills: [
      { id: 'drill.dur.1', type: 'translate', patternId: 'duration-al', prompt: "I've been living in the Netherlands for two years.", accept: ['Ik woon al twee jaar in Nederland', 'Ik woon al 2 jaar in Nederland'] },
      { id: 'drill.dur.2', type: 'fill', patternId: 'duration-al', sentence: 'Ik werk hier ___ vijf maanden.', en: "I've been working here for five months.", accept: ['al'] },
    ],
  }),
  p({
    id: 'units-after-numbers',
    title: 'jaar, uur, euro after numbers',
    category: 'grammar',
    rule: "After a number, units like jaar, uur, euro, kilo and keer stay singular: 'twee jaar', 'drie uur', 'tien euro'.",
    explanation:
      "Units of measurement don't take the plural after a number: 'Ik ben twintig jaar', 'Het kost vijf euro', 'Twee kilo appels'. The plural 'jaren' is used without a number ('jarenlang', 'in de jaren tachtig').",
    examples: [
      { wrong: 'Ik ben twintig jaren oud.', right: 'Ik ben twintig jaar oud.' },
      { wrong: 'Het kost tien euros.', right: 'Het kost tien euro.' },
    ],
    drills: [
      { id: 'drill.units.1', type: 'translate', patternId: 'units-after-numbers', prompt: 'It costs three euros.', accept: ['Het kost drie euro', 'Het kost 3 euro', 'Dat kost drie euro', 'Dat kost 3 euro'] },
    ],
  }),
  p({
    id: 'nodig-hebben',
    title: 'Ik heb … nodig',
    category: 'grammar',
    rule: "'Nodig hebben' wraps around the object: 'Ik heb een pen nodig.'",
    explanation:
      "'Nodig' behaves like the end of the verb bracket, so the thing you need goes in the middle: 'Ik heb hulp nodig', 'Heb je nog iets nodig?'",
    examples: [{ wrong: 'Ik heb nodig een pen.', right: 'Ik heb een pen nodig.' }],
    drills: [
      { id: 'drill.nodig.1', type: 'order', patternId: 'nodig-hebben', en: 'I need a new phone.', words: ['Ik', 'heb', 'een', 'nieuwe', 'telefoon', 'nodig'] },
      { id: 'drill.nodig.2', type: 'translate', patternId: 'nodig-hebben', prompt: 'Do you need help? (informal)', accept: ['Heb je hulp nodig', 'Heb jij hulp nodig'] },
    ],
  }),
  p({
    id: 'ik-ben-goed',
    title: "Answering 'Hoe gaat het?'",
    category: 'naturalness',
    rule: "Answer with 'Goed!', 'Het gaat goed', 'Prima' or 'Gaat wel' — 'Ik ben goed' is an anglicism.",
    explanation:
      "'Hoe gaat het?' literally asks 'How goes it?', so the answer is about 'het': 'Het gaat goed, en met jou?' 'Ik ben goed' is understood but sounds translated — and 'Ik ben goed in…' means 'I'm good at…'.",
    examples: [{ wrong: 'Ik ben goed, en jij?', right: 'Goed, en met jou?' }],
    drills: [
      { id: 'drill.ibg.1', type: 'respond', patternId: 'ik-ben-goed', situation: "A colleague asks 'Hoe gaat het?' Answer naturally and ask back.", npc: { nl: 'Hoi! Hoe gaat het?', en: 'Hi! How are you?' }, intents: [{ id: 'answer', description: 'Say how it goes', anyOf: [['goed|prima|gaat wel|lekker|top|niet zo goed']] }, { id: 'ask-back', description: 'Ask back', anyOf: [['met jou|en jij|met u|en u']] }], modelAnswers: ['Goed, en met jou?', 'Prima hoor, en met jou?'] },
    ],
  }),
  p({
    id: 'anglicism',
    title: 'Anglicisms',
    category: 'naturalness',
    rule: 'Some English expressions are translated word for word and sound odd in Dutch.',
    explanation:
      "'Dat maakt (geen) zin' (makes sense) is common among young people but many Dutch speakers dislike it — 'Dat is logisch', 'Dat klopt' or 'Dat slaat nergens op' are safer. 'Een goede tijd hebben' → 'Het naar je zin hebben' or 'Het was heel leuk'.",
    examples: [
      { wrong: 'Dat maakt zin.', right: 'Dat is logisch. / Dat klopt.' },
      { wrong: 'Ik had een goede tijd.', right: 'Ik heb het naar mijn zin gehad.' },
    ],
    drills: [
      { id: 'drill.ang.1', type: 'choose', patternId: 'anglicism', prompt: "Most natural way to say 'That makes sense':", options: ['Dat maakt zin.', 'Dat is logisch.', 'Dat doet zin.'], answer: 1 },
    ],
  }),
  p({
    id: 'register-formal',
    title: 'u or je?',
    category: 'register',
    rule: "Use 'u' with officials, doctors, older strangers and in formal letters; 'je/jij' with friends, colleagues and people your age. When unsure, start with 'u' and follow their lead.",
    explanation:
      "The Netherlands is informal — many workplaces and shops use 'je'. But at the gemeente, with a doctor, a landlord you don't know, or an older person, 'u' is expected. In Flanders 'u' (and 'ge/gij' in speech) is used more widely. Switching when invited ('Zeg maar je!') is normal.",
    examples: [{ wrong: 'Kun je mij helpen? (to a civil servant)', right: 'Kunt u mij helpen?' }],
    drills: [
      { id: 'drill.reg.1', type: 'translate', patternId: 'register-formal', prompt: 'Can you help me? (formal)', accept: ['Kunt u mij helpen', 'Kunt u me helpen'] },
      { id: 'drill.reg.2', type: 'choose', patternId: 'register-formal', prompt: 'At the city hall desk you say:', options: ['Hoi, kun je me even helpen?', 'Goedemorgen, kunt u mij helpen?'], answer: 1 },
    ],
  }),
  p({
    id: 'word-choice',
    title: 'Word choice',
    category: 'vocabulary',
    rule: 'The word exists, but Dutch speakers would choose a different one here.',
    explanation:
      'False friends and near-synonyms: eventueel = possibly (not eventually → uiteindelijk), actueel = current (not actual → echt/werkelijk), bekomen ≠ become (→ worden), controleren = to check (not to control).',
    examples: [
      { wrong: 'Eventueel heb ik de baan gekregen.', right: 'Uiteindelijk heb ik de baan gekregen.' },
      { wrong: 'Ik ben interesse in muziek.', right: 'Ik heb interesse in muziek. / Ik ben geïnteresseerd in muziek.' },
    ],
    drills: [
      { id: 'drill.wc.1', type: 'choose', patternId: 'word-choice', prompt: "'Eventually I found a house.'", options: ['Eventueel vond ik een huis.', 'Uiteindelijk vond ik een huis.'], answer: 1 },
    ],
  }),
  p({
    id: 'spelling',
    title: 'Spelling',
    category: 'vocabulary',
    rule: 'Small spelling slips — usually vowel length (maan/man) or -d/-t endings.',
    explanation:
      "Dutch spelling follows sound rules: a long vowel is written double in a closed syllable ('maan') and single in an open one ('manen'). Verb endings: ik werk, jij/hij werkt; stems ending in -d keep it: ik vind, hij vindt.",
    examples: [{ wrong: 'Hij vind het leuk.', right: 'Hij vindt het leuk.' }],
    drills: [
      { id: 'drill.sp.1', type: 'fill', patternId: 'spelling', sentence: 'Hij ___ het leuk. (vinden)', en: 'He likes it.', accept: ['vindt'] },
    ],
  }),
  p({
    id: 'other',
    title: 'Other',
    category: 'grammar',
    rule: 'Mistakes that do not fit a recurring pattern.',
    explanation: 'One-off mistakes. If one keeps coming back, the tutor will give it its own pattern.',
    examples: [],
    drills: [],
  }),
  // Pronunciation patterns (fed by speech attempts; detail content lives in the sound modules).
  ...(
    [
      ['pron-g', 'Pronunciation: G sound'],
      ['pron-sch', 'Pronunciation: SCH'],
      ['pron-ui', 'Pronunciation: UI'],
      ['pron-eu', 'Pronunciation: EU'],
      ['pron-ij', 'Pronunciation: IJ / EI'],
      ['pron-ou', 'Pronunciation: OU / AU'],
      ['pron-oe', 'Pronunciation: OE'],
      ['pron-uu', 'Pronunciation: U / UU'],
      ['pron-r', 'Pronunciation: R'],
      ['pron-vowel-length', 'Pronunciation: short vs long vowels'],
      ['pron-w', 'Pronunciation: W'],
    ] as const
  ).map(([id, title]) =>
    p({
      id,
      title,
      category: 'pronunciation',
      rule: 'Practise with minimal pairs and shadowing in the Pronunciation Coach.',
      explanation:
        'Speech recognition had trouble with words containing this sound. Listen to the minimal pairs first, then record yourself.',
      examples: [],
      drills: [],
    }),
  ),
];

const BY_ID = new Map(MISTAKE_PATTERNS.map((pattern) => [pattern.id, pattern]));

export function getPattern(id: string): MistakePattern | undefined {
  return BY_ID.get(id);
}

export function patternTitle(id: string): string {
  return BY_ID.get(id)?.title ?? id;
}

/** Compact catalogue text for AI prompts (stable order → cache-friendly). */
export function patternCatalogForPrompt(): string {
  return MISTAKE_PATTERNS.filter((pattern) => pattern.category !== 'pronunciation')
    .map((pattern) => `- ${pattern.id} (${pattern.category}): ${pattern.rule}`)
    .join('\n');
}
