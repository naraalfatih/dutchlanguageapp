/**
 * Offline "Dutch Friend Mode": a small topic-driven chat partner that speaks casual Dutch,
 * adapts to the learner's level and glosses colloquial words. The AI provider is the full
 * experience; this keeps the feature usable offline and for guests.
 */

import { LEVEL_VALUE, type Bilingual, type Level } from '../schemas/common.js';
import type { TurnResponse } from '../schemas/conversation.js';
import { detectMistakes } from '../language/detector.js';
import { termMatches } from '../language/intents.js';
import { foldText } from '../language/normalize.js';
import { glossFor } from './glossary.js';

export interface FriendPersonaLite {
  name: string;
  city: string;
  selfIntro: Bilingual;
}

interface Topic {
  id: string;
  terms: string[];
  simple: Bilingual[];
  natural: Bilingual[];
}

const TOPICS: Topic[] = [
  {
    id: 'bye',
    terms: ['doei|doeg|tot later|tot zo|tot morgen|tot snel|slaap lekker|welterusten|ik moet gaan|ik ga nu'],
    simple: [{ nl: 'Doei! Tot snel!', en: 'Bye! See you soon!' }],
    natural: [{ nl: 'Oké, doei! Leuk gekletst. Tot snel!', en: 'Okay, bye! Nice chatting. See you soon!' }],
  },
  {
    id: 'thanks',
    terms: ['dank|bedankt|thanks|merci|dankjewel'],
    simple: [{ nl: 'Graag gedaan!', en: "You're welcome!" }],
    natural: [{ nl: 'Graag gedaan hoor! Geen punt.', en: "You're welcome! No problem at all." }],
  },
  {
    id: 'how-are-you',
    terms: ['hoe gaat|alles goed|hoe is het|hoe gaat-ie'],
    simple: [
      {
        nl: 'Met mij gaat het goed, dank je! Ik ben een beetje moe. En met jou?',
        en: "I'm fine, thanks! I'm a bit tired. And you?",
      },
    ],
    natural: [
      {
        nl: 'Goed hoor! Beetje druk met werk, maar verder prima. En met jou?',
        en: 'Good! A bit busy with work, but otherwise fine. And you?',
      },
    ],
  },
  {
    id: 'greeting',
    terms: ['hoi|hallo|hey|hee|hi|goedemorgen|goedemiddag|goedenavond|hoihoi'],
    simple: [{ nl: 'Hoi! Leuk dat je er bent. Hoe gaat het met je?', en: "Hi! Nice that you're here. How are you?" }],
    natural: [{ nl: 'Hé, hoi! Hoe gaat-ie? Alles goed?', en: "Hey, hi! How's it going? All good?" }],
  },
  {
    id: 'feeling-bad',
    terms: ['moe|druk|ziek|slecht|niet zo goed|stress|verkouden|hoofdpijn'],
    simple: [{ nl: 'Oh, jammer! Neem vanavond rust, oké?', en: "Oh, that's a pity! Take it easy tonight, okay?" }],
    natural: [
      {
        nl: 'Ah, balen! Doe vanavond gewoon lekker rustig aan, hè. Wat is er aan de hand?',
        en: "Ah, what a bummer! Just take it easy tonight, okay? What's going on?",
      },
    ],
  },
  {
    id: 'feeling-good',
    terms: ['goed|prima|top|super|fijn|blij|uitstekend'],
    simple: [{ nl: 'Fijn! Wat doe je vandaag?', en: 'Nice! What are you doing today?' }],
    natural: [
      {
        nl: 'Top, fijn om te horen! Wat heb je vandaag allemaal gedaan?',
        en: 'Great, good to hear! What did you get up to today?',
      },
    ],
  },
  {
    id: 'plans',
    terms: ['afspreken|koffie|borrel|zin in|zin om|biertje|terras|samen|langskomen'],
    simple: [{ nl: 'Ja, leuk! Zullen we zaterdag koffie drinken?', en: 'Yes, nice! Shall we have coffee on Saturday?' }],
    natural: [
      {
        nl: 'Ja, gezellig! Zullen we volgende week een koffietje doen? Ik kan dinsdag of donderdag.',
        en: 'Yes, lovely! Shall we grab a coffee next week? I can do Tuesday or Thursday.',
      },
    ],
  },
  {
    id: 'weekend',
    terms: ['weekend|zaterdag|zondag|vrije dag|vrij'],
    simple: [
      {
        nl: 'Leuk! In het weekend ga ik naar de markt. Wat doe jij in het weekend?',
        en: 'Nice! At the weekend I go to the market. What do you do at the weekend?',
      },
    ],
    natural: [
      {
        nl: "Ik ga zaterdag naar de markt en 's avonds heb ik een borrel met vrienden. Heb jij al plannen?",
        en: 'On Saturday I’m going to the market and in the evening I have drinks with friends. Do you have plans yet?',
      },
    ],
  },
  {
    id: 'work',
    terms: ['werk|baan|kantoor|collega*|werken|job|baas|vergadering'],
    simple: [{ nl: 'Interessant! Wat voor werk doe je?', en: 'Interesting! What kind of work do you do?' }],
    natural: [
      {
        nl: 'O, interessant! Wat doe je eigenlijk precies voor werk? En vind je het leuk?',
        en: 'Oh, interesting! What exactly do you do for work? And do you like it?',
      },
    ],
  },
  {
    id: 'study',
    terms: ['studie|studeer|school|universiteit|cursus|les|leren|tentamen|examen'],
    simple: [{ nl: 'Goed zo! Wat studeer je?', en: 'Good for you! What are you studying?' }],
    natural: [
      {
        nl: 'Knap hoor! Is het veel werk? Ik vond mijn studie vroeger best pittig.',
        en: 'Impressive! Is it a lot of work? I found my studies quite tough back then.',
      },
    ],
  },
  {
    id: 'food',
    terms: ['eten|koken|lekker|restaurant|pizza|stamppot|kaas|brood|bitterbal*|honger|friet*|patat|ontbijt|lunch'],
    simple: [
      { nl: 'Lekker! Ik eet graag stamppot. Wat eet jij graag?', en: 'Tasty! I like eating stamppot. What do you like to eat?' },
    ],
    natural: [
      {
        nl: 'Mmm, lekker! Heb je trouwens al eens bitterballen geprobeerd? Die moet je echt proeven bij een borrel.',
        en: 'Mmm, tasty! By the way, have you tried bitterballen yet? You really have to taste them at drinks.',
      },
    ],
  },
  {
    id: 'hobby',
    terms: ['sport|voetbal|hardlopen|fietsen|fiets|muziek|lezen|boek*|film*|serie*|gamen|zwemmen|wandelen|hobby|tekenen|gitaar'],
    simple: [
      {
        nl: 'Leuk! Ik fiets graag. Wat doe je graag in je vrije tijd?',
        en: 'Nice! I like cycling. What do you like to do in your free time?',
      },
    ],
    natural: [
      {
        nl: 'O, gaaf! Ik ben zelf echt fan van fietsen, lekker langs het water. Hoe vaak doe je dat?',
        en: "Oh, cool! I'm a big fan of cycling myself, nice along the water. How often do you do that?",
      },
    ],
  },
  {
    id: 'weather',
    terms: ['weer|regen|regent|zon|zonnig|koud|warm|wind|sneeuw'],
    simple: [
      {
        nl: 'Ja, het regent veel in Nederland! Ik neem altijd een jas mee.',
        en: 'Yes, it rains a lot in the Netherlands! I always bring a coat.',
      },
    ],
    natural: [
      {
        nl: 'Haha, typisch Nederlands weer, hè? Vier seizoenen op één dag. Gelukkig heb ik een goede regenjas.',
        en: 'Haha, typical Dutch weather, right? Four seasons in one day. Luckily I have a good raincoat.',
      },
    ],
  },
  {
    id: 'country',
    terms: ['nederland*|holland|amsterdam|utrecht|rotterdam|den haag|belgie|vlaanderen|vlaams|gent|antwerpen|leuven|brussel'],
    simple: [{ nl: 'Leuk! Wat vind je van Nederland?', en: 'Nice! What do you think of the Netherlands?' }],
    natural: [
      {
        nl: 'O leuk! Wat vind je tot nu toe het leukst — en wat vind je echt raar aan Nederlanders?',
        en: 'Oh nice! What do you like most so far — and what do you find really weird about Dutch people?',
      },
    ],
  },
];

