import { z } from 'zod';
import { BilingualSchema, GoalSchema, LevelSchema, RegionSchema, RegisterSchema, SkillSchema } from './common.js';

const id = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9.-]*$/, 'ids are lower-case, dot/dash separated');

/** A line of dialogue or listening text. */
export const LineSchema = z.object({
  speaker: z.string().min(1),
  nl: z.string().min(1),
  en: z.string().min(1),
  /** Recorded native audio. When absent the client uses text-to-speech. */
  audioUrl: z.string().optional(),
});
export type Line = z.infer<typeof LineSchema>;

/**
 * A learnable chunk: taught as a phrase in context, never as a bare word pair.
 * `band` is an approximate frequency band (1 = core 500, 2 = top 2,000, 3 = top 5,000, 4 = beyond).
 */
export const PhraseSchema = z.object({
  id,
  nl: z.string().min(1),
  en: z.string().min(1),
  example: BilingualSchema,
  article: z.enum(['de', 'het']).optional(),
  register: RegisterSchema.optional(),
  band: z.number().int().min(1).max(4),
  note: z.string().optional(),
  emoji: z.string().optional(),
  audioUrl: z.string().optional(),
});
export type Phrase = z.infer<typeof PhraseSchema>;

/**
 * An intent is satisfied when ANY group in `anyOf` has ALL of its terms present.
 * Term syntax: alternatives separated by `|`, each a word or phrase matched on word
 * boundaries (case- and accent-insensitive); a trailing `*` matches a word prefix.
 * Example: [["heet|naam is"], ["ik ben", "uit|van"]] — either names themselves, or says
 * "ik ben … uit/van …".
 */
export const IntentSchema = z.object({
  id,
  description: z.string().min(1),
  anyOf: z.array(z.array(z.string().min(1)).min(1)).min(1),
});
export type Intent = z.infer<typeof IntentSchema>;

export const QuestionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('choice'),
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    answer: z.number().int().min(0),
    explanation: z.string().optional(),
  }),
  z.object({
    type: z.literal('text'),
    prompt: z.string().min(1),
    accept: z.array(z.string().min(1)).min(1),
    explanation: z.string().optional(),
  }),
]);
export type Question = z.infer<typeof QuestionSchema>;

const exerciseBase = {
  id,
  /** Mistake pattern this exercise trains (feeds Mistake Diary drill stats). */
  patternId: z.string().optional(),
  skill: SkillSchema.optional(),
  hint: z.string().optional(),
};

export const ExerciseSchema = z.discriminatedUnion('type', [
  /** English → Dutch production. */
  z.object({
    ...exerciseBase,
    type: z.literal('translate'),
    prompt: z.string().min(1),
    accept: z.array(z.string().min(1)).min(1),
  }),
  /** Cloze: `sentence` contains exactly one `___`. */
  z.object({
    ...exerciseBase,
    type: z.literal('fill'),
    sentence: z.string().includes('___'),
    en: z.string().min(1),
    accept: z.array(z.string().min(1)).min(1),
  }),
  /** Build the sentence from its words (word-order practice). `words` is the correct order. */
  z.object({
    ...exerciseBase,
    type: z.literal('order'),
    en: z.string().min(1),
    words: z.array(z.string().min(1)).min(3),
    accept: z.array(z.string().min(1)).optional(),
  }),
  z.object({
    ...exerciseBase,
    type: z.literal('choose'),
    prompt: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    answer: z.number().int().min(0),
    explanation: z.string().optional(),
  }),
  /** Free situational response, evaluated by intents + mistake detector. */
  z.object({
    ...exerciseBase,
    type: z.literal('respond'),
    situation: z.string().min(1),
    npc: BilingualSchema.optional(),
    intents: z.array(IntentSchema).min(1),
    modelAnswers: z.array(z.string().min(1)).min(1),
    register: RegisterSchema.optional(),
  }),
  /** Listen and type what you hear. */
  z.object({
    ...exerciseBase,
    type: z.literal('dictation'),
    nl: z.string().min(1),
    en: z.string().min(1),
  }),
]);
export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseType = Exercise['type'];

export const LESSON_STEPS = [
  'situation',
  'vocabulary',
  'pronunciation',
  'listening',
  'grammar',
  'speaking',
  'culture',
  'review',
] as const;
export const LessonStepSchema = z.enum(LESSON_STEPS);
export type LessonStep = z.infer<typeof LessonStepSchema>;

export const LessonSchema = z.object({
  id,
  level: LevelSchema,
  unit: z.string().min(1),
  order: z.number().int().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  canDo: z.string().min(1),
  minutes: z.number().int().min(3).max(30),
  situation: z.object({
    setting: z.string().min(1),
    dialogue: z.array(LineSchema).min(4),
  }),
  vocabulary: z.array(PhraseSchema).min(5),
  pronunciation: z.object({
    focus: z.string().min(1),
    tip: z.string().min(1),
    items: z.array(z.object({ nl: z.string().min(1), en: z.string().optional(), hint: z.string().optional() })).min(2),
  }),
  listening: z.object({
    intro: z.string().min(1),
    lines: z.array(LineSchema).min(2),
    questions: z.array(QuestionSchema).min(2),
  }),
  speaking: z.object({
    prompt: z.string().min(1),
    context: z.string().optional(),
    mustInclude: z.array(IntentSchema).min(1),
    modelAnswers: z.array(z.string().min(1)).min(1),
    register: RegisterSchema.optional(),
    hints: z.array(z.string().min(1)).min(1),
  }),
  grammar: z.object({
    title: z.string().min(1),
    explanation: z.string().min(1),
    examples: z.array(z.object({ nl: z.string().min(1), en: z.string().min(1), highlight: z.string().optional() })).min(2),
    commonMistake: z.object({ wrong: z.string().min(1), right: z.string().min(1), why: z.string().min(1) }).optional(),
  }),
  culture: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
  }),
  review: z.array(ExerciseSchema).min(4),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const SCENARIO_CATEGORIES = ['living', 'social', 'daily', 'work'] as const;
