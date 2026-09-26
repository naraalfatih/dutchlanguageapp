/**
 * Offline AI-Tutor fallback: asks level-appropriate questions, corrects with the rule-based
 * detector, and keeps the conversation moving.
 */

import type { Bilingual, Level } from '../schemas/common.js';
import type { TurnResponse } from '../schemas/conversation.js';
import { detectMistakes } from '../language/detector.js';
import { countWords } from '../language/normalize.js';
import { glossFor } from './glossary.js';

type Band = 'beginner' | 'elementary' | 'intermediate' | 'advanced';

const BAND: Record<Level, Band> = {
  A0: 'beginner',
  A1: 'beginner',
  A2: 'elementary',
  B1: 'intermediate',
  B2: 'advanced',
  C1: 'advanced',
};

export const TUTOR_QUESTIONS: Record<Band, Bilingual[]> = {
  beginner: [
    { nl: 'Hoe heet je?', en: "What's your name?" },
    { nl: 'Waar kom je vandaan?', en: 'Where are you from?' },
    { nl: 'Waar woon je?', en: 'Where do you live?' },
    { nl: 'Wat doe je graag in je vrije tijd?', en: 'What do you like doing in your free time?' },
    { nl: 'Wat eet je graag als ontbijt?', en: 'What do you like to eat for breakfast?' },
    { nl: 'Heb je broers of zussen?', en: 'Do you have brothers or sisters?' },
    { nl: 'Hoe laat sta je meestal op?', en: 'What time do you usually get up?' },
    { nl: 'Wat ga je vanavond doen?', en: 'What are you going to do tonight?' },
  ],
  elementary: [
    { nl: 'Wat heb je afgelopen weekend gedaan?', en: 'What did you do last weekend?' },
    { nl: 'Hoe ziet een normale werkdag er voor jou uit?', en: 'What does a normal working day look like for you?' },
    { nl: 'Waarom leer je Nederlands?', en: 'Why are you learning Dutch?' },
    { nl: 'Wat is je favoriete plek in je stad?', en: 'What is your favourite place in your town?' },
    { nl: 'Wat ga je deze zomer doen?', en: 'What are you going to do this summer?' },
    { nl: 'Kook je vaak zelf? Wat maak je dan?', en: 'Do you often cook yourself? What do you make?' },
  ],
  intermediate: [
    { nl: 'Wat vind je van het Nederlandse weer, eerlijk gezegd?', en: 'What do you think of the Dutch weather, honestly?' },
    {
      nl: 'Wat is volgens jou het grootste verschil tussen Nederland en jouw land?',
      en: 'What do you think is the biggest difference between the Netherlands and your country?',
    },
    { nl: 'Vertel eens over een reis die je nooit zult vergeten.', en: "Tell me about a trip you'll never forget." },
    { nl: 'Wat vind je belangrijk in een baan?', en: 'What do you find important in a job?' },
    { nl: 'Hoe ziet jouw ideale weekend eruit?', en: 'What does your ideal weekend look like?' },
  ],
  advanced: [
    {
      nl: 'Nederlanders staan bekend om hun directheid. Hoe ervaar jij dat?',
      en: 'Dutch people are known for their directness. How do you experience that?',
    },
    {
      nl: 'Moet iedereen die in Nederland woont Nederlands leren? Waarom wel of niet?',
      en: 'Should everyone who lives in the Netherlands learn Dutch? Why or why not?',
    },
    {
      nl: 'Wat vind je van thuiswerken: een zegen of een vloek?',
      en: 'What do you think of working from home: a blessing or a curse?',
    },
    {
      nl: 'Welke Nederlandse gewoonte zou je graag meenemen naar je eigen land?',
      en: 'Which Dutch habit would you like to take back to your own country?',
    },
    { nl: 'Hoe kijk je aan tegen de woningnood in Nederland?', en: 'How do you view the housing shortage in the Netherlands?' },
  ],
};

const PRAISE: Bilingual[] = [
  { nl: 'Goed zo!', en: 'Well done!' },
  { nl: 'Mooi gezegd!', en: 'Nicely put!' },
  { nl: 'Heel goed.', en: 'Very good.' },
];

const GENTLE: Bilingual[] = [
  { nl: 'Ik begrijp je! Kijk even naar de tip hieronder.', en: 'I understand you! Have a look at the tip below.' },
  { nl: 'Duidelijk! Eén klein puntje, zie hieronder.', en: 'Clear! One small point, see below.' },
];

export function tutorOpening(level: Level, topic?: string): TurnResponse {
  const first = TUTOR_QUESTIONS[BAND[level]][0]!;
  const intro =
    BAND[level] === 'beginner'
      ? {
          nl: `Hallo! Ik ben je taalcoach. We oefenen samen. ${first.nl}`,
          en: `Hello! I'm your language coach. Let's practise together. ${first.en}`,
        }
      : {
          nl: `Hoi! Fijn dat je er bent. ${topic ? `We praten vandaag over: ${topic}. ` : ''}${first.nl}`,
          en: `Hi! Good to see you. ${topic ? `Today we'll talk about: ${topic}. ` : ''}${first.en}`,
        };
  return { reply: intro, feedback: null, glossary: [], task: null, source: 'offline', debrief: null };
}

export function tutorTurn(level: Level, text: string, turn: number): TurnResponse {
  const detection = detectMistakes(text);
  const questions = TUTOR_QUESTIONS[BAND[level]];
  const next = questions[(turn + 1) % questions.length]!;
  const ack = detection.corrections.length === 0 ? PRAISE[turn % PRAISE.length]! : GENTLE[turn % GENTLE.length]!;
  const words = countWords(text);
  const reply = { nl: `${ack.nl} ${next.nl}`, en: `${ack.en} ${next.en}` };
  const tooShort = words < 3 && BAND[level] !== 'beginner';
  return {
    reply,
    feedback: {
      understood: words > 0,
      corrections: detection.corrections,
      natural: tooShort
        ? {
            nl: 'Probeer een hele zin te maken.',
            en: 'Try to answer with a full sentence.',
            note: 'Longer answers build fluency — add a reason with "omdat" or "want".',
          }
        : null,
      praise: detection.corrections.length === 0 && words >= 5 ? 'Clear and correct.' : null,
    },
    glossary: glossFor(reply.nl),
    task: null,
    source: 'offline',
    debrief: null,
  };
}
