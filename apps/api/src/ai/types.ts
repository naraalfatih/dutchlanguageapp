import type {
  ConversationMode,
  Correction,
  FreeResponseTask,
  Level,
  Persona,
  Region,
  Scenario,
  ScenarioEngineState,
  TurnFeedback,
  TurnResponse,
} from '@praat/core';

export interface HistoryMessage {
  role: 'learner' | 'character';
  text: string;
}

export interface TurnContext {
  mode: ConversationMode;
  level: Level;
  region: Region;
  correctionStyle: 'gentle' | 'thorough';
  persona?: Persona | undefined;
  scenario?: Scenario | undefined;
  scenarioState?: ScenarioEngineState | undefined;
  topic?: string | undefined;
  history: HistoryMessage[];
  /** Number of learner turns so far (0 for the first reply). */
  turnIndex: number;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
}

export interface TurnResult {
  response: TurnResponse;
  scenarioState?: ScenarioEngineState | undefined;
  usage?: Usage | undefined;
}

export interface EvaluationRequest {
  text: string;
  level: Level;
  task?: (FreeResponseTask & { prompt: string }) | undefined;
  correctionStyle: 'gentle' | 'thorough';
}

export interface EvaluationResult {
  achieved: boolean;
  feedback: TurnFeedback;
  corrections: Correction[];
  score: number;
  source: 'ai' | 'offline';
  usage?: Usage | undefined;
}

export interface AiProvider {
  readonly name: 'anthropic' | 'offline';
  opening(ctx: TurnContext): Promise<TurnResult>;
  reply(ctx: TurnContext, learnerText: string): Promise<TurnResult>;
  evaluate(request: EvaluationRequest): Promise<EvaluationResult>;
}