const FALLBACK: { simple: Bilingual[]; natural: Bilingual[] } = {
  simple: [
    { nl: 'Oké! Vertel eens meer.', en: 'Okay! Tell me more.' },
    { nl: 'Echt? Leuk!', en: 'Really? Nice!' },
    { nl: 'Ik begrijp het. En wat vind jij ervan?', en: 'I see. And what do you think of it?' },
  ],
  natural: [
    { nl: 'Echt? Vertel!', en: 'Really? Tell me!' },
    { nl: 'Haha, nice. En hoe ging dat verder?', en: 'Haha, nice. And what happened next?' },
    { nl: 'O ja? Hoe bedoel je precies?', en: 'Oh yeah? What exactly do you mean?' },
  ],
};

/** Textbook phrasings with the natural alternative a Dutch friend would use. */
const NATURAL_SWAPS: { terms: string; nl: string; en: string; note: string }[] = [
  {
    terms: 'hoe gaat het met jou',
    nl: 'Hoe gaat-ie?',
    en: "How's it going?",
    note: 'Between friends this short version is very common. (Your version is correct too!)',
  },
  {
    terms: 'dat is heel leuk|dat is erg leuk|dat is zeer leuk',
    nl: 'Wat leuk!',
    en: 'How nice!',
    note: "'Wat leuk!' is the go-to reaction in everyday Dutch.",
  },
  {
    terms: 'tot ziens',
    nl: 'Doei! / Tot snel!',
    en: 'Bye! / See you soon!',
    note: "'Tot ziens' is polite and fine, but with friends 'doei' or 'tot snel' sounds warmer.",
  },
  { terms: 'dat is jammer', nl: 'Balen!', en: 'Bummer!', note: "'Balen!' is the casual way to sympathise." },
  { terms: 'dank u wel', nl: 'Dankjewel!', en: 'Thanks!', note: "With friends use 'je': 'dankjewel' or 'thanks'." },
  {
    terms: 'ja dat is correct|dat is correct',
    nl: 'Klopt!',
    en: "That's right!",
    note: "'Correct' sounds like an exam. Say 'Klopt!' or 'Precies!'.",
  },
  {
    terms: 'ik ben het eens',
    nl: 'Precies! / Ik ben het met je eens.',
    en: 'Exactly! / I agree with you.',
    note: "'Het eens zijn met iemand' needs 'met je'.",
  },
];