export const ScenarioCategorySchema = z.enum(SCENARIO_CATEGORIES);
export type ScenarioCategory = z.infer<typeof ScenarioCategorySchema>;

export const BeatSchema = z.object({
  id,
  npc: BilingualSchema,
  /** What the learner should do, in English. */
  task: z.string().min(1),
  intents: z.array(IntentSchema).min(1),
  /** First = simple and correct; later = more natural/advanced. */
  modelAnswers: z.array(z.string().min(1)).min(1),
  /** A Dutch starter chunk shown on request. */
  hint: z.string().min(1),
  culturalNote: z.string().optional(),
  /** NPC acknowledgement before moving on. */
  onSuccess: BilingualSchema.optional(),
  /** NPC clarification when the intent was not understood. */
  onMiss: BilingualSchema.optional(),
});
export type Beat = z.infer<typeof BeatSchema>;

export const ScenarioSchema = z.object({
  id,
  category: ScenarioCategorySchema,
  title: z.string().min(1),
  level: LevelSchema,
  goal: z.string().min(1),
  canDoId: z.string().optional(),
  register: RegisterSchema,
  setting: z.string().min(1),
  character: z.object({ name: z.string().min(1), role: z.string().min(1) }),
  goals: z.array(GoalSchema).min(1),
  beats: z.array(BeatSchema).min(3),
  debrief: z.string().min(1),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const SoundModuleSchema = z.object({
  id,
  title: z.string().min(1),
  spelling: z.array(z.string().min(1)).min(1),
  ipa: z.string().min(1),
  howTo: z.string().min(1),
  englishHint: z.string().min(1),
  commonMistakes: z.array(z.string().min(1)).min(1),
  minimalPairs: z
    .array(
      z.object({
        a: BilingualSchema,
        b: BilingualSchema,
        contrast: z.string().min(1),
      }),
    )
    .min(2),
  practice: z.array(BilingualSchema).min(3),
  regionalNote: z.string().optional(),
  priority: z.number().int().min(1).max(3),
});
export type SoundModule = z.infer<typeof SoundModuleSchema>;

export const LISTENING_KINDS = ['conversation', 'street', 'news', 'podcast', 'workplace', 'voicemail', 'announcement'] as const;

export const ListeningItemSchema = z.object({
  id,
  level: LevelSchema,
  kind: z.enum(LISTENING_KINDS),
  title: z.string().min(1),
  description: z.string().min(1),
  speakers: z.array(z.object({ id: z.string().min(1), name: z.string().min(1), voice: z.enum(['f', 'm']) })).min(1),
  lines: z.array(LineSchema).min(3),
  questions: z.array(QuestionSchema).min(2),
  vocab: z.array(z.object({ term: z.string().min(1), meaning: z.string().min(1) })).min(2),
  slang: z.array(z.object({ term: z.string().min(1), meaning: z.string().min(1), note: z.string().min(1) })),
});
export type ListeningItem = z.infer<typeof ListeningItemSchema>;

export const EXPRESSION_CATEGORIES = ['greetings', 'reactions', 'particles', 'fillers', 'social', 'slang', 'idioms'] as const;

export const ExpressionSchema = z.object({
  id,
  category: z.enum(EXPRESSION_CATEGORIES),
  natural: z.string().min(1),
  textbook: z.string().optional(),
  en: z.string().min(1),
  register: RegisterSchema,
  whoUses: z.string().min(1),
  when: z.string().min(1),
  examples: z.array(BilingualSchema).min(1),
  note: z.string().optional(),
  region: z.enum(['nl', 'be', 'both']).default('both'),
  level: LevelSchema,
});
export type Expression = z.infer<typeof ExpressionSchema>;

export const CULTURE_TOPICS = [
  'communication',
  'cycling',
  'social',
  'humor',
  'regions',
  'traditions',
  'food',
  'history',
  'work',
  'housing',
] as const;

export const CultureArticleSchema = z.object({
  id,
  topic: z.enum(CULTURE_TOPICS),
  title: z.string().min(1),
  summary: z.string().min(1),
  minutes: z.number().int().min(1).max(15),
  sections: z.array(z.object({ heading: z.string().min(1), body: z.string().min(1) })).min(2),
  keyPhrases: z.array(BilingualSchema).min(2),
  tryScenarioId: z.string().optional(),
});
export type CultureArticle = z.infer<typeof CultureArticleSchema>;

export const PersonaSchema = z.object({
  id,
  kind: z.enum(['friend', 'tutor']),
  name: z.string().min(1),
  age: z.number().int().min(18).max(90),
  city: z.string().min(1),
  region: RegionSchema,
  bio: z.string().min(1),
  personality: z.string().min(1),
  interests: z.array(z.string().min(1)).min(1),
  style: z.string().min(1),
  /** How the persona describes themselves (used by the offline engine). */
  selfIntro: BilingualSchema,
  opening: z.record(LevelSchema, BilingualSchema),
});
export type Persona = z.infer<typeof PersonaSchema>;

export const CanDoSchema = z.object({
  id,
  level: LevelSchema,
  text: z.string().min(1),
  skill: SkillSchema,
  scenarioIds: z.array(z.string()),
  lessonIds: z.array(z.string()),
});
export type CanDo = z.infer<typeof CanDoSchema>;
