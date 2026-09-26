/**
 * Rule-based detector for the most frequent learner mistakes in Dutch.
 *
 * Design goals: high precision (a wrong correction is worse than a missed one), kind
 * explanations, and a stable `patternId` for each finding so the Mistake Diary can track it.
 * Runs offline on the device and on the server; the AI tutor complements it.
 */

import type { MistakeCategory, Register } from '../schemas/common.js';
import type { Correction, Severity } from '../schemas/conversation.js';
import {
  adjectiveForms,
  FINITE_VERBS,
  HEBBEN_PARTICIPLES,
  INFINITIVES,
  isDiminutive,
  JIJ_INVERSION,
  nounGender,
  SEPARABLE_UNSPLIT,
  ZIJN_PARTICIPLES,
} from './lexicon.js';
import { matchCase, splitSentences, stripDiacritics } from './normalize.js';

export interface DetectOptions {
  /** Expected register of the situation. `formal` flags je/jij; `informal` notes u. */
  register?: Register;
}

export interface Detection {
  corrections: Correction[];
  /** The whole text with every non-overlapping fix applied. */
  correctedText: string;
  sentences: number;
}

interface Token {
  text: string;
  /** Lower-case, diacritics removed. */
  lower: string;
  start: number;
  end: number;
}

interface Finding {
  start: number;
  end: number;
  replacement: string;
  patternId: string;
  category: MistakeCategory;
  severity: Severity;
  explanation: string;
}

interface Ctx {
  sentence: string;
  tokens: Token[];
  options: DetectOptions;
}

const SUBJECTS = new Set(['ik', 'jij', 'je', 'hij', 'zij', 'ze', 'we', 'wij', 'jullie', 'u']);
const TOKEN_RE = /'[st](?![\p{L}\d])|[\p{L}\d]+(?:['’-][\p{L}\d]+)*/gu;
const CLAUSE_PUNCT = /[,;:.!?…]/;
const COORDINATORS = new Set(['en', 'maar', 'want', 'dus', 'of']);

function tokenizeSentence(sentence: string): Token[] {
  const tokens: Token[] = [];
  for (const match of sentence.matchAll(TOKEN_RE)) {
    const text = match[0];
    tokens.push({
      text,
      lower: stripDiacritics(text.toLowerCase().replace('’', "'")),
      start: match.index!,
      end: match.index! + text.length,
    });
  }
  return tokens;
}

/** Are tokens i and i+1 separated only by whitespace? */
function adjacent(ctx: Ctx, i: number): boolean {
  const a = ctx.tokens[i];
  const b = ctx.tokens[i + 1];
  if (!a || !b) return false;
  return /^\s+$/.test(ctx.sentence.slice(a.end, b.start));
}

/** Index of the last token in the clause that contains token `from`. */
function clauseEnd(ctx: Ctx, from: number): number {
  let last = from;
  for (let k = from + 1; k < ctx.tokens.length; k++) {
    const between = ctx.sentence.slice(ctx.tokens[k - 1]!.end, ctx.tokens[k]!.start);
    if (CLAUSE_PUNCT.test(between) || COORDINATORS.has(ctx.tokens[k]!.lower)) break;
    last = k;
  }
  return last;
}

function slice(ctx: Ctx, from: number, to: number): string {
  if (to < from) return '';
  return ctx.sentence.slice(ctx.tokens[from]!.start, ctx.tokens[to]!.end);
}

const finding = (f: Finding): Finding => f;

// ---------------------------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------------------------

function ruleHeten(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  for (let i = 0; i + 2 < tokens.length; i++) {
    if (tokens[i]!.lower === 'ik' && tokens[i + 1]!.lower === 'ben' && tokens[i + 2]!.lower === 'heet') {
      const hasName = i + 3 < tokens.length;
      if (hasName) {
        out.push(
          finding({
            start: tokens[i]!.start,
            end: tokens[i + 2]!.end,
            replacement: matchCase(tokens[i]!.text, 'ik heet'),
            patternId: 'heten',
            category: 'vocabulary',
            severity: 'meaning',
            explanation:
              "People understand you, but 'Ik ben heet' means 'I am hot (temperature)'. If you mean your name, say: 'Ik heet…' (from heten, to be called) — or simply 'Ik ben …'.",
          }),
        );
      } else {
        out.push(
          finding({
            start: tokens[i]!.start,
            end: tokens[i + 2]!.end,
            replacement: matchCase(tokens[i]!.text, 'ik heb het warm'),
            patternId: 'het-koud-warm',
            category: 'vocabulary',
            severity: 'meaning',
            explanation:
              "'Ik ben heet' sounds like 'I am hot' in the cheeky sense. If you feel hot, say 'Ik heb het warm'. If you wanted to give your name: 'Ik heet …'.",
          }),
        );
      }
    }
    if (tokens[i]!.lower === 'mijn' && tokens[i + 1]!.lower === 'naam' && tokens[i + 2]!.lower === 'heet') {
      out.push(
        finding({
          start: tokens[i]!.start,
          end: tokens[i + 2]!.end,
          replacement: matchCase(tokens[i]!.text, 'mijn naam is'),
          patternId: 'heten',
          category: 'vocabulary',
          severity: 'grammar',
          explanation:
            "A name doesn't 'heet' — a person does. Say 'Mijn naam is …' or, more naturally, 'Ik heet …'.",
        }),
      );
    }
  }
  return out;
}

const TO_ZIJN: Record<string, string> = { heb: 'ben', hebt: 'bent', heeft: 'is', hebben: 'zijn' };
const TO_HEBBEN: Record<string, string> = { ben: 'heb', bent: 'hebt', is: 'heeft', zijn: 'hebben' };

function isNumberToken(lower: string): boolean {
  return /^(\d+|(?:(?:een|twee|drie|vier|vijf|zes|zeven|acht|negen)en)?(?:twintig|dertig|veertig|vijftig|zestig|zeventig|tachtig|negentig)|een|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf|dertien|veertien|vijftien|zestien|zeventien|achttien|negentien|honderd|duizend)$/.test(
    lower,
  );
}

