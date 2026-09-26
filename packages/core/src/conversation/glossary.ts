import type { GlossaryItem } from '../schemas/conversation.js';
import { foldText } from '../language/normalize.js';

/**
 * Everyday words and particles that textbooks under-teach. Used to gloss replies from the
 * offline engines and as a reference list for the AI prompt.
 */
export const COLLOQUIAL_GLOSSARY: GlossaryItem[] = [
  { term: 'gezellig', meaning: 'cosy, sociable, fun (with people)', note: 'The core Dutch social value: a warm, relaxed atmosphere. A party, a café or an evening can be gezellig.' },
  { term: 'lekker', meaning: 'tasty; nice, pleasant', note: "Not only food: 'lekker weer' (nice weather), 'lekker slapen' (sleep well), 'lekker bezig!' (you're doing great)." },
  { term: 'gewoon', meaning: 'just, simply; normal', note: "Softens or downplays: 'Ik ben gewoon moe' (I'm just tired). 'Doe gewoon' = act normal." },
  { term: 'eigenlijk', meaning: 'actually, really', note: "Very frequent, often softens an opinion: 'Eigenlijk heb ik geen zin.'" },
  { term: 'toch', meaning: 'right?; still, anyway', note: "At the end of a sentence it asks for agreement: 'Leuk, toch?' (Nice, right?)." },
  { term: 'hoor', meaning: '(reassuring particle)', note: "Makes a statement friendlier or reassuring: 'Nee hoor!' (Oh no, not at all!), 'Dat is goed hoor.'" },
  { term: 'hè', meaning: 'right?, huh', note: "Tag for agreement or shared feeling: 'Mooi weer, hè?'" },
  { term: 'even', meaning: 'just, for a moment', note: "Makes requests lighter: 'Mag ik even langs?' (Can I just get past?)." },
  { term: 'maar', meaning: '(encouraging particle)', note: "In instructions it invites: 'Kom maar binnen' (Do come in), 'Zeg het maar' (Go ahead, tell me)." },
  { term: 'wel', meaning: '(affirming/contrasting particle)', note: "'Ik kom wel' (I will come, don't worry). Often contrasts with a negative expectation." },
  { term: 'nou', meaning: 'well', note: "Starts a reaction: 'Nou, dat valt mee.' Also emphatic: 'Nou en?' (So what?)." },
  { term: 'balen', meaning: 'to be bummed', note: "'Balen!' / 'Wat balen' = what a bummer. 'Ik baal ervan' = I'm annoyed about it." },
  { term: 'doei', meaning: 'bye', note: 'Casual goodbye. Also: doeg, dag, later, tot zo.' },
  { term: 'hoe gaat-ie', meaning: "how's it going?", note: "Casual version of 'Hoe gaat het?'." },
  { term: 'borrel', meaning: 'after-work drinks with snacks', note: 'A social institution: drinks with bitterballen, often on Friday afternoon (de vrijdagmiddagborrel).' },
  { term: 'koffietje', meaning: 'a (little) coffee', note: "Diminutives make things sound friendly: 'Zullen we een koffietje doen?'" },
  { term: 'ff', meaning: 'even (just, quickly)', note: "Texting abbreviation: 'ff bellen?' = shall we quickly call?" },
  { term: 'idd', meaning: 'inderdaad (indeed)', note: 'Texting abbreviation.' },
  { term: 'mss', meaning: 'misschien (maybe)', note: 'Texting abbreviation.' },
  { term: 'gwn', meaning: 'gewoon (just)', note: 'Texting abbreviation.' },
  { term: 'top', meaning: 'great', note: "'Top!' = Great! Very common agreement." },
  { term: 'prima', meaning: 'fine, good', note: "'Prima!' is a friendly 'fine by me'." },
  { term: 'sowieso', meaning: 'definitely; anyway', note: "'Ik kom sowieso' = I'm coming for sure." },
  { term: 'zin hebben in', meaning: 'to feel like, look forward to', note: "'Ik heb zin in het weekend!' / 'Heb je zin om te komen?'" },
  { term: 'lekker bezig', meaning: "you're doing great", note: 'Encouragement, sometimes ironic.' },
  { term: 'joh', meaning: '(friendly address particle)', note: "'Welnee joh!' (Of course not!) — informal, between friends." },
  { term: 'trouwens', meaning: 'by the way', note: "'Trouwens, heb je dat gehoord?'" },
  { term: 'komt goed', meaning: "it'll be fine", note: "Reassurance: 'Geen stress, komt goed.'" },
  { term: 'amai', meaning: 'wow (Flemish)', note: 'Flemish exclamation of surprise.' },
  { term: 'allee', meaning: 'come on; well (Flemish)', note: "Flemish filler: 'Allee, we gaan!'" },
  { term: 'goesting', meaning: 'desire, appetite (Flemish)', note: "'Ik heb goesting in frietjes' = I feel like fries." },
  { term: 'plezant', meaning: 'fun, nice (Flemish)', note: "Flemish for 'leuk'." },
];

const BY_TERM = new Map(COLLOQUIAL_GLOSSARY.map((g) => [foldText(g.term), g]));

/** Glossary items for colloquial words in a Dutch text, in order of appearance. */
export function glossFor(text: string, limit = 4): GlossaryItem[] {
  const folded = ` ${foldText(text)} `;
  const found: { index: number; item: GlossaryItem }[] = [];
  for (const [term, item] of BY_TERM) {
    const index = folded.indexOf(` ${term} `);
    if (index >= 0) found.push({ index, item });
  }
  return found
    .sort((a, b) => a.index - b.index)
    .slice(0, limit)
    .map((f) => f.item);
}