function variant(options: Bilingual[], turn: number): Bilingual {
  return options[turn % options.length]!;
}

export function friendOpening(
  persona: FriendPersonaLite,
  level: Level,
  openings: Partial<Record<Level, Bilingual>>,
): TurnResponse {
  const reply =
    openings[level] ??
    (LEVEL_VALUE[level] >= 3
      ? { nl: `Hé! Hoe gaat-ie? Ik ben ${persona.name}, trouwens.`, en: `Hey! How's it going? I'm ${persona.name}, by the way.` }
      : { nl: `Hoi! Ik ben ${persona.name}. Hoe gaat het?`, en: `Hi! I'm ${persona.name}. How are you?` });
  return { reply, feedback: null, glossary: glossFor(reply.nl), task: null, source: 'offline', debrief: null };
}

export function friendTurn(persona: FriendPersonaLite, level: Level, text: string, turn: number): TurnResponse {
  const natural = LEVEL_VALUE[level] >= 3;
  const folded = foldText(text);
  const askedAboutFriend =
    /\?\s*$/.test(text.trim()) && /(^| )(jij|jou|jouw|je)( |$)/.test(folded) && !termMatches(text, 'hoe gaat|alles goed');
  const topic = TOPICS.find((t) => t.terms.some((term) => termMatches(text, term)));

  let reply: Bilingual;
  if (askedAboutFriend && (!topic || ['greeting', 'feeling-good'].includes(topic.id))) {
    reply = {
      nl: `Ik? ${persona.selfIntro.nl} En jij?`,
      en: `Me? ${persona.selfIntro.en} And you?`,
    };
  } else if (topic) {
    reply = variant(natural ? topic.natural : topic.simple, turn);
  } else {
    reply = variant(natural ? FALLBACK.natural : FALLBACK.simple, turn);
  }

  const detection = detectMistakes(text, { register: 'informal' });
  const swap = NATURAL_SWAPS.find((s) => termMatches(text, s.terms));
  const words = folded.split(' ').filter(Boolean).length;

  return {
    reply,
    feedback: {
      understood: true,
      corrections: detection.corrections,
      natural: swap && detection.corrections.length === 0 ? { nl: swap.nl, en: swap.en, note: swap.note } : null,
      praise:
        detection.corrections.length === 0 && words >= 6
          ? 'Nice and natural!'
          : detection.corrections.length === 0 && words > 0
            ? 'Clear!'
            : null,
    },
    glossary: glossFor(reply.nl),
    task: null,
    source: 'offline',
    debrief: null,
  };
}