function ruleAge(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  for (let i = 0; i + 3 < tokens.length; i++) {
    const [s, v, n, j] = [tokens[i]!, tokens[i + 1]!, tokens[i + 2]!, tokens[i + 3]!];
    if (SUBJECTS.has(s.lower) && TO_ZIJN[v.lower] && isNumberToken(n.lower) && j.lower === 'jaar') {
      out.push(
        finding({
          start: v.start,
          end: v.end,
          replacement: TO_ZIJN[v.lower]!,
          patternId: 'age-zijn',
          category: 'vocabulary',
          severity: 'grammar',
          explanation: `In Dutch you *are* an age: '${s.text} ${TO_ZIJN[v.lower]} ${n.text} jaar'. 'Hebben' + years sounds like 'having a period of ${n.text} years'.`,
        }),
      );
    }
  }
  for (let i = 0; i + 3 < tokens.length; i++) {
    const [h, j, v, s] = [tokens[i]!, tokens[i + 1]!, tokens[i + 2]!, tokens[i + 3]!];
    if (h.lower === 'hoeveel' && j.lower === 'jaar' && TO_ZIJN[v.lower] && SUBJECTS.has(s.lower)) {
      out.push(
        finding({
          start: h.start,
          end: s.end,
          replacement: `${matchCase(h.text, 'hoe oud')} ${TO_ZIJN[v.lower]} ${s.text}`,
          patternId: 'age-zijn',
          category: 'vocabulary',
          severity: 'grammar',
          explanation: "To ask someone's age, say 'Hoe oud ben je?' (literally 'How old are you?').",
        }),
      );
    }
  }
  return out;
}

function ruleColdWarm(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  const temperature = new Set(['koud', 'warm']);
  for (let i = 0; i + 2 < tokens.length; i++) {
    const [a, b, c] = [tokens[i]!, tokens[i + 1]!, tokens[i + 2]!];
    // ik ben koud → ik heb het koud
    if (SUBJECTS.has(a.lower) && TO_HEBBEN[b.lower] && temperature.has(c.lower)) {
      out.push(
        finding({
          start: b.start,
          end: c.end,
          replacement: `${TO_HEBBEN[b.lower]} het ${c.text}`,
          patternId: 'het-koud-warm',
          category: 'vocabulary',
          severity: 'meaning',
          explanation: `'${a.text} ${b.text} ${c.text}' describes what someone is like (a ${c.lower === 'koud' ? 'cold' : 'warm'} person). For how you feel, Dutch says '${TO_HEBBEN[b.lower]} het ${c.text}'.`,
        }),
      );
    }
    // ben je koud? → heb je het koud?
    if (TO_HEBBEN[a.lower] && SUBJECTS.has(b.lower) && temperature.has(c.lower) && i === 0) {
      out.push(
        finding({
          start: a.start,
          end: c.end,
          replacement: `${matchCase(a.text, TO_HEBBEN[a.lower]!)} ${b.text} het ${c.text}`,
          patternId: 'het-koud-warm',
          category: 'vocabulary',
          severity: 'meaning',
          explanation: `To ask how someone feels: '${capitalizeWord(TO_HEBBEN[a.lower]!)} ${b.text} het ${c.text}?'`,
        }),
      );
    }
    // ik heb koud → ik heb het koud
    if (SUBJECTS.has(a.lower) && TO_ZIJN[b.lower] && temperature.has(c.lower)) {
      out.push(
        finding({
          start: b.start,
          end: c.end,
          replacement: `${b.text} het ${c.text}`,
          patternId: 'het-koud-warm',
          category: 'vocabulary',
          severity: 'grammar',
          explanation: `Dutch needs 'het' here: '${a.text} ${b.text} het ${c.text}'.`,
        }),
      );
    }
  }
  return out;
}

function capitalizeWord(word: string): string {
  return word ? word[0]!.toUpperCase() + word.slice(1) : word;
}

function ruleHungerThirst(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  const nouns: Record<string, string> = { honger: 'honger', dorst: 'dorst', hongerig: 'honger', dorstig: 'dorst' };
  const intensifiers = new Set(['erg', 'heel', 'zo', 'echt', 'wel', 'een', 'beetje']);
  for (let i = 0; i + 1 < tokens.length; i++) {
    const verb = tokens[i]!;
    if (!TO_HEBBEN[verb.lower]) continue;
    const before = tokens[i - 1];
    const after = tokens[i + 1]!;
    const subjectBefore = before && SUBJECTS.has(before.lower);
    const subjectAfter = SUBJECTS.has(after.lower);
    if (!subjectBefore && !subjectAfter) continue;
    let k = subjectAfter ? i + 2 : i + 1;
    while (k < tokens.length && intensifiers.has(tokens[k]!.lower)) k++;
    const target = tokens[k];
    if (!target || !nouns[target.lower]) continue;
    const bookish = target.lower.endsWith('ig');
    out.push(
      finding({
        start: verb.start,
        end: target.end,
        replacement:
          matchCase(verb.text, TO_HEBBEN[verb.lower]!) +
          ctx.sentence.slice(verb.end, target.start) +
          nouns[target.lower],
        patternId: 'honger-dorst',
        category: bookish ? 'naturalness' : 'vocabulary',
        severity: bookish ? 'naturalness' : 'grammar',
        explanation: bookish
          ? `'${target.text}' exists but sounds bookish. In conversation Dutch people say 'Ik heb ${nouns[target.lower]}'.`
          : `'${capitalizeWord(nouns[target.lower]!)}' is a noun, so you *have* it: 'Ik heb ${nouns[target.lower]}'.`,
      }),
    );
  }
  return out;
}

const FRONTED_SINGLE = new Set(
  `morgen vandaag gisteren straks daarna dan soms vaak altijd nooit meestal eerst later vanavond
   vanmiddag vanochtend vanmorgen vannacht overmorgen eergisteren hier daar gelukkig misschien
   natuurlijk eigenlijk helaas binnenkort vroeger tegenwoordig maandag dinsdag woensdag donderdag
   vrijdag zaterdag zondag`
    .split(/\s+/)
    .filter(Boolean),
);
const FRONTED_PREPOSITIONS = new Set(['in', 'op', 'om', 'na', 'tijdens', 'bij', 'elke', 'iedere', 'volgende', 'vorige', 'deze', 'dit', "'s"]);
const NOT_A_VERB = new Set(['niet', 'ook', 'al', 'nog', 'graag', 'heel', 'erg', 'echt', 'wel', 'zeker', 'gewoon', 'even', 'toch', 'maar', 'dus', 'alleen', 'zelf', 'weer']);

