# 3. User experience design

## 3.1 Design stance

*A calm, adult, audio-first tutor in your pocket.*

- **Tone:** a patient Dutch friend who is also a good teacher: direct, warm, a little dry.
- **Visual language:** clean, generous white space, one strong accent colour,
  no mascots, no confetti. Typography carries the hierarchy.
- **Interaction:** one primary action per screen, thumb-reachable, audio
  plays on tap, the mic is always one tap away in speaking contexts.

## 3.2 Information architecture

```
Bottom navigation (7 destinations, as specified)
├── Home ········ Today's plan (+ why), continue, reviews due, expression of the day
├── Learn ······· CEFR path A0 → C1 → units → lesson player
├── Practice ···· Review (spaced) · Pronunciation Coach · Listening Trainer
│                 · Mistake Drills · Speak Like a Dutch Person
├── Talk ········ AI Tutor · Dutch Friend Mode · Dutch Life Simulator
├── Culture ····· Topics → article (+ key phrases with audio, "try it" scenario)
├── Progress ···· Can-do (demonstrated) · Skill profile · Mistake Diary · Retention
└── Profile ····· Goals · Level · Region · Voice · Corrections · Account/sync · Data
```

**Bottom-bar decision.** The brief lists seven destinations. Material and
Apple guidance usually cap bottom bars at five, but seven fit on the smallest
supported width (360 dp): each item is about 51 dp wide, which is above the
48 dp minimum touch target. We use short labels: *Home, Learn, Practice,
Talk, Culture, Progress, Profile*. "AI Conversations" is labelled **Talk**
because the full label does not fit and "Talk" describes the action. Icons
are always shown with labels because icon-only navigation performs worse
in usability tests. Below 340 dp the labels hide and the icons get
`aria-label`s.

## 3.3 Key flows

### First run (under 2 minutes, no account needed)

1. **Welcome.** *"Learn to actually speak Dutch."* Primary: *Start*. Secondary: *I have an account*.
2. **Why Dutch?** Moving / Work / Study / Travel / Partner & family / Culture (multi-select). This drives scenario priority.
3. **Where?** Netherlands / Flanders (Belgium). This sets the default voice, regional notes and greetings.
4. **Your level.** *Brand new* · *I know some words* · *Simple conversations* ·
   *I get by* · *Fairly fluent*. This seeds the skill model (low confidence).
5. **Daily time.** 5 / 10 / 20 / 30 min. This sets the plan size. It isn't a streak goal.
6. **Mic check.** An explanation of why we listen, then a request for permission.
   Say *"Hallo, ik heet …"*. This is the first speaking moment within a minute of starting.
7. **Your plan** with the first lesson highlighted.

Guest progress lives on the device. Creating an account later uploads the
local event log, so nothing is lost.

### Daily session (Home)

```
┌──────────────────────────────┐
│ Goedemiddag, Amira       (A) │  ← avatar → Profile
│                              │
│ Today · 20 min               │
│ "You understand well but     │  ← plan rationale (why)
│  hesitate when speaking…"    │
│ ┌──────────────────────────┐ │
│ │ ▶ Review 14 phrases  4m  │ │  ← due FSRS cards
│ ├──────────────────────────┤ │
│ │ 🗣 At the GP (simulator) 6m│ │  ← weakest skill × goals
│ ├──────────────────────────┤ │
│ │ ✎ Fix: word order (V2) 3m│ │  ← top mistake pattern
│ ├──────────────────────────┤ │
│ │ 📘 A2 · Making plans   7m│ │  ← curriculum next
│ └──────────────────────────┘ │
│ Expression of the day        │
│ "Het maakt niet uit"  ▶      │
└──────────────────────────────┘
[Home][Learn][Practice][Talk][Culture][Progress][Profile]
```

### Lesson player

A lesson is a vertical sequence of **steps** with a slim progress bar and a
persistent *Close*. Each step has one primary button at the bottom (thumb zone):

