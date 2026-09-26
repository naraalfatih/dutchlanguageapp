# 2. Learning science

Every feature in Praat is tied to a mechanism from second-language acquisition
(SLA) or cognitive-psychology research. This document names the principle,
the evidence behind it, and where it appears in the product. The goal is
communicative competence, meaning the ability to understand and be understood in
real situations, so the design leans on research about acquisition, not
engagement.

## 2.1 The core loop

```
   ┌────────────── Comprehensible input ──────────────┐
   │  situation dialogue · listening trainer · friend │
   ▼                                                  │
 Noticing  ──►  Guided output  ──►  Feedback  ──►  Spaced retrieval
 (glosses,      (speaking task,     (recast +       (FSRS review of
  grammar,       simulator turn,     explanation,     chunks, personal
  culture)       friend chat)        mistake diary)   mistake drills)
                                         │
                                         ▼
                                 Skill model update  ──►  Personal plan
```

## 2.2 Principles and where they live

### Comprehensible input (Krashen, 1982)
Acquisition happens when learners understand messages slightly above their
current level (*i + 1*).
**In Praat:** every lesson opens with a situation dialogue at the lesson's
CEFR level, with an English line available only on tap. The Listening Trainer
has slow and normal speed. The AI's language level adapts to the learner's
estimated level, and Dutch Friend Mode speaks one step above the learner's level
while glossing slang.

### Output and pushed output (Swain, 1985)
Producing language forces learners to notice gaps between what they want to say
and what they can say, and it builds the procedural knowledge that fluent speech needs.
**In Praat:** every lesson contains a **speaking task** (spoken or typed), review exercises
are mostly production (translate, fill, respond) rather than recognition, and
the Life Simulator requires free responses to realistic prompts.

### Interaction and negotiation of meaning (Long, 1996)
Conversation with feedback, including clarification requests and reformulations, drives acquisition.
**In Praat:** AI Tutor, Dutch Friend Mode and the Life Simulator are
conversational. The character reacts to *meaning first* (the conversation continues)
and feedback comes alongside, not as a blocking error screen.

### Noticing (Schmidt, 1990)
Learners acquire what they consciously notice in input.
**In Praat:** tap-to-gloss words, highlighted grammar patterns in dialogues,
"Why?" explanations on every correction, and the **Mistake Diary**, which makes
a learner's own recurring patterns visible.

### Corrective feedback that works (Lyster & Ranta, 1997; Li, 2010)
Recasts alone are often not noticed. Explicit feedback with a short
metalinguistic explanation produces larger and more durable gains.
**In Praat:** each correction has three parts: (1) the natural reformulation,
(2) a one-sentence reason, and (3) the pattern it belongs to, for example
*"Word order (V2): after a time phrase the verb comes second."* The
correction-style setting (gentle / thorough) controls how many minor issues are shown,
because too much correction raises anxiety.

### Retrieval practice (Roediger & Karpicke, 2006)
Actively recalling information strengthens memory more than re-reading does.
**In Praat:** reviews ask the learner to produce the Dutch (from English
meaning plus context), not to recognise it. Lessons end with retrieval, not a summary.

### Spacing, via FSRS (Ebbinghaus, 1885; Cepeda et al., 2006; Ye, 2022)
Distributed practice beats massed practice. The optimal gap grows as memory stabilises.
**In Praat:** the scheduler implements **FSRS-4.5** (Free Spaced Repetition
Scheduler), a model of memory *difficulty*, *stability* and *retrievability*.
Items are scheduled so that predicted recall is about 90% at review time. That
keeps reviews effortful but successful, which is the "desirable difficulty" zone. See
`packages/core/src/srs/fsrs.ts`.

### Chunks and the lexical approach (Lewis, 1993; Wray, 2002)
Fluent speakers rely on thousands of prefabricated chunks
(*"Heb je zin om…"*, *"Het maakt niet uit"*, *"Mag ik even…"*).
**In Praat:** the unit of learning is a **phrase in context**, not an isolated
word. *"Ik ga elke dag met de fiets naar mijn werk"* is taught instead of
*"fiets = bicycle"*. Spaced repetition cards are chunks with a context sentence and audio.

### Frequency-first vocabulary (Nation, 2006; Keuleers et al., 2010)
A small core of high-frequency words covers most everyday speech.
**In Praat:** vocabulary carries a frequency band (core 500 / 2,000 / 5,000 /
beyond, approximated from SUBTLEX-NL subtitle frequencies), and early levels
prioritise the core band. Low-frequency words appear only when a situation demands them
(*huurcontract*, *huisarts*).

### Task-based language teaching (Ellis, 2003; Long, 2015)
Learning is organised around real-world tasks with a communicative outcome.
**In Praat:** the **Dutch Life Simulator**. Each scenario has a
goal (*"Get an appointment at the GP for tomorrow"*) and beats with
intents. Success means the task was achieved, not that the grammar was perfect.
Can-do statements are marked *demonstrated* only when the matching task succeeds.

### Skill acquisition and fluency (DeKeyser, 2007; Nation's 4/3/2)
Knowledge becomes automatic through repeated, meaningful practice under mild
time pressure.
**In Praat:** repeated scenarios with rising expectations, a "speak again,
faster" option, and shadowing in the Pronunciation Coach. Response latency and
utterance length feed the *speaking fluency* estimate.

### Perception before production (Flege, 1995; Thomson, 2018)
Learners often can't produce a contrast they can't hear. High-variability
phonetic training (HVPT, with many voices and many words) improves both perception and production.
**In Praat:** the Pronunciation Coach starts every sound with **minimal-pair
listening** (*ruim – rijm*, *deur – door*, *zon – zoon*) and varied voices
before recording and feedback.