function jijForm(verb: Token, subject: Token): string {
  if (subject.lower === 'jij' || subject.lower === 'je') {
    const stem = JIJ_INVERSION.get(verb.lower);
    if (stem) return stem;
  }
  return verb.text.toLowerCase();
}

function ruleWordOrderV2(ctx: Ctx): Finding[] {
  const { tokens } = ctx;
  if (tokens.length < 3) return [];
  // Find the fronted element: a single adverb, or a short prepositional/time phrase.
  let subjectIndex = -1;
  if (FRONTED_SINGLE.has(tokens[0]!.lower) && SUBJECTS.has(tokens[1]!.lower)) {
    subjectIndex = 1;
  } else if (FRONTED_PREPOSITIONS.has(tokens[0]!.lower)) {
    for (let k = 1; k <= 4 && k < tokens.length - 1; k++) {
      const between = ctx.sentence.slice(tokens[k - 1]!.end, tokens[k]!.start);
      if (CLAUSE_PUNCT.test(between) && !between.includes(',')) break;
      const word = tokens[k]!.lower;
      if (SUBJECTS.has(word) && FINITE_VERBS.has(tokens[k + 1]!.lower)) {
        subjectIndex = k;
        break;
      }
      // The fronted phrase itself must not contain a verb or a clause-starting word.
      if (FINITE_VERBS.has(word) || QUESTION_WORDS.has(word) || SUBORDINATORS.has(word) || COORDINATORS.has(word)) break;
    }
  }
  if (subjectIndex < 1) return [];
  const subject = tokens[subjectIndex]!;
  const verb = tokens[subjectIndex + 1];
  if (!verb || NOT_A_VERB.has(verb.lower) || !/^[\p{L}]+$/u.test(verb.text)) return [];
  if (subjectIndex > 1 && !FINITE_VERBS.has(verb.lower)) return [];
  // "Toen/Nu ik …," can be a subordinate clause; those words are excluded above.
  const fronted = ctx.sentence.slice(tokens[0]!.start, tokens[subjectIndex - 1]!.end);
  const verbForm = jijForm(verb, subject);
  return [
    finding({
      start: subject.start,
      end: verb.end,
      replacement: `${verbForm} ${subject.text.toLowerCase()}`,
      patternId: 'word-order-v2',
      category: 'grammar',
      severity: 'grammar',
      explanation: `When a sentence starts with '${fronted}', the verb comes second and the subject follows it: '${fronted} ${verbForm} ${subject.text.toLowerCase()} …'.`,
    }),
  ];
}

const SUBORDINATORS = new Set(['omdat', 'dat', 'als', 'wanneer', 'terwijl', 'hoewel', 'zodat', 'voordat', 'nadat', 'totdat', 'zodra', 'toen', 'of', 'sinds']);
const PARTICLES = new Set(['op', 'aan', 'mee', 'uit', 'af', 'terug', 'weg', 'in', 'door', 'langs', 'thuis']);

function looksLikeVerbForm(lower: string): boolean {
  return INFINITIVES.has(lower) || /^ge\p{L}+(d|t|en)$/u.test(lower) || FINITE_VERBS.has(lower);
}

function ruleVerbFinal(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  for (let i = 0; i + 3 < tokens.length; i++) {
    const conj = tokens[i]!;
    if (!SUBORDINATORS.has(conj.lower)) continue;
    // 'of' and 'dat' are also coordinator/demonstrative; require the subject right after.
    const subject = tokens[i + 1]!;
    const verb = tokens[i + 2]!;
    // 'het' is a safe subject here: "dat het is …" can only be a subordinate clause.
    if (!(SUBJECTS.has(subject.lower) || subject.lower === 'het') || !FINITE_VERBS.has(verb.lower)) continue;
    if (i === 0 && conj.lower === 'dat') continue;
    const end = clauseEnd(ctx, i + 2);
    if (end <= i + 2) continue; // verb already last
    const rest = tokens.slice(i + 3, end + 1);
    if (rest.some((t) => looksLikeVerbForm(t.lower) || SUBJECTS.has(t.lower))) continue;
    if (PARTICLES.has(rest[0]!.lower) && rest.length === 1) continue;
    const restText = slice(ctx, i + 3, end);
    out.push(
      finding({
        start: verb.start,
        end: tokens[end]!.end,
        replacement: `${restText} ${verb.text}`,
        patternId: 'verb-final-subclause',
        category: 'grammar',
        severity: 'grammar',
        explanation: `After '${conj.lower}' the verb goes to the end of the clause: '${conj.lower} ${subject.text} ${restText} ${verb.text}'. (Tip: with 'want' you keep normal order: 'want ${subject.text} ${verb.text} ${restText}'.)`,
      }),
    );
  }
  // "want ik moe ben" → "want ik ben moe" (want is coordinating: normal order)
  for (let i = 0; i + 3 < tokens.length; i++) {
    if (tokens[i]!.lower !== 'want' || !SUBJECTS.has(tokens[i + 1]!.lower)) continue;
    const end = clauseEnd(ctx, i + 1);
    const last = tokens[end]!;
    if (end < i + 3 || !FINITE_VERBS.has(last.lower)) continue;
    const middle = tokens.slice(i + 2, end);
    if (middle.some((t) => FINITE_VERBS.has(t.lower) || INFINITIVES.has(t.lower))) continue;
    const middleText = slice(ctx, i + 2, end - 1);
    out.push(
      finding({
        start: tokens[i + 2]!.start,
        end: last.end,
        replacement: `${last.text} ${middleText}`,
        patternId: 'verb-final-subclause',
        category: 'grammar',
        severity: 'grammar',
        explanation: `'Want' (because) keeps normal word order — the verb stays in second place: 'want ${tokens[i + 1]!.text} ${last.text} ${middleText}'. Only 'omdat' sends the verb to the end.`,
      }),
    );
  }
  return out;
}