1. **Situation.** The setting plus a dialogue, one bubble per line, ▶ on each, tap for translation. *Play all* at normal or slow speed.
2. **Words in context.** Chunk cards (Dutch sentence, audio, meaning, note). Ones marked *Save* go into spaced review.
3. **Pronunciation.** The focus sound, with a listen → repeat → record → feedback loop.
4. **Listening challenge.** Audio only first (transcript hidden), then questions, then transcript.
5. **Grammar.** One pattern, short explanation, 2–4 examples, one common mistake.
6. **Speaking task.** A prompt, 🎤 or ⌨. The answer is evaluated for task completion and naturalness and gets a model answer.
7. **Culture.** A short note on why it's said this way.
8. **Review.** 4–6 production exercises. Mistakes go to the Mistake Diary.
9. **Summary.** What you can now do (the can-do), phrases saved, patterns to watch.

### Talk (conversation UI)

- Chat bubbles: the character on the left, the learner on the right.
- Every character bubble has ▶ (TTS) and *Show English*. Words can be tapped for glosses.
- **Feedback card** under the learner bubble when relevant:
  `✓ Understood · Natural: "Ik heet Amira." · Why: "heten" = to be called… · [Save]`
- Composer: large 🎤 button (hold or tap to talk), text field, and a hint button that suggests a starter chunk.
- Header: character, level chip (A1 … C1, adjustable), mode.
- Simulator header shows the **task goal** and a beat progress indicator. Completion screen: task achieved? plus cultural debrief.

### Mistake Diary

A dashboard of patterns sorted by impact, as in the brief:

```
Your common mistakes
1. Word order (V2)             Improved 35%   [Practise]
2. de / het                    Needs practice [Practise]
3. Pronunciation: G sound      Improving      [Practise]
```

Tapping a pattern shows the explanation, your own past sentences (original →
corrected), trend and a *Practise* drill made from your sentences plus new ones.

## 3.4 Design system

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F7F6F2` | `#121417` | App background (warm off-white) |
| `--surface` | `#FFFFFF` | `#1B1E23` | Cards, sheets |
| `--ink` | `#16181D` | `#ECEDEF` | Primary text |
| `--ink-2` | `#565B66` | `#A5AAB4` | Secondary text |
| `--brand` | `#1F3A93` | `#8FA8FF` | Delft blue: primary actions, links |
| `--accent` | `#E8702A` | `#FF9A5C` | Orange: used sparingly (mic, highlights) |
| `--ok` / `--warn` / `--bad` | green / amber / red | tuned | Feedback states (never colour-only) |

- **Type:** system font stack (fast, native feel), 16 px base, 1.5 line height.
  Dutch text is shown slightly larger than English glosses so the eye lands on Dutch first.
- **Spacing:** 4-pt grid; cards 16 px padding; 12 px radius.
- **Touch:** minimum 48 × 48 px targets; primary buttons are full-width in the bottom 1/3.
- **Motion:** 150–200 ms ease-out; respects `prefers-reduced-motion`.
- **Icons:** Lucide line icons (consistent 1.75 stroke).

## 3.5 Audio-first interaction

- **Play**: tap ▶. Long-press ▶ plays slowly. The default speed is normal because learners must get used to real speed; slow speed is always one tap away.
- **Speak**: tap 🎤 to start and stop, with a live transcript and a visible level meter. We never auto-submit until the learner stops.
- **Shadowing**: listen, record yourself, and compare A/B with the model.
- **Graceful degradation**: no speech recognition → type instead (always
  available). No Dutch TTS voice → the transcript is shown and the missing voice is explained, with install instructions for iOS and Android.

## 3.6 Accessibility

- WCAG 2.2 AA contrast in both themes; state is never conveyed by colour alone (icons and text).
- Every audio has a transcript. Every mic task has a typed alternative.
- Full keyboard and screen-reader support: semantic landmarks, `aria-live` for feedback, labelled icon buttons.
- Dynamic type: layout reflows up to 200% zoom. No text in images.
- `lang="nl"` on Dutch text so screen readers switch pronunciation.
- Reduced motion honoured. There are no time limits on answers.

## 3.7 Offline and error states

- Lessons, culture, pronunciation and listening content ship in the app bundle
  and are precached by the service worker, so the full curriculum works in airplane mode.
- Progress is written locally first (IndexedDB) and synced when online.
- Talk works offline in **practice mode** with scripted scenarios and rule-based
  feedback. AI conversations need a connection and an account; the UI says so plainly.
- Empty states explain what to do next ("No mistakes recorded yet. Have a
  conversation in Talk and we'll collect them for you.").