### Intelligibility over accent (Munro & Derwing, 1995; Levis, 2005)
A foreign accent is compatible with being perfectly understood. Learners should
target intelligibility and comprehensibility, not a native accent.
**In Praat:** pronunciation feedback is based on whether a speech recogniser
understood the learner, word by word. Problem sounds are prioritised by how
much they hurt understanding (*ui/ou*, short/long vowels, *g/k*), not by how
"foreign" they sound.

### Interleaving and desirable difficulties (Bjork, 1994; Rohrer & Taylor, 2007)
Mixing problem types and making retrieval slightly hard improves transfer.
**In Praat:** reviews interleave items from different lessons and patterns,
mistake drills mix the learner's own sentences with new ones, and the scheduler
aims for about 90% predicted recall, not 100%.

### Generation effect (Slamecka & Graf, 1978)
Information you generate yourself is remembered better.
**In Praat:** "Fix your own sentence" drills reuse the learner's own erroneous
sentences from conversations. Personal vocabulary lists are built from words the learner looked up.

### Dual coding (Paivio, 1986)
Pairing verbal with visual or auditory information improves recall.
**In Praat:** every phrase has audio. Concrete nouns carry an image or icon
slot, and dialogues show speakers and settings.

### Anxiety, willingness to communicate and motivation
(Horwitz et al., 1986; MacIntyre et al., 1998; Deci & Ryan, 2000)
Foreign-language anxiety suppresses speaking. Autonomy, competence and
relatedness sustain motivation better than extrinsic rewards.
**In Praat:** private rehearsal with an AI before real conversations; corrections
framed as *"understood, and here is the natural version"*; learner-chosen goals (moving,
work, family…); honest competence feedback ("you can now do X"); and no streak
guilt, leaderboards or loss-aversion notifications.

## 2.3 The learner model

Praat keeps a probabilistic estimate for six skills: **speaking, listening,
vocabulary, grammar, pronunciation and fluency**. Each is placed on a continuous
CEFR scale (A0 = 0 … C1 = 5, C2 = 6).

- Every scored activity produces an *evidence* record: skill, item level, score between 0 and 1.
- The update is Elo-style (a logistic item-response model):
  `p = σ(k·(θ − d))`, `θ ← θ + K·(s − p)`, where the step size `K` shrinks as evidence accumulates.
- Mistake patterns are tracked separately with **errors per 100 produced
  sentences**, compared between the last 14 days and the period before, plus
  accuracy on targeted drills.

The **plan generator** compares skills with each other and with the learner's
goal. For example, it detects "listening ≫ speaking" and produces an
explanation the learner can read:

> *"You understand Dutch well but hesitate while speaking. Today's plan leans on
> conversation: a Life Simulator scenario and a chat with your Dutch friend."*

Implementation: `packages/core/src/learner/`.

## 2.4 What we measure (and show)

| We show | Because |
|---|---|
| Can-do statements *demonstrated* in tasks | It is the closest proxy for real-life ability |
| Sentences spoken/written in Dutch this week | Output drives acquisition |
| Normal-speed listening accuracy | Real life is not slowed down |
| Errors per 100 sentences, per pattern | Accuracy that transfers |
| Phrases in long-term memory (predicted recall ≥ 90%) | Retention, not exposure |

We don't show XP, leagues or streak counters.

## References

- Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings.
- Cepeda, N. J., et al. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin*.
- Deci, E. L., & Ryan, R. M. (2000). Self-determination theory. *American Psychologist*.
- DeKeyser, R. (2007). Skill acquisition theory. In *Theories in SLA*.
- Ellis, R. (2003). *Task-based Language Learning and Teaching*. OUP.
- Flege, J. E. (1995). Second language speech learning: Theory, findings, and problems.
- Horwitz, E. K., Horwitz, M. B., & Cope, J. (1986). Foreign language classroom anxiety. *MLJ*.
- Keuleers, E., Brysbaert, M., & New, B. (2010). SUBTLEX-NL: A new measure for Dutch word frequency. *Behavior Research Methods*.
- Krashen, S. (1982). *Principles and Practice in Second Language Acquisition*.
- Levis, J. (2005). Changing contexts and shifting paradigms in pronunciation teaching. *TESOL Quarterly*.
- Lewis, M. (1993). *The Lexical Approach*.
- Li, S. (2010). The effectiveness of corrective feedback in SLA: A meta-analysis. *Language Learning*.
- Long, M. (1996). The role of the linguistic environment in SLA. / Long, M. (2015). *SLA and Task-Based Language Teaching*.
- Lyster, R., & Ranta, L. (1997). Corrective feedback and learner uptake. *SSLA*.
- MacIntyre, P. D., et al. (1998). Conceptualizing willingness to communicate in a L2. *MLJ*.
- Munro, M. J., & Derwing, T. M. (1995). Foreign accent, comprehensibility, and intelligibility. *Language Learning*.
- Nation, I. S. P. (2006). How large a vocabulary is needed for reading and listening? *CMLR*.
- Paivio, A. (1986). *Mental Representations: A Dual Coding Approach*.
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. *Psychological Science*.
- Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science*.
- Schmidt, R. (1990). The role of consciousness in second language learning. *Applied Linguistics*.
- Slamecka, N. J., & Graf, P. (1978). The generation effect. *JEP: Human Learning and Memory*.
- Swain, M. (1985). Communicative competence: Some roles of comprehensible input and output.
- Thomson, R. I. (2018). High variability [pronunciation] training (HVPT). *Journal of Second Language Pronunciation*.
- Wray, A. (2002). *Formulaic Language and the Lexicon*.
- Ye, J., Su, J., & Cao, Y. (2022). A stochastic shortest path algorithm for optimizing spaced repetition scheduling. *KDD*. (FSRS)