const MODALS = new Set(['mag', 'kan', 'kun', 'kunt', 'wil', 'wilt', 'moet', 'zal', 'zullen', 'kunnen', 'mogen', 'willen', 'moeten', 'ga', 'gaat', 'gaan']);
const EXTRAPOSABLE = new Set(['naar', 'met', 'in', 'op', 'om', 'bij', 'voor', 'aan', 'over', 'uit', 'van', 'tot', 'zonder', 'na', 'tegen', 'niet', 'want', 'maar', 'en', 'of', 'omdat', 'als', 'dat']);

/** Token indexes where a main clause can start (sentence start, after a comma or coordinator). */
function clauseStarts(ctx: Ctx): number[] {
  const starts = [0];
  for (let k = 1; k < ctx.tokens.length; k++) {
    const between = ctx.sentence.slice(ctx.tokens[k - 1]!.end, ctx.tokens[k]!.start);
    if (between.includes(',') || between.includes(';')) starts.push(k);
    else if (COORDINATORS.has(ctx.tokens[k - 1]!.lower) && ctx.tokens[k - 1]!.lower !== 'of') starts.push(k);
  }
  return starts;
}

function ruleInfinitiveEnd(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  for (const start of clauseStarts(ctx)) out.push(...infinitiveAt(ctx, start));
  return out;
}

function infinitiveAt(ctx: Ctx, s: number): Finding[] {
  const { tokens } = ctx;
  if (tokens.length - s < 4) return [];
  let infIndex = -1;
  const [t0, t1, t2] = [tokens[s]!, tokens[s + 1]!, tokens[s + 2]!];
  if (MODALS.has(t0.lower) && SUBJECTS.has(t1.lower) && INFINITIVES.has(t2.lower)) infIndex = s + 2;
  if (SUBJECTS.has(t0.lower) && MODALS.has(t1.lower) && INFINITIVES.has(t2.lower)) infIndex = s + 2;
  if (infIndex < 0) return [];
  const inf = tokens[infIndex]!;
  const next = tokens[infIndex + 1]!;
  if (EXTRAPOSABLE.has(next.lower)) return [];
  const end = clauseEnd(ctx, infIndex);
  if (end <= infIndex) return [];
  const rest = slice(ctx, infIndex + 1, end);
  if (tokens.slice(infIndex + 1, end + 1).some((t) => INFINITIVES.has(t.lower))) return [];
  const politeCoffee = t0.lower === 'mag' && inf.lower === 'hebben';
  const modal = MODALS.has(t0.lower) && SUBJECTS.has(t1.lower) ? t0 : t1;
  return [
    finding({
      start: inf.start,
      end: tokens[end]!.end,
      replacement: `${rest} ${inf.text}`,
      patternId: 'infinitive-end',
      category: 'grammar',
      severity: 'grammar',
      explanation: politeCoffee
        ? `The infinitive goes to the end: 'Mag ik ${rest} hebben?' — and Dutch people usually just say 'Mag ik ${rest}?'`
        : `With '${modal.lower}' the second verb (infinitive) goes to the end of the sentence: '… ${rest} ${inf.text}'.`,
    }),
  ];
}

function ruleNodig(ctx: Ctx): Finding[] {
  const { tokens } = ctx;
  for (let i = 0; i + 2 < tokens.length; i++) {
    if (!TO_ZIJN[tokens[i]!.lower]) continue;
    let k = i + 1;
    if (SUBJECTS.has(tokens[k]!.lower)) k++;
    if (tokens[k]?.lower !== 'nodig' || !tokens[k + 1]) continue;
    const end = clauseEnd(ctx, k + 1);
    const object = slice(ctx, k + 1, end);
    return [
      finding({
        start: tokens[k]!.start,
        end: tokens[end]!.end,
        replacement: `${object} nodig`,
        patternId: 'nodig-hebben',
        category: 'grammar',
        severity: 'grammar',
        explanation: `'Nodig' goes after the thing you need: '… ${object} nodig'.`,
      }),
    ];
  }
  return [];
}

function ruleSeparable(ctx: Ctx): Finding[] {
  const { tokens } = ctx;
  if (tokens.length < 2 || !SUBJECTS.has(tokens[0]!.lower)) return [];
  const verb = tokens[1]!;
  const split = SEPARABLE_UNSPLIT.get(verb.lower);
  if (!split) return [];
  const [finite, particle] = split;
  const end = clauseEnd(ctx, 1);
  const rest = end > 1 ? ` ${slice(ctx, 2, end)}` : '';
  return [
    finding({
      start: verb.start,
      end: tokens[end]!.end,
      replacement: `${finite}${rest} ${particle}`,
      patternId: 'separable-verbs',
      category: 'grammar',
      severity: 'grammar',
      explanation: `'${particle}${finite.replace(/t$/, '')}…' is a separable verb: in a main clause the prefix '${particle}' moves to the end: '${tokens[0]!.text} ${finite}${rest} ${particle}'.`,
    }),
  ];
}

const GAP_BLOCKERS = new Set(['ben', 'bent', 'is', 'zijn', 'heb', 'hebt', 'heeft', 'hebben', 'was', 'waren', 'had', 'hadden', 'wordt', 'werd', 'dat', 'die', 'waar', 'omdat', 'als', 'wanneer', 'wie', 'wat', 'of', 'toen', 'en', 'maar']);

