import { getPersona, getScenario } from '@praat/content';
import {
  LEVELS,
  offlineOpening,
  offlineReply,
  turnEvents,
  type ConversationMode,
  type GlossaryItem,
  type Level,
  type OfflineContext,
  type Scenario,
  type ScenarioEngineState,
  type TaskProgress,
  type TurnFeedback,
  type TurnResponse,
} from '@praat/core';
import { Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { AudioButton } from '../components/AudioButton';
import { FeedbackCard, Glossary } from '../components/FeedbackCard';
import { SpeakOrType, type Answer } from '../components/SpeakOrType';
import { Empty, Header, Nl, ProgressBar } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { useVoice } from '../lib/hooks';
import { speak, stopSpeaking } from '../lib/speech';
import { applyRemote, record, useApp } from '../lib/store';

interface Message {
  id: string;
  role: 'learner' | 'character';
  text: string;
  translation?: string | null | undefined;
  feedback?: TurnFeedback | null | undefined;
  glossary?: GlossaryItem[] | undefined;
  source?: 'ai' | 'offline' | undefined;
  pending?: boolean;
}

interface ChatSetup {
  mode: ConversationMode;
  scenario?: Scenario | undefined;
  personaId?: string | undefined;
  topic?: string | undefined;
  conversationId?: string | undefined;
}

let messageCounter = 0;
const mid = () => `m${++messageCounter}`;

function characterMessage(turn: TurnResponse): Message {
  return {
    id: mid(),
    role: 'character',
    text: turn.reply.nl,
    translation: turn.reply.en,
    glossary: turn.glossary,
    source: turn.source,
  };
}

function CharacterBubble({ message, name }: { message: Message; name: string }) {
  const [english, setEnglish] = useState(false);
  return (
    <div className="bubble character">
      <div className="tiny muted">{name}</div>
      <Nl>{message.text}</Nl>
      <div className="actions">
        <AudioButton text={message.text} id={`msg-${message.id}`} />
        {message.translation && (
          <button type="button" className="btn ghost small" aria-pressed={english} onClick={() => setEnglish(!english)}>
            {english ? <EyeOff size={14} /> : <Eye size={14} />} English
          </button>
        )}
      </div>
      {english && message.translation && <div className="translation">{message.translation}</div>}
      {message.glossary && <Glossary items={message.glossary} />}
    </div>
  );
}

export default function Chat() {
  const params = useParams();
  const [search] = useSearchParams();
  const { profile, session, online } = useApp();
  const voice = useVoice();
  const routeMode = params.mode ?? 'tutor';
  const refId = params.refId;

  const setup: ChatSetup | null =
    routeMode === 'scenario'
      ? getScenario(refId ?? '')
        ? { mode: 'scenario', scenario: getScenario(refId ?? '') }
        : null
      : routeMode === 'friend'
        ? { mode: 'friend', personaId: refId ?? (profile.region === 'be' ? 'friend.lien' : 'friend.sanne') }
        : routeMode === 'c'
          ? { mode: 'tutor', conversationId: refId }
          : routeMode === 'tutor'
            ? { mode: 'tutor', personaId: 'tutor.eva', topic: search.get('topic') ?? undefined }
            : null;

  const persona = setup?.personaId ? getPersona(setup.personaId) : undefined;
  const scenario = setup?.scenario;
  const remote = session && online;

  const [level, setLevel] = useState<Level>(profile.level);
  const [messages, setMessages] = useState<Message[]>([]);
  const [task, setTask] = useState<TaskProgress | null>(null);
  const [debrief, setDebrief] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const [title, setTitle] = useState(scenario?.title ?? (persona ? persona.name : 'AI Tutor'));
  const [started, setStarted] = useState(0);

  const conversationId = useRef<string | null>(setup?.conversationId ?? null);
  const local = useRef<{ ctx: OfflineContext } | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef(autoplay);
  autoplayRef.current = autoplay;

  const say = useCallback(
    (text: string, id: string) => {
      if (autoplayRef.current) void speak(text, voice, `msg-${id}`);
    },
    [voice],
  );

  // Start (or resume) the conversation.
  useEffect(() => {
    if (!setup) return;
    let cancelled = false;
    setMessages([]);
    setTask(null);
    setDebrief(null);
    setError(null);
    local.current = null;

    const startLocal = () => {
      const ctx: OfflineContext = {
        mode: setup.mode,
        level,
        correctionStyle: profile.correctionStyle,
        persona,
        scenario,
        topic: setup.topic,
        turnIndex: 0,
      };
      const opening = offlineOpening(ctx);
      local.current = { ctx: { ...ctx, scenarioState: opening.scenarioState } };
      const msg = characterMessage(opening.response);
      setMessages([msg]);
      setTask(opening.response.task);
      say(msg.text, msg.id);
    };

    if (remote && setup.conversationId) {
      api
        .conversation(setup.conversationId)
        .then(({ conversation, messages: history }) => {
          if (cancelled) return;
          setTitle(conversation.title);
          setMessages(
            history.map((m) => ({
              id: m.id,
              role: m.role,
              text: m.text,
              translation: m.translation,
              feedback: m.feedback,
              glossary: m.glossary,
            })),
          );
        })
        .catch(() => !cancelled && setError('Could not load this conversation.'));
    } else if (remote) {
      api
        .createConversation({
          mode: setup.mode,
          level,
          ...(setup.personaId ? { personaId: setup.personaId } : {}),
          ...(scenario ? { scenarioId: scenario.id } : {}),
          ...(setup.topic ? { topic: setup.topic } : {}),
        })
        .then(({ conversation, opening }) => {
          if (cancelled) return;
          conversationId.current = conversation.id;
          const msg = characterMessage(opening);
          setMessages([msg]);
          setTask(opening.task);
          say(msg.text, msg.id);
        })
        .catch(() => {
          if (cancelled) return;
          setNotice('The AI partner is unreachable, so the practice partner is taking over.');
          startLocal();
        });
    } else {
      startLocal();
    }
    return () => {
      cancelled = true;
      stopSpeaking();
    };
    // Restart when the level changes or the learner starts over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, started, routeMode, refId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  if (!setup) {
    return (
      <>
        <Header title="Conversation not found" back="/talk" />
        <Empty title="This conversation doesn't exist." action={<Link to="/talk">Back to Talk</Link>} />
      </>
    );
  }

  const handleTurn = (turn: TurnResponse) => {
    setMessages((list) => {
      const learnerIndex = list.findLastIndex((m) => m.role === 'learner');
      const updated = list.map((m, i) => (i === learnerIndex ? { ...m, feedback: turn.feedback, pending: false } : m));
      return [...updated, characterMessage(turn)];
    });
    if (turn.task) setTask(turn.task);
    if (turn.debrief) setDebrief(turn.debrief);
    if (turn.quotaExceeded) setNotice("You've used today's AI conversations — the practice partner is answering until tomorrow.");
    say(turn.reply.nl, 'latest');
  };

  const send = async (answer: Answer) => {
    if (busy) return;
    setError(null);
    stopSpeaking();
    setMessages((list) => [...list, { id: mid(), role: 'learner', text: answer.text, pending: true }]);

    if (local.current) {
      const { ctx } = local.current;
      const result = offlineReply(ctx, answer.text);
      const nextState: ScenarioEngineState | undefined = result.scenarioState ?? ctx.scenarioState;
      local.current = { ctx: { ...ctx, scenarioState: nextState, turnIndex: ctx.turnIndex + 1 } };
      record(
        turnEvents({
          mode: ctx.mode,
          level,
          text: answer.text,
          inputMode: answer.inputMode,
          latencyMs: answer.latencyMs,
          corrections: result.response.feedback?.corrections ?? [],
          completedScenario:
            scenario && nextState?.completed && !ctx.scenarioState?.completed ? { scenario, state: nextState } : undefined,
        }),
      );
      handleTurn(result.response);
      return;
    }

    if (!conversationId.current) return;
    setBusy(true);
    try {
      const envelope = await api.turn(conversationId.current, {
        text: answer.text,
        inputMode: answer.inputMode,
        latencyMs: answer.latencyMs,
      });
      applyRemote(envelope.events);
      handleTurn(envelope.turn);
    } catch (e) {
      setMessages((list) => list.slice(0, -1));
      setError(
        e instanceof ApiError && e.status === 409
          ? e.message
          : 'Your message could not be sent. Check your connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const currentBeat = scenario && task?.nextTask ? scenario.beats.find((b) => b.task === task.nextTask) : undefined;
  const finished = !!task?.completed;
  const name = scenario?.character.name ?? persona?.name ?? 'Tutor';

  return (
    <div className="stack" style={{ minHeight: '100dvh' }}>
      <Header
        title={title}
        subtitle={scenario ? scenario.goal : persona ? `${persona.city} · ${level}` : `${level}`}
        back="/talk"
        actions={
          <div className="row" style={{ gap: 0 }}>
            <label className="sr-only" htmlFor="level">
              Level
            </label>
            <select
              id="level"
              className="chip"
              value={level}
              disabled={!!setup.conversationId}
              onChange={(e) => setLevel(e.target.value as Level)}
              title="Difficulty: the partner adapts its Dutch to this level"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="icon-btn"
              aria-pressed={autoplay}
              aria-label={autoplay ? 'Turn off automatic audio' : 'Turn on automatic audio'}
              onClick={() => {
                setAutoplay(!autoplay);
                stopSpeaking();
              }}
            >
              {autoplay ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        }
      />

      {scenario && task && (
        <div className="card flat stack" style={{ gap: 6, padding: 12 }}>
          <ProgressBar value={task.progress} label="Scenario progress" accent />
          {!finished && task.nextTask && (
            <div className="small">
              <strong>Your task:</strong> {task.nextTask}
            </div>
          )}
        </div>
      )}
      {!remote && !notice && messages.length <= 1 && (
        <p className="tiny muted" style={{ margin: 0 }}>
          Practice partner (offline, scripted). Sign in for the AI partner.
        </p>
      )}
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}

      <div className="chat" aria-live="polite">
        {messages.map((m) =>
          m.role === 'character' ? (
            <CharacterBubble key={m.id} message={m} name={name} />
          ) : (
            <div key={m.id} className="stack" style={{ gap: 6, alignItems: 'flex-end' }}>
              <div className="bubble learner" lang="nl">
                {m.text}
              </div>
              {m.feedback && (m.feedback.corrections.length > 0 || m.feedback.natural || !m.feedback.understood) && (
                <div style={{ maxWidth: '92%', alignSelf: 'stretch' }}>
                  <FeedbackCard feedback={m.feedback} />
                </div>
              )}
            </div>
          ),
        )}
        {busy && <div className="typing">{name} is typing…</div>}
        <div ref={bottom} />
      </div>

      {error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}

      {finished ? (
        <section className="card tint stack">
          <strong>{task?.achieved || (task && task.progress >= 1) ? 'Scenario complete' : 'Scenario finished'}</strong>
          {debrief && <p style={{ margin: 0 }}>{debrief}</p>}
          <div className="row wrap">
            <button type="button" className="btn primary" onClick={() => setStarted((n) => n + 1)}>
              Try again
            </button>
            <Link to="/talk" className="btn">
              More situations
            </Link>
          </div>
        </section>
      ) : (
        <SpeakOrType
          compact
          onSubmit={(a) => void send(a)}
          disabled={busy}
          hint={currentBeat?.hint}
          placeholder="Typ of spreek…"
        />
      )}
    </div>
  );
}
