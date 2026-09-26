# 1. Product vision

> **Praat** (Dutch: *talk*, as in *"Praat je Nederlands?"*)
>
> Help people actually speak and understand Dutch in real life.

## The problem

Most language apps optimise for what is easy to measure: taps, streaks, lessons
"completed". People finish hundreds of lessons and then freeze when a cashier
asks *"Wil je de bon?"*, or when a colleague switches to English because the
learner hesitated.

Dutch learners have specific pain points that generic apps ignore:

| Pain point | Why it matters |
|---|---|
| **Dutch people switch to English.** | Learners get few chances to practise. They need a safe place to build speed and confidence *before* real conversations. |
| **Spoken Dutch ≠ textbook Dutch.** | *"Hoe gaat het met u?"* is correct but rare between friends; *"Hoe gaat-ie?"*, *"Alles goed?"*, and particles like *hoor, toch, even, maar, wel* carry a lot of meaning and are rarely taught. |
| **Listening is hard.** | Reduced forms (*'t*, *'k*, dropped final *-n*), fast speech and regional accents (Randstad, Brabant, Flanders). |
| **A few grammar patterns cause most errors.** | V2 word order, verb-final subordinate clauses, *de/het*, *hebben/zijn* in the perfect tense, separable verbs. |
| **Culture is part of the language.** | Directness, agenda culture, the birthday circle and going Dutch shape *what* you say, not only *how*. |

## Who it is for

| Persona | Goal | What success looks like |
|---|---|---|
| **Amira, 31, moving to Rotterdam for work** | Handle landlord, gemeente, doctor and colleagues | Registers at city hall and makes a GP appointment in Dutch |
| **Lukas, 22, exchange student in Leuven** | Social life, understand lectures | Joins a group conversation at a party without switching to English |
| **Priya, 40, product manager in Amsterdam** | Workplace Dutch | Follows a stand-up and gives an opinion in a meeting |
| **Tom, 58, retiring to Zeeland** | Everyday life, neighbours | Small talk with neighbours, supermarket, pharmacy |
| **Sofia, 27, Dutch partner** | Family gatherings | Follows fast family conversation and jokes at a birthday |
| **Daniel, 35, culture enthusiast / traveller** | Travel, media, culture | Orders food, asks directions, enjoys Dutch podcasts |

## What success means

We measure success with one question:

> **Can this person communicate naturally in Dutch?**

That question breaks down into observable outcomes, not activity counts:

1. **Can-do statements verified by performance.** CEFR descriptors (for example
   *"I can make an appointment at the GP"*) are marked as *demonstrated* only
   when the learner completes the matching simulator task in Dutch. Opening a
   lesson doesn't count.
2. **Speaking output.** Sentences produced, average utterance length, and the
   share of turns answered in Dutch without a hint.
3. **Listening at natural speed.** Accuracy on normal-speed audio, not only on slowed-down audio.
4. **Error rate per 100 sentences** for each recurring mistake pattern, falling over time.
5. **Intelligibility.** How much of what the learner says a speech recogniser
   understands. Intelligibility matters more than accent (Munro & Derwing).
6. **Long-term retention.** Predicted recall of vocabulary and chunks from the spaced-repetition model.

What we deliberately **don't** optimise:

- Streak length, daily-open counts, XP and leagues
- "Lessons completed" as a headline number
- Time in app for its own sake (a 10-minute session that ends with a real
  conversation is better than a 40-minute tapping session)

## Product principles

1. **Speaking first.** Almost every activity ends with the learner producing
   Dutch, spoken or typed. Recognition (multiple choice) is used sparingly and
   only as a stepping stone.
2. **Real situations, real language.** Every lesson starts from a situation
   the learner will actually meet. Vocabulary is taught in sentences and chunks, not as word pairs.
3. **Natural over textbook.** We teach what Dutch people actually say, label
   register (formal/neutral/informal), and explain who says what and when.
4. **Mistakes are data, not failure.** Errors are captured automatically,
   explained kindly, and turned into personal practice. We say *"People will
   understand you, and here is how a Dutch speaker would say it"* rather than
   marking an answer *wrong*.
5. **Culture is part of the language.** Culture notes explain why an
   expression is used, not only what it means.
6. **Respect the learner.** Adult tone, calm design, no cartoon mascots, no
   guilt notifications. Honest progress, including where the learner is stuck.
7. **Works in real life.** Mobile-first, one-handed use, offline lessons, audio-first, fast.

## The product at a glance

| Area | What it does |
|---|---|
| **Home** | A daily plan generated from the learner's skill profile, with the reason for each item ("You understand well but hesitate while speaking, so today is conversation-heavy") |
| **Learn** | CEFR curriculum A0 → C1. Every lesson has a situation, vocabulary in context, native-style audio, pronunciation, a listening challenge, a speaking task, grammar, culture, and review |
| **Practice** | Spaced review of phrases, Pronunciation Coach (G, CH, UI, EU, R, vowels, minimal pairs), Listening Trainer (slow/normal speed, transcripts, slang notes), personal Mistake Drills, and Speak Like a Dutch Person |
| **Talk** | AI Tutor (corrections with explanations), **Dutch Friend Mode** (casual texting with a Dutch friend who explains slang), and the **Dutch Life Simulator** (renting, gemeente, GP, supermarket, job interview…) |
| **Culture** | Direct communication, cycling, social rules, humour, regional differences (including Flanders), traditions, food, history |
| **Progress** | "What you can do in Dutch" (verified can-do statements), skill profile, the Mistake Diary dashboard, retention, speaking output |
| **Profile** | Goals, region (Netherlands / Flanders), voice, correction style, account and sync, data export and deletion |

## Non-goals (for v1)

- Replacing human teachers or official exam preparation (inburgeringsexamen and
  Staatsexamen NT2 prep is on the roadmap as a separate track)
- Social features or leaderboards
- Languages other than Dutch