function rulePerfectAuxiliary(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  for (let a = 0; a < tokens.length; a++) {
    const aux = tokens[a]!;
    const toZijn = TO_ZIJN[aux.lower];
    const toHebben = TO_HEBBEN[aux.lower];
    if (!toZijn && !toHebben) continue;
    const subjectNear = SUBJECTS.has(tokens[a - 1]?.lower ?? '') || SUBJECTS.has(tokens[a + 1]?.lower ?? '');
    for (let p = a + 1; p < Math.min(tokens.length, a + 10); p++) {
      const between = ctx.sentence.slice(tokens[p - 1]!.end, tokens[p]!.start);
      if (CLAUSE_PUNCT.test(between)) break;
      const word = tokens[p]!.lower;
      if (p > a + 1 && GAP_BLOCKERS.has(tokens[p - 1]!.lower) && p - 1 !== a) break;
      if (toZijn && ZIJN_PARTICIPLES.has(word)) {
        out.push(
          finding({
            start: aux.start,
            end: aux.end,
            replacement: matchCase(aux.text, toZijn),
            patternId: 'perfect-zijn',
            category: 'grammar',
            severity: 'grammar',
            explanation: `'${tokens[p]!.text}' takes 'zijn' in the perfect tense (movement or change of state): '${toZijn} … ${tokens[p]!.text}'.`,
          }),
        );
        break;
      }
      if (toHebben && subjectNear && HEBBEN_PARTICIPLES.has(word)) {
        out.push(
          finding({
            start: aux.start,
            end: aux.end,
            replacement: matchCase(aux.text, toHebben),
            patternId: 'perfect-hebben',
            category: 'grammar',
            severity: 'grammar',
            explanation: `'${tokens[p]!.text}' takes 'hebben': '${toHebben} … ${tokens[p]!.text}'. With 'zijn' it would sound passive.`,
          }),
        );
        break;
      }
    }
  }
  return out;
}

const NP_DETERMINERS = new Set(['de', 'het', 'een', 'geen', 'deze', 'dit', 'die', 'mijn', 'jouw', 'haar', 'ons', 'onze', 'hun', 'uw', 'elk', 'elke', 'ieder', 'iedere', "zo'n"]);
const INDEFINITE_FOR_HET = new Set(['een', 'geen', 'elk', 'ieder', "zo'n"]);
const JUDGEMENT_VERBS = new Set(['vind', 'vindt', 'vinden', 'maak', 'maakt', 'maken', 'noem', 'noemt', 'wordt', 'werd']);

function correctDeterminer(det: string, gender: 'de' | 'het'): string {
  switch (det) {
    case 'de':
    case 'het':
      return gender;
    case 'deze':
    case 'dit':
      return gender === 'het' ? 'dit' : 'deze';
    case 'die':
      return gender === 'het' ? 'dat' : 'die';
    case 'ons':
    case 'onze':
      return gender === 'het' ? 'ons' : 'onze';
    case 'elk':
    case 'elke':
      return gender === 'het' ? 'elk' : 'elke';
    case 'ieder':
    case 'iedere':
      return gender === 'het' ? 'ieder' : 'iedere';
    default:
      return det;
  }
}

function ruleNounPhrase(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  for (let i = 0; i + 1 < tokens.length; i++) {
    const det = tokens[i]!;
    if (!NP_DETERMINERS.has(det.lower) || !adjacent(ctx, i)) continue;
    let adj: Token | undefined;
    let noun = tokens[i + 1]!;
    let gender = nounGender(noun.lower);
    if (!gender) {
      const forms = adjectiveForms(tokens[i + 1]!.lower);
      const candidate = tokens[i + 2];
      if (!forms || !candidate || !adjacent(ctx, i + 1)) continue;
      const g = nounGender(candidate.lower);
      if (!g) continue;
      adj = tokens[i + 1]!;
      noun = candidate;
      gender = g;
    }
    if (gender === 'both') continue;
    // 'het' can be an object pronoun: "Ik vind het mooi weer", "Ik vind het tijd om te gaan".
    if (det.lower === 'het' && JUDGEMENT_VERBS.has(tokens[i - 1]?.lower ?? '')) continue;
    if (det.lower === 'het' && adj && adjectiveForms(adj.lower)!.base === adj.lower && gender === 'het') continue;
    // A noun followed directly by -en/-s might be a compound or plural we don't know; skip names.
    if (/^\p{Lu}/u.test(noun.text) && i > 0) continue;
    const rightDet = correctDeterminer(det.lower, gender);
    const detWrong = rightDet !== det.lower;
    let rightAdj: string | undefined;
    if (adj) {
      const forms = adjectiveForms(adj.lower)!;
      if (forms.base !== forms.inflected) {
        const noE = gender === 'het' && INDEFINITE_FOR_HET.has(rightDet);
        rightAdj = noE ? forms.base : forms.inflected;
      }
    }
    const adjWrong = !!adj && !!rightAdj && rightAdj !== adj.lower;
    if (!detWrong && !adjWrong) continue;
    const phrase = [matchCase(det.text, rightDet), adj ? (adjWrong ? rightAdj : adj.text) : undefined, noun.text]
      .filter(Boolean)
      .join(' ');
    const span = { start: det.start, end: noun.end, replacement: phrase };
    if (detWrong) {
      const diminutive = isDiminutive(noun.lower);
      let explanation: string;
      if (det.lower === 'de' || det.lower === 'het') {
        explanation = diminutive
          ? `Words ending in -je are always het-words: 'het ${noun.text.toLowerCase()}'.`
          : `'${noun.text.toLowerCase()}' is a ${gender}-word: '${gender} ${noun.text.toLowerCase()}'.`;
      } else if (['deze', 'dit', 'die'].includes(det.lower)) {
        explanation = `'${noun.text.toLowerCase()}' is a ${gender}-word, so use '${rightDet}'. (de-words: deze/die · het-words: dit/dat)`;
      } else if (['ons', 'onze'].includes(det.lower)) {
        explanation = `'Ons' goes with het-words and 'onze' with de-words: '${rightDet} ${noun.text.toLowerCase()}'.`;
      } else {
        explanation = `With a ${gender}-word use '${rightDet}': '${rightDet} ${noun.text.toLowerCase()}'.`;
      }
      out.push({ ...span, patternId: 'de-het', category: 'grammar', severity: 'grammar', explanation });
    }
    if (adjWrong) {
      const noE = rightAdj === adjectiveForms(adj!.lower)!.base;
      out.push({
        ...span,
        patternId: 'adjective-e',
        category: 'grammar',
        severity: 'grammar',
        explanation: noE
          ? `With a het-word after '${rightDet}', the adjective has no -e: '${rightDet} ${rightAdj} ${noun.text.toLowerCase()}'.`
          : `An adjective before a noun gets -e here: '${rightDet} ${rightAdj} ${noun.text.toLowerCase()}'. (Only het-words after een/geen drop the -e.)`,
      });
    }
  }
  return out;
}

