import { defineLesson, i, line } from '../helpers.js';

export const a2Lessons = [
  defineLesson({
    id: 'a2.small-talk',
    level: 'A2',
    unit: 'Daily conversations',
    order: 1,
    title: 'Small talk: the weather and the weekend',
    subtitle: 'Keep a casual conversation going — and say what you did',
    canDo: 'I can make small talk about the weather and the weekend, and talk about what I did.',
    minutes: 12,
    situation: {
      setting: 'Monday morning at the office. Your colleague Ruben is making coffee.',
      dialogue: [
        line('Ruben', 'Goedemorgen! Lekker weekend gehad?', 'Good morning! Had a nice weekend?'),
        line('You', 'Ja, heel leuk! Ik ben zaterdag naar het strand geweest.', 'Yes, really nice! I went to the beach on Saturday.'),
        line('Ruben', 'O, lekker! Het was ook zulk mooi weer, hè?', "Oh, lovely! The weather was so nice, wasn't it?"),
        line('You', 'Ja, heerlijk. Maar zondag heeft het de hele dag geregend.', 'Yes, wonderful. But on Sunday it rained all day.'),
        line('Ruben', 'Typisch. Wat heb je zondag gedaan?', 'Typical. What did you do on Sunday?'),
        line('You', 'Niet veel. Ik heb een film gekeken en gekookt. En jij?', 'Not much. I watched a film and cooked. And you?'),
        line('Ruben', 'Ik heb met vrienden gegeten. Heel gezellig, maar ik ben nu wel moe, haha.', "I had dinner with friends. Very nice, but I'm tired now, haha."),
      ],
    },
    vocabulary: [
      ['lekker-weekend-gehad', 'Lekker weekend gehad?', 'Had a nice weekend?', 'Hoi! Lekker weekend gehad?', 'Hi! Had a nice weekend?', { note: "The Monday-morning classic. On Friday: 'Fijn weekend!'" }],
      ['wat-heb-je-gedaan', 'Wat heb je gedaan?', 'What did you do?', 'Wat heb je gisteren gedaan?', 'What did you do yesterday?', { note: 'Dutch conversation uses the perfect tense (heb … gedaan) for most past events.' }],
      ['mooi-weer', 'mooi weer', 'nice weather', 'Wat een mooi weer vandaag!', 'What lovely weather today!', { note: 'Also: lekker weer, heerlijk weer. Bad weather: rotweer (informal).' }],
      ['het-regent', 'Het regent', "It's raining", 'Het regent al de hele dag.', 'It has been raining all day.', { note: "'Het regent pijpenstelen' = it's raining cats and dogs." }],
      ['typisch', 'Typisch!', 'Typical!', 'Het is weekend en het regent. Typisch!', "It's the weekend and it's raining. Typical!", { register: 'informal' }],
      ['niet-veel', 'Niet veel', 'Not much', 'Wat heb je gedaan? – Niet veel, gewoon thuis.', 'What did you do? – Not much, just stayed home.'],
      ['he', '…, hè?', "…, isn't it?", 'Koud vandaag, hè?', "Cold today, isn't it?", { note: "The Dutch tag question invites agreement: 'Ja, echt!'" }],
      ['gezellig', 'gezellig', 'cosy, sociable, fun', 'Het was heel gezellig bij Anna.', "It was really nice at Anna's.", { note: 'The famous untranslatable word: a warm, relaxed, together feeling. A café, an evening or a person can be gezellig.' }],
    ],
    pronunciation: {
      focus: 'w',
      tip: "W: rest your upper teeth lightly on your lower lip, with no buzz. 'Weekend', 'weer', 'wat' — not an English 'w'.",
      items: [
        { nl: 'Wat een mooi weer!', en: 'What lovely weather!' },
        { nl: 'Lekker weekend gehad?', en: 'Had a nice weekend?' },
        { nl: 'We zijn naar het water gegaan.', en: 'We went to the water.' },
      ],
    },
    listening: {
      intro: 'Two neighbours chat over the fence. What did Marja do this weekend?',
      lines: [
        line('Henk', 'Hé Marja, alles goed?', 'Hey Marja, everything okay?'),
        line('Marja', 'Ja hoor! Ik ben dit weekend bij mijn dochter in Groningen geweest.', 'Yes! This weekend I visited my daughter in Groningen.'),
        line('Henk', 'O, leuk. Met de trein?', 'Oh, nice. By train?'),
        line('Marja', 'Ja, twee uur in de trein. Maar het was de moeite waard: ze heeft een nieuw huis.', 'Yes, two hours on the train. But it was worth it: she has a new house.'),
        line('Henk', 'Wat fijn voor haar!', 'How nice for her!'),
      ],
      questions: [
        { type: 'choice', prompt: 'Where was Marja this weekend?', options: ['At home', 'With her daughter in Groningen', 'At the beach'], answer: 1 },
        { type: 'choice', prompt: 'Why was the trip worth it?', options: ['Her daughter has a new house', 'The weather was nice', 'She got a new job'], answer: 0 },
      ],
    },
    speaking: {
      prompt: "A colleague asks 'Lekker weekend gehad?'. Tell them two things you did, then ask about their weekend.",
      mustInclude: [
        i('did', 'Say what you did (perfect tense)', 'heb|ben|hebben|zijn'),
        i('askback', 'Ask back', 'en jij|en u|jouw weekend|jij gedaan|je gedaan'),
      ],
      modelAnswers: [
        'Ja, leuk! Ik heb met vrienden gegeten en ik ben naar de markt geweest. En jij?',
        'Heel gezellig! Ik ben zaterdag gaan fietsen en zondag heb ik lekker niks gedaan. Wat heb jij gedaan?',
      ],
      hints: ['Ik heb … gedaan.', 'Ik ben naar … geweest.', 'En jij?'],
    },
    grammar: {
      title: 'The perfect tense: heb … gedaan',
      explanation:
        "In conversation Dutch usually talks about the past with the **perfect**: **hebben/zijn** + a **past participle** at the end. Regular participles: **ge** + stem + **t/d** (*werken → gewerkt, wonen → gewoond*; stems ending in t, k, f, s, ch, p take -t — remember *'t kofschip*). Many frequent verbs are irregular: *doen → gedaan, eten → gegeten, zien → gezien*. Most verbs use **hebben**; verbs of movement to a place or change of state use **zijn**: *Ik ben naar huis gegaan.*",
      examples: [
        { nl: 'Ik heb gewerkt.', en: 'I worked / have worked.', highlight: 'heb … gewerkt' },
        { nl: 'We hebben pizza gegeten.', en: 'We ate pizza.', highlight: 'hebben … gegeten' },
        { nl: 'Ze is naar Gent gegaan.', en: 'She went to Ghent.', highlight: 'is … gegaan' },
        { nl: 'Wat heb je gedaan?', en: 'What did you do?', highlight: 'heb … gedaan' },
      ],
      commonMistake: { wrong: 'Ik heb naar het strand gegaan.', right: 'Ik ben naar het strand gegaan.', why: "'Gaan' (movement to a place) takes zijn." },
    },
    culture: {
      title: 'Small talk, Dutch style',
      body: "Dutch small talk is short and practical: the weather, the weekend, traffic, holidays. People ask 'Lekker weekend gehad?' on Monday and wish 'Fijn weekend!' on Friday. Answers can be honest — 'Nou, niet echt' (well, not really) is a perfectly fine reply. Long compliments or over-the-top enthusiasm can sound insincere; 'Leuk!' and 'Gezellig!' do the job.",
    },
    review: [
      { type: 'fill', patternId: 'perfect-zijn', sentence: 'Ik ___ naar het strand gegaan.', en: 'I went to the beach.', accept: ['ben'] },
      { type: 'fill', sentence: 'Wat ___ je gisteren gedaan?', en: 'What did you do yesterday?', accept: ['heb'] },
      { type: 'translate', prompt: 'We ate with friends.', accept: ['We hebben met vrienden gegeten', 'Wij hebben met vrienden gegeten', 'We aten met vrienden', 'Wij aten met vrienden'] },
      { type: 'choose', prompt: "'Koud vandaag, hè?' — the most natural reply:", options: ['Ja, echt!', 'Ik ben koud.', 'Nee, hè.'], answer: 0 },
      { type: 'order', patternId: 'word-order-v2', en: 'On Saturday I went to the market.', words: ['Zaterdag', 'ben', 'ik', 'naar', 'de', 'markt', 'gegaan'] },
      { type: 'respond', situation: "It's Friday afternoon. A colleague leaves: 'Fijn weekend!' Reply and say what you're going to do.", npc: { nl: 'Fijn weekend!', en: 'Have a nice weekend!' }, intents: [i('wish', 'Wish them the same', 'jij ook|insgelijks|fijn weekend|u ook'), i('plan', "Say what you're going to do", 'ga|gaan')], modelAnswers: ['Jij ook! Ik ga naar mijn ouders.', 'Dank je, jij ook! Ik ga zaterdag fietsen.'] },
    ],
  }),

  defineLesson({
    id: 'a2.work',
    level: 'A2',
    unit: 'Work',
    order: 2,
    title: 'At work: your job and colleagues',
    subtitle: 'Describe your job, your workplace and a working day',
    canDo: 'I can describe my job and my working day, and chat with colleagues.',
    minutes: 12,
    situation: {
      setting: 'Your first day at a logistics company in Tilburg. Your manager Ingrid shows you around.',
      dialogue: [
        line('Ingrid', 'Welkom! Ik ben Ingrid, je leidinggevende. Zeg maar gewoon Ingrid.', "Welcome! I'm Ingrid, your manager. Just call me Ingrid."),
        line('You', 'Dank je! Leuk om hier te beginnen.', 'Thanks! Great to be starting here.'),
        line('Ingrid', 'Dit is je bureau. En daar is de koffieautomaat — het belangrijkste apparaat van het kantoor.', "This is your desk. And there's the coffee machine — the most important device in the office."),
        line('You', 'Haha. Hoe laat beginnen jullie meestal?', 'Haha. What time do you usually start?'),
        line('Ingrid', "De meeste mensen beginnen om half negen. Op vrijdag werken veel collega's thuis.", 'Most people start at half past eight. On Fridays many colleagues work from home.'),
        line('You', 'En hoe laat is de lunch?', 'And what time is lunch?'),
        line('Ingrid', 'Rond half één. We lunchen samen in de kantine. Neem gerust je eigen boterhammen mee!', 'Around half past twelve. We have lunch together in the canteen. Feel free to bring your own sandwiches!'),
      ],
    },
    vocabulary: [
      ['ik-werk-als', 'Ik werk als …', 'I work as …', 'Ik werk als programmeur bij een bank.', 'I work as a programmer at a bank.', { note: "'Als' + job (no article); 'bij' + company." }],
      ['leidinggevende', 'de leidinggevende', 'the manager', 'Mijn leidinggevende is heel direct.', 'My manager is very direct.', { article: 'de', band: 3, note: 'Also: de manager, de baas (informal).' }],
      ['collega', 'de collega', 'the colleague', "Mijn collega's zijn heel aardig.", 'My colleagues are very nice.', { article: 'de' }],
      ['thuiswerken', 'thuiswerken', 'to work from home', 'Op maandag werk ik thuis.', 'On Mondays I work from home.', { band: 2 }],
      ['parttime', 'Ik werk parttime', 'I work part-time', 'Ik werk parttime, vier dagen per week.', 'I work part-time, four days a week.', { note: 'Very common in the Netherlands — for men and women, and in senior jobs too.' }],
      ['vergadering', 'de vergadering', 'the meeting', 'Ik heb om tien uur een vergadering.', 'I have a meeting at ten.', { article: 'de' }],
      ['zeg-maar-je', 'Zeg maar je', "Just say 'je'", "U mag ook 'je' zeggen, hoor. Zeg maar je!", "You can use 'je' too. Just say 'je'!", { note: 'An invitation to switch from u to je. Very common at work.' }],
      ['lunchen', 'lunchen', 'to have lunch', 'We lunchen om half één in de kantine.', 'We have lunch at half past twelve in the canteen.'],
    ],
    pronunciation: {
      focus: 'ui',
      tip: "UI in 'thuis' (home): rounded lips, between 'ow' and 'oy'. The 'th' is just a 't'.",
      items: [
        { nl: 'Ik werk vaak thuis.', en: 'I often work from home.' },
        { nl: 'Op vrijdag werk ik thuis.', en: 'On Fridays I work from home.' },
        { nl: 'We lunchen buiten.', en: 'We have lunch outside.' },
      ],
    },
    listening: {
      intro: "A colleague explains this week's schedule. When is the team meeting?",
      lines: [
        line('Sander', 'Even een update over deze week.', 'Just a quick update about this week.'),
        line('Sander', 'Het teamoverleg is dinsdag om tien uur, niet maandag.', 'The team meeting is on Tuesday at ten, not Monday.'),
        line('Sander', 'Donderdag komt de klant uit Duitsland. Kunnen jullie dan allemaal op kantoor zijn?', 'On Thursday the client from Germany is coming. Can you all be in the office then?'),
        line('Sander', 'En vrijdag is er een borrel voor Mirjam, want ze gaat met pensioen.', "And on Friday there are drinks for Mirjam, because she's retiring."),
      ],
      questions: [
        { type: 'choice', prompt: 'When is the team meeting?', options: ['Monday at ten', 'Tuesday at ten', 'Thursday at ten'], answer: 1 },
        { type: 'choice', prompt: 'Why is there a borrel on Friday?', options: ["It's Mirjam's birthday", 'Mirjam is retiring', 'A client is visiting'], answer: 1 },
      ],
    },
    speaking: {
      prompt: 'Describe your job (or studies): what you do, where, and one detail about your working day.',
      mustInclude: [
        i('job', 'Say what you do', 'werk|ben|studeer|doe'),
        i('detail', 'Give a detail (place, time or colleagues)', 'bij|in|om|uur|collega*|thuis|kantoor|dagen'),
      ],
      modelAnswers: [
        'Ik werk als verpleegkundige in een ziekenhuis. Ik begin om zeven uur.',
        "Ik ben programmeur bij een klein bedrijf. Op vrijdag werk ik thuis en mijn collega's zijn heel gezellig.",
      ],
      hints: ['Ik werk als … bij …', 'Ik begin om …'],
    },
    grammar: {
      title: 'Word order: time – manner – place',
      explanation:
        "In the middle of a Dutch sentence the usual order is **time – manner – place** (wanneer – hoe – waar): *Ik ga **morgen** **met de fiets** **naar mijn werk**.* It's a tendency rather than a law, but it sounds natural. And remember V2: if you start with a time, the verb comes next: ***Op vrijdag** werk ik thuis.*",
      examples: [
        { nl: 'Ik ga morgen met de trein naar Utrecht.', en: "I'm going to Utrecht by train tomorrow." },
        { nl: 'We lunchen om half één samen in de kantine.', en: 'We have lunch together in the canteen at half past twelve.' },
        { nl: 'Op vrijdag werk ik thuis.', en: 'On Fridays I work from home.', highlight: 'werk ik' },
      ],
      commonMistake: { wrong: 'Op vrijdag ik werk thuis.', right: 'Op vrijdag werk ik thuis.', why: 'Verb second: after a fronted time, the verb comes before the subject.' },
    },
    culture: {
      title: 'Flat hierarchies and the Friday borrel',
      body: "Dutch workplaces are famously flat: you call your manager by their first name, and even interns are expected to give their opinion in meetings. Part-time work is normal at every level. Lunch is short and simple, often shared at a long table. Many teams have a 'vrijdagmiddagborrel' — Friday afternoon drinks with bitterballen — the best place to practise your Dutch.",
    },
    review: [
      { type: 'translate', prompt: 'I work as a teacher.', accept: ['Ik werk als leraar', 'Ik werk als lerares', 'Ik werk als docent', 'Ik ben leraar', 'Ik ben lerares', 'Ik ben docent'] },
      { type: 'order', patternId: 'word-order-v2', en: 'On Fridays I work from home.', words: ['Op', 'vrijdag', 'werk', 'ik', 'thuis'] },
      { type: 'fill', sentence: 'Ik heb om tien uur een ___.', en: 'I have a meeting at ten.', accept: ['vergadering', 'afspraak'] },
      { type: 'choose', patternId: 'register-formal', prompt: "Your manager says 'Zeg maar je.' This means…", options: ['Please be formal', "You can use the informal 'je'", 'Say your name'], answer: 1 },
      { type: 'respond', situation: "At the Friday borrel a colleague asks: 'Wat doe je precies?' Explain your job in a sentence or two.", npc: { nl: 'Wat doe je precies?', en: 'What exactly do you do?' }, intents: [i('job', 'Describe your job', 'werk|ben|doe|zorg|maak|help|studeer')], modelAnswers: ['Ik werk als verpleegkundige. Ik zorg voor patiënten in het ziekenhuis.', 'Ik ben ontwikkelaar. Ik maak apps voor klanten.'] },
    ],
  }),

  defineLesson({
    id: 'a2.courses',
    level: 'A2',
    unit: 'School',
    order: 3,
    title: 'School and courses',
    subtitle: 'Sign up for a course and talk to a teacher',
    canDo: 'I can sign up for a course, ask practical questions and talk to a teacher about my progress.',
    minutes: 12,
    situation: {
      setting: 'You call a language school in The Hague to sign up for an evening course.',
      dialogue: [
        line('Petra', 'Taalschool De Brug, goedemiddag, u spreekt met Petra.', "De Brug language school, good afternoon, you're speaking with Petra."),
        line('You', 'Goedemiddag. Ik wil me graag inschrijven voor een cursus Nederlands.', "Good afternoon. I'd like to sign up for a Dutch course."),
        line('Petra', 'Prima. Welk niveau heeft u?', 'Fine. What level are you?'),
        line('You', 'Ik denk A2. Ik kan al een beetje praten, maar ik maak nog veel fouten.', 'I think A2. I can already talk a bit, but I still make a lot of mistakes.'),
        line('Petra', 'Dan is de avondcursus op dinsdag misschien iets voor u. Die begint op 3 september.', 'Then the Tuesday evening course might suit you. It starts on 3 September.'),
        line('You', 'Hoe laat zijn de lessen?', 'What time are the classes?'),
        line('Petra', 'Van zeven tot half tien. De cursus duurt tien weken.', 'From seven to half past nine. The course lasts ten weeks.'),
        line('You', 'Mooi. Hoe kan ik me aanmelden?', 'Great. How can I register?'),
        line('Petra', 'Via onze website. Dan krijgt u ook een korte toets om uw niveau te testen.', "Via our website. Then you'll also get a short test to check your level."),
      ],
    },
    vocabulary: [
      ['inschrijven', 'zich inschrijven (voor)', 'to sign up (for)', 'Ik wil me inschrijven voor de cursus.', 'I want to sign up for the course.', { band: 2, note: 'Reflexive: ik schrijf me in, jij schrijft je in. Also: zich aanmelden.' }],
      ['de-cursus', 'de cursus', 'the course', 'De cursus duurt tien weken.', 'The course lasts ten weeks.', { article: 'de' }],
      ['het-niveau', 'het niveau', 'the level', 'Welk niveau heb je? – A2, denk ik.', 'What level are you? – A2, I think.', { article: 'het', band: 2 }],
      ['huiswerk', 'het huiswerk', 'homework', 'Heb je je huiswerk al gemaakt?', 'Have you done your homework yet?', { article: 'het', note: "You 'make' homework in Dutch: huiswerk maken." }],
      ['fouten-maken', 'fouten maken', 'to make mistakes', 'Het is niet erg om fouten te maken.', "It's okay to make mistakes."],
      ['de-docent', 'de docent', 'the teacher (course/university)', 'Onze docent spreekt heel duidelijk.', 'Our teacher speaks very clearly.', { article: 'de', note: "Leraar/lerares is more for schools; docent for courses and universities. Young children say 'juf' and 'meester'." }],
      ['duren', 'Hoe lang duurt het?', 'How long does it take?', 'Hoe lang duurt de les? – Twee uur.', 'How long is the class? – Two hours.'],
      ['ik-snap-het', 'Ik snap het (niet)', "I (don't) get it", 'Kunt u het nog een keer uitleggen? Ik snap het niet.', "Could you explain it again? I don't get it.", { register: 'informal' }],
    ],
    pronunciation: {
      focus: 'uu',
      tip: "UU in 'duurt' and 'uur' is long; the U in 'cursus' is short and relaxed. Round your lips for both.",
      items: [
        { nl: 'De cursus duurt tien weken.', en: 'The course lasts ten weeks.' },
        { nl: 'De les is om zeven uur.', en: 'The class is at seven.' },
        { nl: 'Hoe lang duurt het?', en: 'How long does it take?' },
      ],
    },
    listening: {
      intro: 'A teacher gives feedback to a student. What should Ana practise more?',
      lines: [
        line('Teacher', 'Ana, je doet het goed! Je begrijpt bijna alles.', "Ana, you're doing well! You understand almost everything."),
        line('Teacher', 'Maar je praat nog weinig in de les. Je moet meer spreken, ook als je fouten maakt.', 'But you still say little in class. You need to speak more, even if you make mistakes.'),
        line('Ana', 'Ja, ik weet het. Ik ben een beetje verlegen.', "Yes, I know. I'm a bit shy."),
        line('Teacher', 'Dat is heel normaal. Probeer elke dag vijf minuten Nederlands te praten, bijvoorbeeld met je buren.', "That's very normal. Try to speak Dutch for five minutes every day, for example with your neighbours."),
      ],
      questions: [
        { type: 'choice', prompt: 'What is Ana good at?', options: ['Speaking', 'Understanding', 'Writing'], answer: 1 },
        { type: 'choice', prompt: 'What does the teacher advise?', options: ['Watch Dutch TV', 'Speak Dutch five minutes a day', 'Do more homework'], answer: 1 },
      ],
    },
    speaking: {
      prompt: 'Call a language school: say you want to sign up, give your level, and ask when the classes are.',
      mustInclude: [
        i('signup', 'Say you want to sign up', 'inschrijven|aanmelden|cursus'),
        i('level', 'Give your level', 'niveau|a1|a2|b1|beginner|een beetje'),
        i('when', 'Ask when the classes are', 'wanneer|hoe laat|welke dag|dagen'),
      ],
      modelAnswers: [
        'Goedemiddag, ik wil me graag inschrijven voor een cursus Nederlands. Mijn niveau is A2. Wanneer zijn de lessen?',
        'Hallo, ik wil me aanmelden voor de cursus. Ik denk dat ik A2 ben. Hoe laat zijn de lessen?',
      ],
      hints: ['Ik wil me graag inschrijven voor …', 'Mijn niveau is …', 'Wanneer zijn …?'],
    },
    grammar: {
      title: 'Reflexive verbs: zich inschrijven',
      explanation:
        "Some verbs need a reflexive pronoun: **ik schrijf me in, jij schrijft je in, hij schrijft zich in, wij schrijven ons in**. Common ones: *zich aanmelden* (register), *zich voelen* (feel), *zich vergissen* (be mistaken), *zich vervelen* (be bored), *zich haasten* (hurry). With 'u' use **zich** or **u**: *U kunt zich online aanmelden.*",
      examples: [
        { nl: 'Ik voel me goed.', en: 'I feel good.', highlight: 'voel me' },
        { nl: 'Hij vergist zich.', en: "He's mistaken.", highlight: 'vergist zich' },
        { nl: 'We schrijven ons morgen in.', en: "We're signing up tomorrow.", highlight: 'schrijven ons … in' },
      ],
      commonMistake: { wrong: 'Ik ben verveeld.', right: 'Ik verveel me.', why: "'To be bored' is reflexive in Dutch: zich vervelen." },
    },
    culture: {
      title: 'Learning Dutch as an adult',
      body: "In the Netherlands many newcomers follow the 'inburgering' (civic integration) route, with exams in reading, listening, writing, speaking and knowledge of Dutch society. Libraries run free language cafés, and many municipalities offer courses. In Flanders, adult education centres offer Dutch as a second language (NT2) at low cost. Teachers expect active participation: asking questions shows engagement, not ignorance.",
    },
    review: [
      { type: 'fill', sentence: 'Ik schrijf ___ in voor de cursus.', en: "I'm signing up for the course.", accept: ['me', 'mij'] },
      { type: 'translate', prompt: 'How long does the course take?', accept: ['Hoe lang duurt de cursus'] },
      { type: 'choose', prompt: "'Huiswerk maken' means…", options: ['to do homework', 'to build a house', 'to work from home'], answer: 0 },
      { type: 'order', en: 'I still make a lot of mistakes.', words: ['Ik', 'maak', 'nog', 'veel', 'fouten'] },
      { type: 'respond', situation: "Your teacher explains something and you don't get it. Ask them to explain it again.", intents: [i('explain', 'Ask to explain again', 'uitleggen|nog een keer|nog eens|herhalen')], modelAnswers: ['Sorry, ik snap het niet. Kunt u het nog een keer uitleggen?', 'Kunt u dat nog eens uitleggen, alstublieft?'] },
    ],
  }),

  defineLesson({
    id: 'a2.train',
    level: 'A2',
    unit: 'Travel',
    order: 4,
    title: 'Taking the train',
    subtitle: 'Find your train, check in and handle delays',
    canDo: 'I can find the right train, check in and understand a delay announcement.',
    minutes: 12,
    situation: {
      setting: 'Amsterdam Centraal, 8:15 in the morning. You need to get to Leiden and go to the service desk.',
      dialogue: [
        line('You', 'Goedemorgen. Ik wil graag naar Leiden. Welke trein moet ik nemen?', "Good morning. I'd like to go to Leiden. Which train should I take?"),
        line('Staff', 'De intercity naar Den Haag. Die vertrekt om acht uur vierentwintig van spoor zeven.', 'The intercity to The Hague. It leaves at 8:24 from platform seven.'),
        line('You', 'Moet ik overstappen?', 'Do I have to change trains?'),
        line('Staff', 'Nee, hij stopt in Leiden. Het is een rechtstreekse trein.', "No, it stops in Leiden. It's a direct train."),
        line('You', 'Kan ik hier een kaartje kopen?', 'Can I buy a ticket here?'),
        line('Staff', 'Bij de automaat, of u checkt gewoon in met uw bankpas. Vergeet niet uit te checken!', "At the machine, or you just check in with your bank card. Don't forget to check out!"),
        line('Announcement', 'Attentie: de intercity naar Den Haag heeft ongeveer tien minuten vertraging.', 'Attention: the intercity to The Hague is delayed by about ten minutes.'),
        line('You', 'Typisch…', 'Typical…'),
      ],
    },
    vocabulary: [
      ['een-kaartje', 'een kaartje (naar)', 'a ticket (to)', 'Een kaartje naar Utrecht, alstublieft.', 'A ticket to Utrecht, please.', { note: 'Enkele reis = single, retour = return. Most people just check in with a card.' }],
      ['overstappen', 'overstappen', 'to change (trains)', 'U moet in Utrecht overstappen.', 'You have to change in Utrecht.', { band: 2, note: 'Separable: ik stap over, ik ben overgestapt.' }],
      ['het-spoor', 'het spoor', 'the platform (track)', 'De trein vertrekt van spoor vijf.', 'The train leaves from platform five.', { article: 'het', band: 2 }],
      ['vertraging', 'de vertraging', 'the delay', 'De trein heeft twintig minuten vertraging.', 'The train is twenty minutes late.', { article: 'de', note: "Trains 'have' delay in Dutch: 'De trein heeft vertraging.'" }],
      ['inchecken', 'in- en uitchecken', 'to check in and out', 'Vergeet niet uit te checken!', "Don't forget to check out!", { note: 'Tap your card at the gate or pole at the start and end of every journey.' }],
      ['vertrekken', 'vertrekken', 'to depart', 'Hoe laat vertrekt de trein?', 'What time does the train leave?'],
      ['rechtstreeks', 'rechtstreeks', 'direct', 'Is dit een rechtstreekse trein?', 'Is this a direct train?', { band: 3 }],
      ['de-halte', 'de halte', 'the (bus/tram) stop', 'Bij welke halte moet ik uitstappen?', 'At which stop should I get off?', { article: 'de' }],
    ],
    pronunciation: {
      focus: 'vowel-length',
      tip: "Long vowels in 'spoor' and 'Haag' are held steady; 'Den Haag' ends in the Dutch ch-sound.",
      items: [
        { nl: 'De trein vertrekt van spoor zeven.', en: 'The train leaves from platform seven.' },
        { nl: 'Ik ga naar Den Haag.', en: "I'm going to The Hague." },
        { nl: 'Moet ik overstappen?', en: 'Do I have to change trains?' },
      ],
    },
    listening: {
      intro: 'A station announcement. What changes for the train to Maastricht?',
      lines: [
        line('Announcer', 'Dames en heren, de intercity naar Maastricht, vertrek elf uur twaalf, vertrekt vandaag van spoor 11b in plaats van spoor 5.', 'Ladies and gentlemen, the intercity to Maastricht, departure 11:12, leaves from platform 11b today instead of platform 5.'),
        line('Announcer', 'Deze trein heeft ongeveer vijf minuten vertraging.', 'This train is delayed by about five minutes.'),
        line('Announcer', 'Deze trein stopt vandaag niet in Weert. Reizigers naar Weert kunnen in Eindhoven overstappen op de stoptrein.', 'This train does not stop in Weert today. Travellers to Weert can change to the local train in Eindhoven.'),
      ],
      questions: [
        { type: 'choice', prompt: 'Which platform does the train leave from today?', options: ['5', '11b', '12'], answer: 1 },
        { type: 'choice', prompt: 'What should travellers to Weert do?', options: ['Take a bus', 'Change in Eindhoven', 'Wait for the next train'], answer: 1 },
      ],
    },
    speaking: {
      prompt: 'At the service desk, ask which train goes to Rotterdam and whether you have to change.',
      mustInclude: [
        i('which', 'Ask which train', 'welke trein|welk spoor|hoe kom ik|trein naar'),
        i('change', 'Ask about changing', 'overstappen|rechtstreeks*|direct*'),
      ],
      modelAnswers: [
        'Goedemorgen, welke trein moet ik nemen naar Rotterdam? Moet ik overstappen?',
        'Hallo, hoe kom ik naar Rotterdam? Is er een rechtstreekse trein?',
      ],
      hints: ['Welke trein moet ik nemen naar …?', 'Moet ik …?'],
    },
    grammar: {
      title: 'Separable verbs: ik stap over',
      explanation:
        "Verbs like **overstappen, instappen, uitstappen, inchecken, aankomen** have a stressed prefix. In a main clause the prefix goes to the **end**: *Ik **stap** in Utrecht **over**.* In the perfect it goes before *ge-*: *Ik ben **overgestapt**.* With *te* it goes before *te*: *Vergeet niet **uit te checken**.* Stress helps: separable prefixes are stressed (OVERstappen); inseparable ones like ver-, be-, ont- are not (verTREKken).",
      examples: [
        { nl: 'Ik stap in Utrecht over.', en: 'I change trains in Utrecht.', highlight: 'stap … over' },
        { nl: 'De trein komt om tien uur aan.', en: 'The train arrives at ten.', highlight: 'komt … aan' },
        { nl: 'Ik ben in Leiden uitgestapt.', en: 'I got off in Leiden.', highlight: 'uitgestapt' },
      ],
      commonMistake: { wrong: 'Ik overstap in Utrecht.', right: 'Ik stap in Utrecht over.', why: 'In a main clause the prefix separates and goes to the end.' },
    },
    culture: {
      title: 'Life on the rails',
      body: "Dutch trains are frequent — on busy routes several per hour — so people rarely check timetables in advance. Delays ('vertraging') are a favourite national complaint. The quiet carriage ('stiltecoupé') really is silent. Bikes can come along outside rush hour with a separate ticket; folded folding bikes travel free. In Belgium the railways are run by NMBS/SNCB, and weekend tickets are cheaper.",
    },
    review: [
      { type: 'translate', prompt: 'Do I have to change trains?', accept: ['Moet ik overstappen'] },
      { type: 'order', patternId: 'separable-verbs', en: 'I change trains in Utrecht.', words: ['Ik', 'stap', 'in', 'Utrecht', 'over'] },
      { type: 'fill', sentence: 'De trein heeft tien minuten ___.', en: 'The train is ten minutes late.', accept: ['vertraging'] },
      { type: 'choose', prompt: "'Spoor 5' is…", options: ['platform 5', '5 minutes', 'carriage 5'], answer: 0 },
      { type: 'respond', situation: "A tourist asks you on the platform 'Is dit de trein naar Schiphol?' You don't know; suggest where to ask.", npc: { nl: 'Is dit de trein naar Schiphol?', en: 'Is this the train to Schiphol?' }, intents: [i('dontknow', "Say you don't know", 'weet het niet|weet ik niet|geen idee|niet zeker'), i('suggest', 'Suggest where to ask', 'vragen|vraag|balie|servicebalie|medewerker|conducteur|bord')], modelAnswers: ['Sorry, dat weet ik niet. U kunt het vragen bij de servicebalie.', 'Geen idee, sorry. Vraag het even aan de conducteur.'] },
      { type: 'dictation', nl: 'De trein vertrekt van spoor zeven.', en: 'The train leaves from platform seven.' },
    ],
  }),

  defineLesson({
    id: 'a2.birthday',
    level: 'A2',
    unit: 'Social situations',
    order: 5,
    title: 'A Dutch birthday party',
    subtitle: 'The circle, congratulations and small talk',
    canDo: 'I can join a Dutch birthday party: congratulate people, say how I know the host and make small talk.',
    minutes: 12,
    situation: {
      setting: "Your colleague Mark's 40th birthday, at his home in Almere. Chairs in a circle, coffee and cake. You also meet his mother.",
      dialogue: [
        line('You', 'Gefeliciteerd, Mark! Hier is een klein cadeautje.', "Happy birthday, Mark! Here's a little present."),
        line('Mark', 'Ah, wat lief! Dank je wel. Kom binnen, pak een stoel.', 'Ah, how kind! Thank you. Come in, grab a chair.'),
        line('You', 'Hallo, gefeliciteerd met uw zoon!', 'Hello, congratulations on your son!'),
        line('Mother', 'Dank je wel! Hoe ken jij Mark?', 'Thank you! How do you know Mark?'),
        line('You', "We zijn collega's. We werken samen bij de gemeente.", "We're colleagues. We work together at the municipality."),
        line('Mother', 'O, leuk! Wil je koffie en een stukje taart?', 'Oh, nice! Would you like coffee and a piece of cake?'),
        line('You', 'Graag! Wat een lekkere taart.', 'Yes please! What a delicious cake.'),
        line('Mother', 'Die heeft Mark zelf gebakken, hoor.', 'Mark baked it himself, you know.'),
      ],
    },
    vocabulary: [
      ['gefeliciteerd', 'Gefeliciteerd!', 'Congratulations! / Happy birthday!', 'Gefeliciteerd met je verjaardag!', 'Happy birthday!', { note: 'For birthdays, new jobs, babies, exams…' }],
      ['gefeliciteerd-met', 'Gefeliciteerd met je …', 'Congratulations on your …', 'Gefeliciteerd met je vrouw!', "Congratulations on your wife's birthday!", { note: "At a birthday you also congratulate the family: 'Gefeliciteerd met je moeder!'" }],
      ['hoe-ken-jij', 'Hoe ken jij …?', 'How do you know …?', 'Hoe ken jij Lisa? – Van de sportschool.', 'How do you know Lisa? – From the gym.'],
      ['een-stukje-taart', 'een stukje taart', 'a piece of cake', 'Wil je een stukje taart?', 'Would you like a piece of cake?', { note: 'Diminutives (-je) sound friendly and modest: een kopje koffie, een stukje taart.' }],
      ['cadeautje', 'een cadeautje', 'a (little) present', 'Ik heb een cadeautje voor je.', 'I have a little present for you.', { band: 2 }],
      ['wat-lief', 'Wat lief!', 'How sweet / kind!', 'Wat lief van je!', 'How kind of you!'],
      ['proost', 'Proost!', 'Cheers!', 'Op Mark! Proost!', 'To Mark! Cheers!'],
      ['de-kring', 'in de kring', 'in the circle', 'Iedereen zit in de kring.', 'Everyone is sitting in the circle.', { article: 'de', band: 3 }],
    ],
    pronunciation: {
      focus: 'r',
      tip: "'Verjaardag' has two R's; before a consonant the R may be soft in the Netherlands. Make the R in 'Proost' clear.",
      items: [
        { nl: 'Gefeliciteerd met je verjaardag!', en: 'Happy birthday!' },
        { nl: 'Proost!', en: 'Cheers!' },
        { nl: 'Gefeliciteerd met je broer!', en: "Congratulations on your brother's birthday!" },
      ],
    },
    listening: {
      intro: 'Overheard in the birthday circle. What are they talking about?',
      lines: [
        line('Aunt Ria', 'Zo, en waar ga jij dit jaar op vakantie?', 'So, and where are you going on holiday this year?'),
        line('Joris', 'Naar Frankrijk, met de caravan. Net als elk jaar, haha.', 'To France, with the caravan. Like every year, haha.'),
        line('Aunt Ria', 'Wij gaan naar Zeeland. Lekker dichtbij, geen gedoe.', "We're going to Zeeland. Nice and close, no hassle."),
        line('Joris', 'Ook goed! Als het weer meezit, is het daar prachtig.', "Also good! If the weather cooperates, it's beautiful there."),
      ],
      questions: [
        { type: 'choice', prompt: 'What are they talking about?', options: ['Work', 'Holidays', 'Family'], answer: 1 },
        { type: 'choice', prompt: 'Why is Ria going to Zeeland?', options: ["It's close and easy", "It's cheap", 'Her family lives there'], answer: 0 },
      ],
    },
    speaking: {
      prompt: "You arrive at a birthday. Congratulate the host, congratulate their partner too, and say how you know the host.",
      mustInclude: [
        i('congrats', 'Congratulate', 'gefeliciteerd|proficiat|van harte'),
        i('how', 'Say how you know the host', 'collega*|ken|vriend*|buur*|sport*|school|werk'),
      ],
      modelAnswers: [
        'Gefeliciteerd! Hier is een cadeautje. En gefeliciteerd met je vriend! Ik ben een collega van Mark.',
        'Hoi, gefeliciteerd met Mark! Ik ken hem van het werk.',
      ],
      hints: ['Gefeliciteerd met …!', 'Ik ken … van …'],
    },
    grammar: {
      title: 'Diminutives: -je, -tje, -pje, -etje',
      explanation:
        "Dutch loves the **diminutive**. It can make things small (*een huisje*), but more often it sounds friendly, casual or modest: *een kopje koffie, een biertje, even een momentje*. Endings: **-je** (huis → huisje), **-tje** after vowels and after l, n, r, w following a long vowel (stoel → stoeltje, trein → treintje), **-pje** after m (boom → boompje), **-etje** after a short vowel + l, m, n, ng, r (bal → balletje, ring → ringetje). Diminutives are **always het-words**.",
      examples: [
        { nl: 'Wil je een kopje thee?', en: 'Would you like a cup of tea?', highlight: 'kopje' },
        { nl: 'Ik heb een cadeautje voor je.', en: 'I have a little present for you.', highlight: 'cadeautje' },
        { nl: 'Zullen we een biertje drinken?', en: 'Shall we have a beer?', highlight: 'biertje' },
        { nl: 'Het meisje heet Noor.', en: 'The girl is called Noor.', highlight: 'Het meisje' },
      ],
      commonMistake: { wrong: 'de meisje', right: 'het meisje', why: 'Diminutives are always het-words.' },
    },
    culture: {
      title: 'The circle party',
      body: "A classic Dutch birthday ('verjaardag') happens at home: guests sit in a circle, get coffee with cake, and later drinks with snacks — cheese, sausage, crisps, bitterballen. When you arrive you greet everyone, and you congratulate not only the birthday person but also their family: 'Gefeliciteerd met je zoon!' It sounds strange at first, but it's the rule. In Flanders you'll also hear 'Proficiat!'",
    },
    review: [
      { type: 'translate', prompt: 'Happy birthday!', accept: ['Gefeliciteerd', 'Gefeliciteerd met je verjaardag', 'Van harte gefeliciteerd', 'Proficiat'] },
      { type: 'choose', prompt: "At a birthday you meet the birthday girl's father. You say:", options: ['Gefeliciteerd met je dochter!', 'Fijne dag!', 'Hoe heet je?'], answer: 0 },
      { type: 'choose', patternId: 'de-het', prompt: '___ kopje is heet.', options: ['De', 'Het'], answer: 1 },
      { type: 'fill', sentence: 'Wil je een ___ taart? (a piece)', en: 'Would you like a piece of cake?', accept: ['stukje'] },
      { type: 'respond', situation: "Someone in the circle asks: 'En hoe ken jij Mark?' Answer.", npc: { nl: 'En hoe ken jij Mark?', en: 'And how do you know Mark?' }, intents: [i('how', 'Say how you know him', 'collega*|werk|ken|vriend*|buur*|school|sport*|via')], modelAnswers: ["We zijn collega's.", 'Ik ken hem van het werk. En jij?'] },
    ],
  }),

  defineLesson({
    id: 'a2.appointments',
    level: 'A2',
    unit: 'Making appointments',
    order: 6,
    title: 'Making an appointment',
    subtitle: 'Call the GP, propose a time and confirm',
    canDo: 'I can make, change and confirm an appointment by phone.',
    minutes: 12,
    situation: {
      setting: "You call your GP practice because you've had a sore throat for a week.",
      dialogue: [
        line('Sandra', 'Huisartsenpraktijk Oosterpark, met Sandra.', 'Oosterpark GP practice, Sandra speaking.'),
        line('You', 'Goedemorgen, u spreekt met Sam Taylor. Ik wil graag een afspraak maken met de huisarts.', "Good morning, this is Sam Taylor. I'd like to make an appointment with the GP."),
        line('Sandra', 'Wat zijn de klachten?', 'What are the symptoms?'),
        line('You', 'Ik heb al een week keelpijn en een beetje koorts.', "I've had a sore throat and a slight fever for a week."),
        line('Sandra', 'Oké. Kunt u morgen om kwart over negen?', 'Okay. Can you make it tomorrow at a quarter past nine?'),
        line('You', "Morgenochtend kan ik helaas niet. Heeft u 's middags nog plek?", "Unfortunately I can't tomorrow morning. Do you have a slot in the afternoon?"),
        line('Sandra', 'Om tien over twee?', 'At ten past two?'),
        line('You', 'Ja, dat is goed. Dank u wel.', "Yes, that's fine. Thank you."),
        line('Sandra', 'Graag gedaan. Tot morgen.', "You're welcome. See you tomorrow."),
      ],
    },
    vocabulary: [
      ['afspraak-maken', 'een afspraak maken', 'to make an appointment', 'Ik wil graag een afspraak maken.', "I'd like to make an appointment.", { note: "'Afspraak' is an appointment and also a plan with friends: 'We hebben om acht uur afgesproken.'" }],
      ['kunt-u-om', 'Kunt u om …?', 'Can you make it at …?', 'Kunt u donderdag om drie uur?', 'Can you make it on Thursday at three?', { note: "Short for 'Kunt u … komen?' Answers: 'Ja, dat kan' / 'Nee, dan kan ik niet'." }],
      ['dat-komt-niet-uit', 'Dat komt niet goed uit', "That's not convenient", 'Dinsdag komt niet goed uit. Kan het ook woensdag?', "Tuesday isn't convenient. Could it be Wednesday instead?", { band: 2 }],
      ['heeft-u-plek', 'Heeft u nog plek?', 'Do you have any availability?', 'Heeft u deze week nog plek?', 'Do you have any slots this week?'],
      ['verzetten', 'een afspraak verzetten', 'to reschedule an appointment', 'Kan ik mijn afspraak verzetten?', 'Can I reschedule my appointment?', { band: 3, note: 'Also: afzeggen (cancel), bevestigen (confirm).' }],
      ['de-klachten', 'de klachten', 'the symptoms (complaints)', 'Wat zijn uw klachten?', 'What are your symptoms?', { article: 'de', band: 2 }],
      ['keelpijn', 'Ik heb keelpijn', 'I have a sore throat', 'Ik heb keelpijn en hoofdpijn.', 'I have a sore throat and a headache.', { note: 'Pain = pijn: keelpijn, hoofdpijn, buikpijn, rugpijn.' }],
      ['met-wie-spreek-ik', 'Met wie spreek ik?', 'Who am I speaking with?', 'Goedemiddag, met wie spreek ik?', 'Good afternoon, who am I speaking with?', { note: "On the phone Dutch people start with their name: 'Met Sandra' / 'U spreekt met …'." }],
    ],
    pronunciation: {
      focus: 'ij',
      tip: "'Pijn' and 'tijd' have IJ — open your mouth more than for English 'pain'.",
      items: [
        { nl: 'Ik heb keelpijn.', en: 'I have a sore throat.' },
        { nl: 'Ik heb buikpijn en hoofdpijn.', en: 'I have a stomach ache and a headache.' },
        { nl: 'Is er deze week nog tijd?', en: 'Is there any time this week?' },
      ],
    },
    listening: {
      intro: 'A message from the hospital. What should the patient bring?',
      lines: [
        line('Voice', 'Goedemiddag, u spreekt met de polikliniek van het ziekenhuis.', 'Good afternoon, this is the outpatient clinic of the hospital.'),
        line('Voice', 'Uw afspraak is op maandag 14 oktober om half elf.', 'Your appointment is on Monday 14 October at half past ten.'),
        line('Voice', 'Wilt u uw verzekeringspas en een geldig legitimatiebewijs meenemen?', 'Could you bring your insurance card and a valid ID?'),
        line('Voice', 'Kunt u niet? Bel dan minstens 24 uur van tevoren.', "Can't make it? Then please call at least 24 hours in advance."),
      ],
      questions: [
        { type: 'choice', prompt: 'When is the appointment?', options: ['Monday 14 October, 10:30', 'Monday 14 October, 11:30', 'Tuesday 10 October, 10:30'], answer: 0 },
        { type: 'choice', prompt: 'What should the patient bring?', options: ['Insurance card and ID', 'A letter from the GP', 'Nothing'], answer: 0 },
      ],
    },
    speaking: {
      prompt: 'Call a practice: ask for an appointment, say briefly why, and propose a day that suits you.',
      mustInclude: [
        i('appointment', 'Ask for an appointment', 'afspraak'),
        i('reason', 'Say why', 'pijn|keelpijn|hoofdpijn|buikpijn|koorts|ziek|klacht*|controle|last van|hoest*|verkouden'),
        i('when', 'Propose a day or time', 'maandag|dinsdag|woensdag|donderdag|vrijdag|morgen*|middag*|ochtend*|uur|#num|deze week|volgende week'),
      ],
      modelAnswers: [
        'Goedemorgen, ik wil graag een afspraak maken. Ik heb keelpijn. Kan het morgenmiddag?',
        'Hallo, u spreekt met Sam. Ik wil een afspraak maken met de huisarts, want ik heb al een week koorts. Heeft u donderdag nog plek?',
      ],
      hints: ['Ik wil graag een afspraak maken.', 'Ik heb …', 'Kan het …?'],
    },
    grammar: {
      title: 'Modal verbs: kunnen, willen, moeten, mogen',
      explanation:
        "Modal verbs are conjugated in second place, and the main verb goes to the **end** as an infinitive: *Ik **wil** graag een afspraak **maken**.* Forms: **kunnen** (ik kan, jij kunt/kan, u kunt), **willen** (ik wil, jij wilt/wil), **moeten** (ik moet), **mogen** (ik mag). The infinitive is often dropped when it's obvious: *Kunt u morgen?* (…komen) · *Ik moet naar huis.* (…gaan)",
      examples: [
        { nl: 'Ik wil graag een afspraak maken.', en: "I'd like to make an appointment.", highlight: 'wil … maken' },
        { nl: 'Kunt u morgen komen?', en: 'Can you come tomorrow?', highlight: 'Kunt … komen' },
        { nl: 'Ik moet om vijf uur weg.', en: 'I have to leave at five.', highlight: 'moet' },
      ],
      commonMistake: { wrong: 'Ik wil maken een afspraak.', right: 'Ik wil een afspraak maken.', why: 'The infinitive goes to the end of the sentence.' },
    },
    culture: {
      title: 'The huisarts is your gatekeeper',
      body: "In the Netherlands you register with a GP (huisarts) near your home, and you almost always see the GP before any specialist. When you call, the assistant asks about your symptoms and decides how urgent it is — so be ready to describe them. Don't be surprised if the advice is rest and paracetamol: Dutch GPs prescribe fewer antibiotics than doctors in many countries. Outside office hours you call the huisartsenpost.",
    },
    review: [
      { type: 'order', patternId: 'infinitive-end', en: "I'd like to make an appointment.", words: ['Ik', 'wil', 'graag', 'een', 'afspraak', 'maken'] },
      { type: 'translate', prompt: 'I have a headache.', accept: ['Ik heb hoofdpijn'] },
      { type: 'choose', prompt: "'Dat komt niet goed uit' means…", options: ["That's not convenient", "That didn't go well", "That doesn't fit"], answer: 0 },
      { type: 'fill', sentence: 'Kunt u morgen ___? (come)', en: 'Can you come tomorrow?', accept: ['komen'] },
      { type: 'respond', situation: "The assistant offers: 'Kunt u vrijdag om negen uur?' You can't; ask for the afternoon.", npc: { nl: 'Kunt u vrijdag om negen uur?', en: 'Can you make it Friday at nine?' }, intents: [i('decline', "Say you can't", 'kan ik niet|kan niet|helaas|komt niet|lukt niet'), i('afternoon', 'Ask for the afternoon', 'middag*|later|na de lunch')], modelAnswers: ["Helaas, dan kan ik niet. Heeft u 's middags nog plek?", "Vrijdagochtend komt niet goed uit. Kan het ook 's middags?"] },
      { type: 'dictation', nl: 'Ik wil graag een afspraak maken.', en: "I'd like to make an appointment." },
    ],
  }),

  defineLesson({
    id: 'a2.experiences',
    level: 'A2',
    unit: 'Describing experiences',
    order: 7,
    title: 'Telling what happened',
    subtitle: 'Describe a trip, an event or a mishap',
    canDo: 'I can describe a past experience in a few connected sentences.',
    minutes: 12,
    situation: {
      setting: 'Coffee break. Your friend Lotte asks about your weekend in Maastricht.',
      dialogue: [
        line('Lotte', 'En? Hoe was Maastricht?', 'So? How was Maastricht?'),
        line('You', 'Echt heel leuk! We zijn vrijdag met de trein gegaan.', 'Really great! We went by train on Friday.'),
        line('Lotte', 'Wat hebben jullie allemaal gedaan?', 'What did you all do?'),
        line('You', 'We hebben door de oude stad gewandeld en we hebben vlaai gegeten. Heerlijk!', 'We walked through the old town and we ate vlaai. Delicious!'),
        line('Lotte', 'Lekker! En het weer?', 'Lovely! And the weather?'),
        line('You', 'Zaterdag was het mooi, maar zondag heeft het de hele dag geregend. Toen zijn we naar een museum gegaan.', 'Saturday was nice, but on Sunday it rained all day. So we went to a museum.'),
        line('Lotte', 'Slim! Welk museum?', 'Smart! Which museum?'),
        line('You', 'Het Bonnefanten. Heel mooi, maar ik was wel moe na al dat lopen.', 'The Bonnefanten. Very beautiful, but I was tired after all that walking.'),
      ],
    },
    vocabulary: [
      ['hoe-was', 'Hoe was …?', 'How was …?', 'Hoe was je vakantie?', 'How was your holiday?'],
      ['we-zijn-gegaan', 'We zijn … gegaan', 'We went …', 'We zijn met de auto naar Frankrijk gegaan.', 'We went to France by car.', { note: 'Movement to a place: zijn + gegaan.' }],
      ['toen', 'toen', 'then; when (in the past)', 'Het regende. Toen zijn we naar huis gegaan.', 'It was raining. Then we went home.', { note: "As 'then' it is followed by the verb; as 'when' it sends the verb to the end: 'Toen ik jong was…'" }],
      ['daarna', 'daarna', 'after that', 'Eerst hebben we gegeten, daarna zijn we gaan wandelen.', 'First we ate, after that we went for a walk.'],
      ['het-was', 'Het was …', 'It was …', 'Het was echt geweldig!', 'It was really great!', { note: 'Past of zijn: ik was, wij waren. Past of hebben: ik had, wij hadden.' }],
      ['heerlijk', 'heerlijk', 'delicious; wonderful', 'Wat een heerlijk weer!', 'What wonderful weather!', { band: 2 }],
      ['helaas', 'helaas', 'unfortunately', 'Helaas was het museum dicht.', 'Unfortunately the museum was closed.'],
      ['uiteindelijk', 'uiteindelijk', 'in the end, eventually', 'Uiteindelijk hebben we de trein toch gehaald.', 'In the end we caught the train after all.', { band: 2, note: "Not 'eventueel' — that means 'possibly'!" }],
    ],
    pronunciation: {
      focus: 'ou',
      tip: "OU in 'oude' and 'koud': start open, glide to rounded lips. Keep it different from UI.",
      items: [
        { nl: 'We hebben door de oude stad gewandeld.', en: 'We walked through the old town.' },
        { nl: 'Het was koud, maar mooi.', en: 'It was cold, but beautiful.' },
        { nl: 'Ik hou van Maastricht.', en: 'I love Maastricht.' },
      ],
    },
    listening: {
      intro: 'Karim tells you about a bad day. What went wrong first?',
      lines: [
        line('Karim', 'Gisteren was echt een rampdag.', 'Yesterday was a real disaster of a day.'),
        line('Karim', 'Eerst was mijn fiets kapot, dus ik moest lopen.', 'First my bike was broken, so I had to walk.'),
        line('Karim', 'Toen heb ik de bus gemist, en ik kwam twintig minuten te laat op mijn werk.', 'Then I missed the bus, and I arrived at work twenty minutes late.'),
        line('Karim', "En 's avonds? Mijn sleutels vergeten. Gelukkig was mijn huisgenoot thuis!", 'And in the evening? Forgot my keys. Luckily my housemate was home!'),
      ],
      questions: [
        { type: 'choice', prompt: 'What went wrong first?', options: ['He missed the bus', 'His bike was broken', 'He forgot his keys'], answer: 1 },
        { type: 'choice', prompt: 'How late was he for work?', options: ['10 minutes', '20 minutes', 'An hour'], answer: 1 },
      ],
    },
    speaking: {
      prompt: 'Tell a friend about a trip or a day out: where you went, two things you did, and how it was.',
      mustInclude: [
        i('went', 'Say where you went', 'ben|zijn|gegaan|geweest'),
        i('did', 'Say what you did', 'heb|hebben|gedaan|gegeten|gezien|gewandeld|bezocht|gemaakt'),
        i('how', 'Say how it was', 'was|leuk|mooi|gezellig|heerlijk|geweldig|saai|druk'),
      ],
      modelAnswers: [
        'Ik ben naar Gent geweest. We hebben een boottocht gemaakt en frietjes gegeten. Het was heel leuk!',
        'Vorig weekend zijn we naar het strand gegaan. We hebben gewandeld en ijs gegeten. Het was heerlijk, maar wel koud.',
      ],
      hints: ['Ik ben naar … geweest.', 'We hebben …', 'Het was …'],
    },
    grammar: {
      title: 'Linking a story: eerst, toen, daarna, uiteindelijk',
      explanation:
        "Connect your sentences to tell a story: **eerst** (first) → **toen / daarna** (then / after that) → **uiteindelijk** (in the end). These words take the first position, so the verb comes next (V2): ***Toen zijn** we naar huis gegaan.* **Want** (because) and **maar** (but) don't change the word order: *…maar het **was** koud.* Most past events in conversation use the perfect (*heb gedaan*); descriptions often use the simple past of zijn/hebben: *het was mooi, ik had geen tijd*.",
      examples: [
        { nl: 'Eerst hebben we koffie gedronken.', en: 'First we had coffee.', highlight: 'Eerst hebben we' },
        { nl: 'Toen zijn we naar het museum gegaan.', en: 'Then we went to the museum.', highlight: 'Toen zijn we' },
        { nl: 'Uiteindelijk was het een leuke dag.', en: 'In the end it was a nice day.', highlight: 'Uiteindelijk was het' },
      ],
      commonMistake: { wrong: 'Toen we zijn naar huis gegaan.', right: 'Toen zijn we naar huis gegaan.', why: "After 'toen' (then), the verb comes second." },
    },
    culture: {
      title: 'Holidays and the caravan',
      body: "Holidays (vakantie) are sacred, and many families plan their summer months ahead. The caravan trip to France is a national stereotype that is still very much alive. School summer holidays are staggered by region (north, middle, south) to spread the traffic. Trips at home are popular too: the Wadden Islands, the beaches of Zeeland, and the hills of South Limburg — the only real hills in the country.",
    },
    review: [
      { type: 'fill', patternId: 'perfect-zijn', sentence: 'We ___ naar Maastricht gegaan.', en: 'We went to Maastricht.', accept: ['zijn'] },
      { type: 'fill', patternId: 'perfect-hebben', sentence: 'Ik ___ gisteren lang gewerkt.', en: 'I worked late yesterday.', accept: ['heb'] },
      { type: 'order', patternId: 'word-order-v2', en: 'Then we went home.', words: ['Toen', 'zijn', 'we', 'naar', 'huis', 'gegaan'] },
      { type: 'choose', patternId: 'word-choice', prompt: "'In the end' (eventually) in Dutch is…", options: ['eventueel', 'uiteindelijk', 'eigenlijk'], answer: 1 },
      { type: 'translate', prompt: 'It was really nice!', accept: ['Het was echt leuk', 'Het was heel leuk', 'Het was echt gezellig', 'Het was heel gezellig', 'Het was echt mooi', 'Het was heel mooi'] },
      { type: 'respond', situation: "A colleague asks 'Hoe was je weekend?' Tell them one thing you did and how it was.", npc: { nl: 'Hoe was je weekend?', en: 'How was your weekend?' }, intents: [i('did', 'Say what you did', 'heb|ben|hebben|zijn'), i('how', 'Say how it was', 'leuk|gezellig|rustig|druk|mooi|heerlijk|saai|was')], modelAnswers: ['Leuk! Ik ben naar de markt geweest en ik heb gekookt voor vrienden.', 'Rustig. Ik heb veel gelezen. Het was heerlijk.'] },
    ],
  }),
];
