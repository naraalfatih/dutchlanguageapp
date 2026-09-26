import type { Intent } from '../schemas/content.js';
import { escapeRegExp, foldText } from './normalize.js';

/**
 * Compile one intent term. Syntax: `alt|alt|…`, each alternative a word or phrase
 * matched on word boundaries; a trailing `*` on the last word matches a prefix
 * (`afspra*` matches "afspraak", "afspraken").
 */
function compileTerm(term: string): RegExp {
  const alternatives = term
    .split('|')
    .map((alt) => foldText(alt.replace(/\*$/, '')) + (alt.trim().endsWith('*') ? '*' : ''))
    .filter((alt) => alt.length > 0)
    .map((alt) => {
      const prefix = alt.endsWith('*');
      const body = escapeRegExp(prefix ? alt.slice(0, -1) : alt).replace(/ /g, '\\s+');
      return prefix ? `${body}[\\p{L}\\d']*` : body;
    });
  return new RegExp(`(?:^|[^\\p{L}\\d'])(?:${alternatives.join('|')})(?=$|[^\\p{L}\\d'])`, 'u');
}

const cache = new Map<string, RegExp>();
function termRegex(term: string): RegExp {
  let regex = cache.get(term);
  if (!regex) {
    regex = compileTerm(term);
    cache.set(term, regex);
  }
  return regex;
}

export function termMatches(text: string, term: string): boolean {
  return termRegex(term).test(foldText(text));
}

export function intentSatisfied(text: string, intent: Intent): boolean {
  const folded = foldText(text);
  return intent.anyOf.some((group) => group.every((term) => termRegex(term).test(folded)));
}

export interface IntentResult {
  satisfied: Intent[];
  missing: Intent[];
  coverage: number;
}

export function matchIntents(text: string, intents: Intent[]): IntentResult {
  const satisfied: Intent[] = [];
  const missing: Intent[] = [];
  for (const intent of intents) {
    (intentSatisfied(text, intent) ? satisfied : missing).push(intent);
  }
  return { satisfied, missing, coverage: intents.length ? satisfied.length / intents.length : 1 };
}