const UNCOUNTABLE = new Set(['tijd', 'geld', 'zin', 'honger', 'dorst', 'werk', 'kinderen', 'huisdieren', 'idee', 'probleem', 'auto', 'fiets', 'broer', 'zus', 'vrienden']);

function ruleGeenNiet(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  for (let i = 0; i + 1 < tokens.length; i++) {
    const t = tokens[i]!;
    if (t.lower !== 'niet') continue;
    const next = tokens[i + 1]!;
    if (next.text.toLowerCase() === 'een') {
      out.push({
        start: t.start,
        end: next.end,
        replacement: matchCase(t.text, 'geen'),
        patternId: 'geen-niet',
        category: 'grammar',
        severity: 'grammar',
        explanation: "'Niet een' becomes 'geen' in Dutch: 'Ik heb geen auto', 'Dat is geen probleem'.",
      });
      continue;
    }
    const prev = tokens[i - 1];
    const prev2 = tokens[i - 2];
    const hasHebben = (prev && TO_ZIJN[prev.lower]) || (prev2 && TO_ZIJN[prev2.lower] && SUBJECTS.has(prev!.lower));
    if (hasHebben && (UNCOUNTABLE.has(next.lower) || nounGender(next.lower))) {
      out.push({
        start: t.start,
        end: t.end,
        replacement: matchCase(t.text, 'geen'),
        patternId: 'geen-niet',
        category: 'grammar',
        severity: 'grammar',
        explanation: `To negate a noun without an article use 'geen': 'geen ${next.text.toLowerCase()}'.`,
      });
    }
  }
  return out;
}

const OBJECT_FORM: Record<string, string> = { ik: 'mij', jij: 'jou', hij: 'hem', wij: 'ons', we: 'ons', zij: 'haar' };
const PREPOSITIONS = new Set(['met', 'aan', 'bij', 'van', 'naar', 'over', 'zonder', 'tegen', 'naast', 'achter', 'tussen', 'voor', 'na']);

function ruleObjectPronouns(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  for (let i = 0; i + 1 < tokens.length; i++) {
    const prep = tokens[i]!;
    const pron = tokens[i + 1]!;
    if (!PREPOSITIONS.has(prep.lower) || !OBJECT_FORM[pron.lower] || !adjacent(ctx, i)) continue;
    // 'voor/na hij komt' can be a (colloquial) conjunction; only flag at clause end.
    if ((prep.lower === 'voor' || prep.lower === 'na') && clauseEnd(ctx, i + 1) !== i + 1) continue;
    const object = OBJECT_FORM[pron.lower]!;
    out.push({
      start: pron.start,
      end: pron.end,
      replacement: object,
      patternId: 'object-pronouns',
      category: 'grammar',
      severity: 'grammar',
      explanation: `After '${prep.lower}' use the object form: '${prep.lower} ${object}'${pron.lower === 'zij' ? " (or 'hen' if you mean 'them')" : ''}.`,
    });
  }
  return out;
}

function ruleAgreement(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  const fixes: [Set<string>, Record<string, string>, string][] = [
    [new Set(['ik']), { heeft: 'heb', hebt: 'heb', hebben: 'heb', bent: 'ben', is: 'ben' }, "With 'ik': ik ben, ik heb."],
    [new Set(['hij']), { heb: 'heeft', hebben: 'heeft', hebt: 'heeft', ben: 'is', bent: 'is' }, "With 'hij/zij (she)': hij is, hij heeft."],
    [new Set(['jij', 'je']), { ben: 'bent', heb: 'hebt' }, "With 'jij' before the verb: jij bent, jij hebt. (The -t only drops when jij comes after the verb: 'Ben jij…?')"],
    [new Set(['we', 'wij', 'jullie']), { is: 'zijn', ben: 'zijn', bent: 'zijn', heb: 'hebben', hebt: 'hebben', heeft: 'hebben' }, 'Plural subjects take the plural verb: we zijn, we hebben.'],
  ];
  for (let i = 0; i + 1 < tokens.length; i++) {
    const subject = tokens[i]!;
    const verb = tokens[i + 1]!;
    for (const [subjects, map, why] of fixes) {
      if (subjects.has(subject.lower) && map[verb.lower] && adjacent(ctx, i)) {
        // 'je heb' could be possessive 'je' + noun in theory; verbs here are unambiguous.
        out.push({
          start: verb.start,
          end: verb.end,
          replacement: map[verb.lower]!,
          patternId: 'subject-verb-agreement',
          category: 'grammar',
          severity: 'grammar',
          explanation: why,
        });
      }
    }
  }
  return out;
}

const QUESTION_WORDS = new Set(['wat', 'waar', 'wanneer', 'hoe', 'waarom', 'hoeveel', 'welke', 'wie', 'hoelang', 'waarheen', 'waarvandaan']);

function ruleJijInversion(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  for (let i = 0; i + 1 < tokens.length; i++) {
    const verb = tokens[i]!;
    const pron = tokens[i + 1]!;
    const stem = JIJ_INVERSION.get(verb.lower);
    if (!stem || (pron.lower !== 'jij' && pron.lower !== 'je') || !adjacent(ctx, i)) continue;
    const prev = tokens[i - 1];
    const eligible = i === 0 || (prev && (QUESTION_WORDS.has(prev.lower) || FRONTED_SINGLE.has(prev.lower)));
    if (!eligible) continue;
    // "Hoe gaat je werk?" — here 'je' is possessive ('your'), not the subject.
    const after = tokens[i + 2];
    if (pron.lower === 'je' && after && nounGender(after.lower)) continue;
    out.push({
      start: verb.start,
      end: verb.end,
      replacement: matchCase(verb.text, stem),
      patternId: 'jij-inversion-t',
      category: 'grammar',
      severity: 'grammar',
      explanation: `When 'jij/je' comes after the verb, the -t drops: '${capitalizeWord(stem)} ${pron.text}…?' (with 'u' it stays: '${capitalizeWord(verb.lower)} u…?').`,
    });
  }
  return out;
}

const UNIT_SINGULAR: Record<string, string> = { jaren: 'jaar', euros: 'euro', "euro's": 'euro', "kilo's": 'kilo' };

function ruleUnits(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  for (let i = 0; i + 1 < tokens.length; i++) {
    const n = tokens[i]!;
    const unit = tokens[i + 1]!;
    const singular = UNIT_SINGULAR[unit.lower];
    if (!singular || !isNumberToken(n.lower) || n.lower === 'een') continue;
    out.push({
      start: unit.start,
      end: unit.end,
      replacement: singular,
      patternId: 'units-after-numbers',
      category: 'grammar',
      severity: 'grammar',
      explanation: `After a number, '${singular}' stays singular: '${n.text} ${singular}'.`,
    });
  }
  return out;
}

const ONGOING_VERBS = new Set(['woon', 'woont', 'wonen', 'werk', 'werkt', 'werken', 'leer', 'leert', 'leren', 'studeer', 'studeert', 'studeren', 'ken', 'kent', 'kennen', 'ben', 'bent', 'is', 'zijn']);
const DURATION_UNITS = new Set(['jaar', 'jaren', 'maand', 'maanden', 'week', 'weken', 'dag', 'dagen']);

function ruleDuration(ctx: Ctx): Finding[] {
  const { tokens, sentence } = ctx;
  for (let i = 0; i + 2 < tokens.length; i++) {
    const prep = tokens[i]!;
    if (prep.lower !== 'sinds' && prep.lower !== 'voor') continue;
    let k = i + 1;
    if (tokens[k]?.lower === 'een' && tokens[k + 1]?.lower === 'paar') k++;
    const amount = tokens[k];
    const unit = tokens[k + 1];
    if (!amount || !unit || !(isNumberToken(amount.lower) || amount.lower === 'paar') || !DURATION_UNITS.has(unit.lower)) continue;
    const verbIndex = tokens.findIndex((t, idx) => idx < i && ONGOING_VERBS.has(t.lower));
    if (verbIndex < 0) continue;
    const verb = tokens[verbIndex]!;
    const isZijn = ['ben', 'bent', 'is', 'zijn'].includes(verb.lower);
    if (prep.lower === 'voor' && isZijn) continue; // "Ik ben hier voor twee weken" is fine.
    const duration = slice(ctx, i + 1, k + 1).replace(/jaren/i, 'jaar');
    // Move "al <duration>" right after the verb (and after an inverted subject).
    let insertAfter = verbIndex;
    if (SUBJECTS.has(tokens[verbIndex + 1]?.lower ?? '') && verbIndex + 1 < i) insertAfter = verbIndex + 1;
    const head = sentence.slice(tokens[insertAfter]!.end, prep.start).trimEnd();
    const tail = sentence.slice(unit.end, tokens[clauseEnd(ctx, k + 1)]!.end);
    const replacement = `${tokens[insertAfter]!.text} al ${duration}${head ? head : ''}${tail}`;
    return [
      {
        start: tokens[insertAfter]!.start,
        end: tokens[clauseEnd(ctx, k + 1)]!.end,
        replacement: replacement.replace(/\s+/g, ' '),
        patternId: 'duration-al',
        category: prep.lower === 'sinds' ? 'grammar' : 'naturalness',
        severity: prep.lower === 'sinds' ? 'grammar' : 'naturalness',
        explanation:
          prep.lower === 'sinds'
            ? `'Sinds' needs a moment in time ('sinds 2022', 'sinds maandag'). For a period that is still going on, use 'al': '… al ${duration} …'.`
            : `If you mean you've been doing this for ${duration} and still are, Dutch says 'al ${duration}'. ('Voor ${duration}' sounds like a planned period.)`,
      },
    ];
  }
  return [];
}

function ruleIkBenGoed(ctx: Ctx): Finding[] {
  const { tokens, sentence } = ctx;
  if (tokens.length < 3 || tokens[0]!.lower !== 'ik' || tokens[1]!.lower !== 'ben') return [];
  const word = tokens[2]!;
  if (!['goed', 'ok', 'oke', 'prima', 'fijn'].includes(word.lower)) return [];
  const after = sentence.slice(word.end).trim().toLowerCase();
  if (after && !/^([,.!?]|en\b|dank|hoor|,?\s*en\b)/.test(after)) return [];
  return [
    {
      start: tokens[0]!.start,
      end: word.end,
      replacement: `Het gaat ${word.lower === 'ok' || word.lower === 'oke' ? 'goed' : word.lower}`,
      patternId: 'ik-ben-goed',
      category: 'naturalness',
      severity: 'naturalness',
      explanation:
        "People understand you, but 'Ik ben goed' is translated from English. Dutch answers 'Hoe gaat het?' with 'Goed!', 'Het gaat goed' or 'Prima, en met jou?'. ('Ik ben goed in…' means 'I'm good at…'.)",
    },
  ];
}

function ruleAnglicisms(ctx: Ctx): Finding[] {
  const out: Finding[] = [];
  const { tokens } = ctx;
  for (let i = 0; i + 1 < tokens.length; i++) {
    const t = tokens[i]!;
    if (['maakt', 'maken', 'maak'].includes(t.lower)) {
      const negated = tokens[i + 1]?.lower === 'geen';
      const zin = tokens[negated ? i + 2 : i + 1];
      if (zin?.lower === 'zin') {
        out.push({
          start: t.start,
          end: zin.end,
          replacement: negated ? 'slaat nergens op' : 'is logisch',
          patternId: 'anglicism',
          category: 'naturalness',
          severity: 'naturalness',
          explanation: negated
            ? "'Dat maakt geen zin' is a literal translation of 'that makes no sense'. More natural: 'Dat slaat nergens op' or 'Dat is niet logisch'."
            : "'Dat maakt zin' comes from English 'that makes sense'. Many Dutch people frown at it; 'Dat is logisch' or 'Dat klopt' sound natural.",
        });
      }
    }
    if (['had', 'hadden', 'heb', 'hebben', 'hebt', 'heeft'].includes(t.lower) && tokens[i + 1]?.lower === 'een' && ['goede', 'geweldige'].includes(tokens[i + 2]?.lower ?? '') && tokens[i + 3]?.lower === 'tijd') {
      out.push({
        start: tokens[i + 1]!.start,
        end: tokens[i + 3]!.end,
        replacement: 'het erg naar mijn zin',
        patternId: 'anglicism',
        category: 'naturalness',
        severity: 'naturalness',
        explanation:
          "'Een goede tijd hebben' is translated from English. Dutch says 'Ik heb het (erg) naar mijn zin gehad' or simply 'Het was heel leuk!'.",
      });
    }
    if (TO_HEBBEN[t.lower] && tokens[i + 1]?.lower === 'interesse') {
      out.push({
        start: t.start,
        end: t.end,
        replacement: matchCase(t.text, TO_HEBBEN[t.lower]!),
        patternId: 'word-choice',
        category: 'vocabulary',
        severity: 'grammar',
        explanation: "'Interesse' is a noun, so you *have* it: 'Ik heb interesse in…' — or use the adjective: 'Ik ben geïnteresseerd in…'.",
      });
    }
  }
  return out;
}

const FORMAL_VERB: Record<string, string> = { heb: 'hebt', kun: 'kunt', kan: 'kunt', wil: 'wilt', ben: 'bent', ga: 'gaat', kom: 'komt', woon: 'woont', werk: 'werkt', spreek: 'spreekt', doe: 'doet', zie: 'ziet', vind: 'vindt', neem: 'neemt', wacht: 'wacht', moet: 'moet', weet: 'weet', mag: 'mag' };

function ruleRegister(ctx: Ctx): Finding[] {
  const { tokens, sentence, options } = ctx;
  if (options.register === 'formal') {
    const informal = tokens.findIndex((t) => ['je', 'jij', 'jou', 'jouw', 'alsjeblieft', 'dankjewel'].includes(t.lower));
    if (informal < 0) return [];
    // 'dank je' → 'dank u'; convert the whole sentence to u-forms.
    let converted = '';
    let cursor = 0;
    tokens.forEach((t, idx) => {
      let replacement: string | undefined;
      const next = tokens[idx + 1];
      if (t.lower === 'je' && next && nounGender(next.lower)) replacement = 'uw';
      else if (t.lower === 'je' || t.lower === 'jij' || t.lower === 'jou') replacement = 'u';
      else if (t.lower === 'jouw') replacement = 'uw';
      else if (t.lower === 'alsjeblieft') replacement = 'alstublieft';
      else if (t.lower === 'dankjewel') replacement = 'dank u wel';
      else if (next && (next.lower === 'je' || next.lower === 'jij') && FORMAL_VERB[t.lower]) replacement = FORMAL_VERB[t.lower];
      if (replacement !== undefined) {
        converted += sentence.slice(cursor, t.start) + matchCase(t.text, replacement);
        cursor = t.end;
      }
    });
    converted += sentence.slice(cursor);
    const first = tokens[0]!;
    const last = tokens[tokens.length - 1]!;
    return [
      {
        start: first.start,
        end: last.end,
        replacement: converted.slice(first.start, converted.length - (sentence.length - last.end)),
        patternId: 'register-formal',
        category: 'register',
        severity: 'register',
        explanation:
          "In this situation Dutch people usually say 'u' (formal 'you'). 'Je/jij' is fine with friends, colleagues and people your age — and if they say 'Zeg maar je', switch!",
      },
    ];
  }
  if (options.register === 'informal') {
    const u = tokens.find((t) => t.lower === 'u' || t.lower === 'uw');
    if (!u) return [];
    return [
      {
        start: u.start,
        end: u.end,
        replacement: u.lower === 'u' ? 'je' : 'je',
        patternId: 'register-formal',
        category: 'register',
        severity: 'register',
        explanation:
          "Among friends 'je/jij' is normal — 'u' sounds distant, as if you were talking to their grandmother. It's never rude, just formal.",
      },
    ];
  }
  return [];
}

const RULES: ((ctx: Ctx) => Finding[])[] = [
  ruleHeten,
  ruleAge,
  ruleColdWarm,
  ruleHungerThirst,
  ruleWordOrderV2,
  ruleVerbFinal,
  ruleInfinitiveEnd,
  ruleNodig,
  ruleSeparable,
  rulePerfectAuxiliary,
  ruleNounPhrase,
  ruleGeenNiet,
  ruleObjectPronouns,
  ruleAgreement,
  ruleJijInversion,
  ruleUnits,
  ruleDuration,
  ruleIkBenGoed,
  ruleAnglicisms,
  ruleRegister,
];

function applyFindings(sentence: string, findings: Finding[]): string {
  const sorted = [...findings].sort((a, b) => a.start - b.start);
  let result = '';
  let cursor = 0;
  for (const f of sorted) {
    if (f.start < cursor) continue; // overlapping: keep the earlier fix
    const replacement = f.start === 0 ? capitalizeWord(f.replacement) : f.replacement;
    result += sentence.slice(cursor, f.start) + replacement;
    cursor = f.end;
  }
  return result + sentence.slice(cursor);
}

/** Detect mistakes in learner Dutch. Deterministic; safe to run on every keystroke-free submit. */
export function detectMistakes(text: string, options: DetectOptions = {}): Detection {
  const sentences = splitSentences(text);
  const corrections: Correction[] = [];
  const correctedSentences: string[] = [];
  for (const sentence of sentences) {
    const ctx: Ctx = { sentence, tokens: tokenizeSentence(sentence), options };
    const findings: Finding[] = [];
    for (const rule of RULES) findings.push(...rule(ctx));
    // One finding per pattern+span; register findings only when nothing else fired on the sentence.
    const unique = findings.filter(
      (f, idx) => findings.findIndex((g) => g.patternId === f.patternId && g.start === f.start) === idx,
    );
    for (const f of unique) {
      corrections.push({
        original: sentence,
        corrected: applyFindings(sentence, [f]),
        explanation: f.explanation,
        category: f.category,
        patternId: f.patternId,
        severity: f.severity,
      });
    }
    const nonRegister = unique.filter((f) => f.patternId !== 'register-formal');
    correctedSentences.push(applyFindings(sentence, nonRegister.length ? nonRegister : unique));
  }
  return { corrections, correctedText: correctedSentences.join(' '), sentences: sentences.length };
}
