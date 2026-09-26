import { defineLesson, i, line } from '../helpers.js';

export const b1Lessons = [
  defineLesson({
    id: 'b1.opinions',
    level: 'B1',
    unit: 'Expressing opinions',
    order: 1,
    title: 'Giving your opinion',
    subtitle: 'Agree, disagree and explain why — the Dutch way',
    canDo: 'I can give and justify my opinion, and politely agree or disagree.',
    minutes: 15,
    situation: {
      setting: 'Dinner with friends in Rotterdam. The conversation turns to a plan to ban cars from the city centre.',
      dialogue: [
        line('Noor', "Hebben jullie het gelezen? De gemeente wil auto's uit het centrum weren.", 'Have you read it? The municipality wants to ban cars from the centre.'),
        line('Bas', 'Eindelijk! Ik vind dat een heel goed plan. Er is veel te veel verkeer.', "Finally! I think that's a very good plan. There's far too much traffic."),
        line('Noor', 'Nou, ik weet het niet. Wat denk jij ervan?', "Well, I'm not sure. What do you think of it?"),
        line('You', "Ik ben het gedeeltelijk met Bas eens. Minder auto's is beter voor de lucht, maar winkeliers zijn misschien bang voor minder klanten.", 'I partly agree with Bas. Fewer cars is better for the air, but shopkeepers may be afraid of losing customers.'),
        line('Bas', 'Dat snap ik, maar in andere steden gaat het ook goed.', 'I get that, but it works fine in other cities too.'),
        line('Noor', 'Volgens mij is het vooral lastig voor oudere mensen. Die kunnen niet allemaal fietsen.', "In my view it's mostly difficult for older people. Not all of them can cycle."),
        line('You', 'Daar heb je gelijk in. Misschien moeten er dan betere bussen komen.', "You're right about that. Maybe there should be better buses, then."),
        line('Bas', 'Precies, dat is een goed punt.', "Exactly, that's a good point."),
      ],
    },
    vocabulary: [
      ['ik-vind-dat', 'Ik vind dat …', 'I think that …', 'Ik vind dat we meer moeten fietsen.', 'I think we should cycle more.', { note: "'Vinden' is for opinions; 'denken' for beliefs and expectations. After 'dat' the verb goes to the end." }],
      ['volgens-mij', 'Volgens mij …', 'In my opinion …', 'Volgens mij is dat niet waar.', "In my view that's not true.", { note: "The verb follows directly (V2): 'Volgens mij is…'" }],
      ['het-eens-zijn', 'Ik ben het (niet) met je eens', "I (don't) agree with you", 'Ik ben het helemaal met je eens.', 'I completely agree with you.', { band: 2, note: 'The structure wraps around: ik ben het met X eens.' }],
      ['gelijk-hebben', 'Je hebt gelijk', "You're right", 'Je hebt gelijk, dat is te duur.', "You're right, that's too expensive.", { note: "'Daar heb je gelijk in' = you're right about that." }],
      ['wat-vind-jij', 'Wat vind jij ervan?', 'What do you think (of it)?', 'Het nieuwe plan? Wat vind jij ervan?', 'The new plan? What do you think of it?'],
      ['nou-ik-weet-het-niet', 'Nou, ik weet het niet', "Well, I'm not sure", 'Nou, ik weet het niet. Is dat wel slim?', "Well, I'm not sure. Is that really smart?", { note: "A soft way to disagree. 'Nou' often signals doubt or an objection." }],
      ['goed-punt', 'Dat is een goed punt', "That's a good point", 'Dat is een goed punt, daar had ik niet aan gedacht.', "That's a good point, I hadn't thought of that."],
      ['aan-de-ene-kant', 'aan de ene kant … aan de andere kant', 'on the one hand … on the other hand', 'Aan de ene kant is het duur, aan de andere kant is het goed voor het milieu.', "On the one hand it's expensive, on the other hand it's good for the environment.", { band: 2 }],
    ],
    pronunciation: {
      focus: 'ij',
      tip: "'Gelijk' has a real, stressed IJ. But the suffix '-lijk' in 'eerlijk' or 'moeilijk' is weak — it sounds like 'luk'.",
      items: [
        { nl: 'Je hebt gelijk.', en: "You're right." },
        { nl: 'Volgens mij is het te duur.', en: "In my view it's too expensive." },
        { nl: 'Dat vind ik ook, eerlijk gezegd.', en: 'I think so too, honestly.' },
      ],
    },
    listening: {
      intro: 'A radio phone-in. What does the caller think about working from home?',
      lines: [
        line('Presenter', 'We hebben Linda aan de lijn. Linda, wat vind jij van thuiswerken?', 'We have Linda on the line. Linda, what do you think of working from home?'),
        line('Linda', 'Nou, ik vind het eigenlijk geweldig. Ik bespaar elke dag twee uur reistijd.', 'Well, I actually think it’s great. I save two hours of travel time every day.'),
        line('Presenter', "Maar mis je je collega's niet?", "But don't you miss your colleagues?"),
        line('Linda', 'Soms wel, ja. Daarom ga ik op dinsdag en donderdag naar kantoor. Dat is voor mij de perfecte balans.', "Sometimes, yes. That's why I go to the office on Tuesdays and Thursdays. For me that's the perfect balance."),
      ],
      questions: [
        { type: 'choice', prompt: "What is Linda's opinion?", options: ['She dislikes it', "She thinks it's great, with some office days", 'She wants to be in the office every day'], answer: 1 },
        { type: 'text', prompt: 'How much travel time does she save per day?', accept: ['twee uur', '2 uur', 'two hours', '2 hours', '2'] },
      ],
    },
    speaking: {
      prompt: 'Should cars be banned from city centres? Give your opinion and one reason.',
      mustInclude: [
        i('opinion', 'Give your opinion', 'vind|volgens mij|denk|mening|eens'),
        i('reason', 'Give a reason', 'omdat|want|dus|daarom|door'),
      ],
      modelAnswers: [
        'Ik vind het een goed idee, omdat er dan minder verkeer is.',
        'Volgens mij is het geen goed plan, want voor oudere mensen wordt het lastig.',
      ],
      hints: ['Ik vind dat …', '… omdat …', 'Volgens mij …'],
    },
    grammar: {
      title: 'Subordinate clauses: the verb goes to the end',
      explanation:
        "Words like **omdat** (because), **dat** (that), **als** (if/when), **hoewel** (although) and **terwijl** (while) start a subordinate clause, and its verb goes to the **end**: *Ik blijf thuis, **omdat** ik moe **ben**.* Compare **want** (also 'because'), which keeps normal order: *Ik blijf thuis, **want** ik **ben** moe.* If the subordinate clause comes first, the main clause starts with its verb: ***Als** het regent, **neem** ik de bus.*",
      examples: [
        { nl: 'Ik vind dat het te duur is.', en: 'I think it is too expensive.', highlight: 'is' },
        { nl: 'Ik fiets, omdat het gezond is.', en: "I cycle because it's healthy.", highlight: 'is' },
        { nl: 'Als het regent, neem ik de bus.', en: 'If it rains, I take the bus.', highlight: 'neem ik' },
      ],
      commonMistake: { wrong: 'Ik denk dat hij is ziek.', right: 'Ik denk dat hij ziek is.', why: "After 'dat' the verb goes to the end." },
    },
    culture: {
      title: 'Direct, not rude',
      body: "Dutch people are known for their directness: they say what they think and expect you to do the same. 'Ik vind het niet goed' isn't an attack — it's information. Disagreeing openly is normal, even with your boss, as long as you give arguments. There are softeners, though: 'Nou…', 'eigenlijk', 'misschien', 'ik weet het niet'. Flemish speakers tend to be more indirect and diplomatic than their northern neighbours.",
    },
    review: [
      { type: 'order', patternId: 'verb-final-subclause', en: 'I think that it is a good idea.', words: ['Ik', 'vind', 'dat', 'het', 'een', 'goed', 'idee', 'is'] },
      { type: 'fill', sentence: 'Ik ben het niet met je ___.', en: "I don't agree with you.", accept: ['eens'] },
      { type: 'choose', patternId: 'verb-final-subclause', prompt: 'Which is correct?', options: ['Ik blijf thuis, want ik ben ziek.', 'Ik blijf thuis, want ik ziek ben.'], answer: 0 },
      { type: 'translate', prompt: "You're right.", accept: ['Je hebt gelijk', 'Jij hebt gelijk', 'U hebt gelijk', 'U heeft gelijk'] },
      { type: 'respond', situation: "A friend says: 'Ik vind dat iedereen een elektrische auto moet kopen.' Disagree politely and give a reason.", npc: { nl: 'Ik vind dat iedereen een elektrische auto moet kopen.', en: 'I think everyone should buy an electric car.' }, intents: [i('disagree', 'Disagree politely', 'niet mee eens|niet eens|weet het niet|niet zo zeker|nou|twijfel'), i('reason', 'Give a reason', 'omdat|want|duur|fiets*|trein|niet iedereen')], modelAnswers: ['Nou, ik weet het niet. Ze zijn nog heel duur.', 'Daar ben ik het niet mee eens, want niet iedereen kan dat betalen.'] },
    ],
  }),

  defineLesson({
    id: 'b1.group-talk',
    level: 'B1',
    unit: 'Understanding conversations',
    order: 2,
    title: 'Keeping up in a group conversation',
    subtitle: 'Follow fast talk, jump in and use the little words',
    canDo: 'I can follow a group conversation at normal speed and join in at the right moment.',
    minutes: 15,
    situation: {
      setting: 'Friday drinks in a café in Utrecht. Colleagues talk fast and interrupt each other.',
      dialogue: [
        line('Jeroen', 'Zeg, hebben jullie die nieuwe koffiemachine al geprobeerd?', 'Hey, have you tried that new coffee machine yet?'),
        line('Esther', 'Ja, joh! Die koffie is echt niet te drinken.', 'Oh yes! That coffee is really undrinkable.'),
        line('Jeroen', "Nou, ik vind 'm eigenlijk wel oké.", "Well, I actually think it's okay."),
        line('Esther', 'Jij drinkt ook alles, haha.', 'You drink anything, haha.'),
        line('You', 'Mag ik even wat zeggen? Ik vind de koffie ook niet zo lekker, maar de thee is wel goed.', "Can I just say something? I don't think the coffee is great either, but the tea is good."),
        line('Jeroen', 'O, hebben ze ook thee? Dat wist ik niet eens!', "Oh, do they have tea too? I didn't even know that!"),
        line('Esther', 'Kijk, daarom moet je wat vaker naar de keuken lopen.', "See, that's why you should walk to the kitchen more often."),
      ],
    },
    vocabulary: [
      ['mag-ik-even-wat-zeggen', 'Mag ik even wat zeggen?', 'Can I just say something?', 'Sorry, mag ik even wat zeggen?', 'Sorry, can I just say something?', { note: "A polite way to jump in. More casual: 'Wacht even…' (hang on)." }],
      ['zeg', 'Zeg, …', 'Hey, …', 'Zeg, heb jij mijn sleutels gezien?', 'Hey, have you seen my keys?', { register: 'informal', note: "'Zeg' at the start grabs attention." }],
      ['joh', 'joh', '(friendly particle)', 'Nee joh, dat is niet erg!', "Oh no, that's no problem!", { register: 'informal', note: "Adds warmth or emphasis among friends. 'Welnee joh!' = of course not!" }],
      ['weet-je', 'weet je', 'you know', 'Het was, weet je, gewoon een rare dag.', 'It was, you know, just a weird day.', { register: 'informal', note: "A filler like English 'you know'." }],
      ['zeg-maar', 'zeg maar', 'sort of, like', 'Het is zeg maar een soort pannenkoek.', "It's sort of a kind of pancake.", { register: 'informal', band: 2 }],
      ['wacht-even', 'Wacht even', 'Hang on', 'Wacht even, wie bedoel je precies?', 'Hang on, who exactly do you mean?'],
      ['echt-waar', 'Echt waar?', 'Really?', 'Ze gaat verhuizen naar Canada. – Echt waar?', "She's moving to Canada. – Really?", { note: "Also: 'Serieus?' / 'Meen je dat?'" }],
      ['geen-idee', 'Geen idee', 'No idea', 'Hoe laat begint het? – Geen idee.', 'What time does it start? – No idea.'],
    ],
    pronunciation: {
      focus: 'eu',
      tip: "EU in 'leuk' and 'keuken' is everywhere in fast speech. Round your lips on an 'ee'.",
      items: [
        { nl: 'Dat is echt leuk!', en: "That's really fun!" },
        { nl: 'Je moet vaker naar de keuken lopen.', en: 'You should walk to the kitchen more often.' },
        { nl: 'Ik heb geen keus.', en: "I don't have a choice." },
      ],
    },
    listening: {
      intro: "A fast group chat about weekend plans. Who can't come on Saturday?",
      lines: [
        line('Anne', 'Oké, zaterdag barbecue bij mij. Wie komt er?', "Okay, barbecue at my place on Saturday. Who's coming?"),
        line('Tim', 'Ik! Zal ik vlees meenemen?', 'Me! Shall I bring meat?'),
        line('Sophie', 'Ik kan helaas niet, ik heb een bruiloft.', "Unfortunately I can't, I have a wedding."),
        line('Anne', 'Ah, jammer! Tim, neem maar worstjes mee. Esra, jij komt toch ook?', "Ah, too bad! Tim, just bring sausages. Esra, you're coming too, right?"),
        line('Esra', 'Tuurlijk! Ik maak een salade.', "Of course! I'll make a salad."),
      ],
      questions: [
        { type: 'choice', prompt: "Who can't come on Saturday?", options: ['Tim', 'Sophie', 'Esra'], answer: 1 },
        { type: 'choice', prompt: 'What will Esra bring?', options: ['Meat', 'Sausages', 'A salad'], answer: 2 },
        { type: 'choice', prompt: "In 'jij komt toch ook?', 'toch' makes it…", options: ['a question expecting yes', 'a complaint', 'a goodbye'], answer: 0 },
      ],
    },
    speaking: {
      prompt: "In a group conversation about holidays, jump in politely and say where you're going.",
      mustInclude: [
        i('jumpin', 'Jump in politely', 'mag ik|even wat|wacht even|trouwens|sorry|zeg'),
        i('share', 'Share your plan', 'ga|gaan|naar|vakantie'),
      ],
      modelAnswers: [
        'Mag ik even wat zeggen? Ik ga in juli naar Portugal.',
        'Trouwens, wij gaan deze zomer naar Italië. Weet je, met de trein!',
      ],
      hints: ['Mag ik even wat zeggen?', 'Trouwens, …'],
    },
    grammar: {
      title: 'Particles: toch, even, maar, wel, hoor',
      explanation:
        "Spoken Dutch is full of small **particles** that change the tone: **toch** asks for agreement (*Jij komt toch ook?* – You're coming, right?); **even** makes requests light (*Mag ik even…?*); **maar** encourages (*Neem maar mee* – go ahead and bring it); **wel** contrasts or reassures (*De thee is wel goed* – the tea is good, though); **hoor** makes a statement friendly (*Nee hoor* – oh no, not at all). They're hard to translate, but you'll hear them every few seconds.",
      examples: [
        { nl: 'Jij komt toch ook?', en: "You're coming too, right?", highlight: 'toch' },
        { nl: 'Mag ik even langs?', en: 'Can I just get past?', highlight: 'even' },
        { nl: 'Kom maar binnen!', en: 'Do come in!', highlight: 'maar' },
        { nl: 'Dat is wel lekker!', en: "That's actually tasty!", highlight: 'wel' },
      ],
      commonMistake: { wrong: 'Kom binnen! (to a guest, flat tone)', right: 'Kom maar binnen!', why: "Without 'maar' the imperative can sound bossy." },
    },
    culture: {
      title: 'Interrupting is fine (a bit)',
      body: "In Dutch group conversations people overlap and interrupt more than in, say, British conversation — it signals engagement. You don't need to wait for a long pause: jump in with 'Mag ik even…', 'Wacht even' or 'Maar…'. If people switch to English because you hesitate, a friendly 'Nee, ga maar door in het Nederlands!' keeps the conversation in Dutch.",
    },
    review: [
      { type: 'choose', prompt: "'Jij komt toch ook?' means…", options: ["You're coming too, right?", "You're not coming, are you?", 'Are you coming or not?'], answer: 0 },
      { type: 'fill', sentence: 'Mag ik ___ wat zeggen?', en: 'Can I just say something?', accept: ['even'] },
      { type: 'translate', prompt: 'No idea.', accept: ['Geen idee', 'Geen flauw idee', 'Ik heb geen idee'] },
      { type: 'choose', prompt: "A friend says 'Sorry dat ik te laat ben!' The warm reply:", options: ['Nee hoor, geen probleem!', 'Ja, je bent te laat.', 'Hoor!'], answer: 0 },
      { type: 'respond', situation: "Your friends are talking fast about a film you haven't seen. Jump in and ask what it's called.", intents: [i('jump', 'Jump in', 'wacht even|sorry|mag ik|even'), i('ask', 'Ask the title', 'hoe heet|welke film|wat is de naam|titel')], modelAnswers: ['Wacht even, hoe heet die film?', 'Sorry, mag ik even vragen: welke film bedoelen jullie?'] },
    ],
  }),

  defineLesson({
    id: 'b1.news',
    level: 'B1',
    unit: 'Dutch media',
    order: 3,
    title: 'News and podcasts',
    subtitle: 'Understand news items and talk about them',
    canDo: 'I can understand the main points of a news item and talk about it.',
    minutes: 15,
    situation: {
      setting: 'Breakfast. Your housemate Wouter reads the local news on his phone and tells you about it.',
      dialogue: [
        line('Wouter', 'Heb je het nieuws gehoord? Er is gisteren een nieuwe fietsbrug geopend in het centrum.', 'Have you heard the news? A new cycle bridge opened in the centre yesterday.'),
        line('You', 'O ja? Wat is er zo bijzonder aan?', "Oh really? What's so special about it?"),
        line('Wouter', 'Hij is alleen voor fietsers en voetgangers. Volgens de gemeente scheelt het tien minuten reistijd.', "It's only for cyclists and pedestrians. According to the municipality it saves ten minutes of travel time."),
        line('You', 'Handig! Hoeveel heeft hij gekost?', 'Handy! How much did it cost?'),
        line('Wouter', 'Dat staat er niet bij. Maar er is ook kritiek: bewoners klagen over overlast tijdens de bouw.', "It doesn't say. But there's criticism too: residents complain about the disruption during construction."),
        line('You', 'Dat snap ik wel. Waar lees je dat eigenlijk?', 'I can understand that. Where are you reading that, anyway?'),
        line('Wouter', 'Op een nieuwssite. En vanavond luister ik er een podcast over.', "On a news site. And tonight I'm listening to a podcast about it."),
      ],
    },
    vocabulary: [
      ['heb-je-gehoord', 'Heb je het gehoord?', 'Have you heard?', 'Heb je het gehoord? Ze gaan trouwen!', "Have you heard? They're getting married!"],
      ['volgens', 'volgens …', 'according to …', 'Volgens de politie was er niemand gewond.', 'According to the police nobody was hurt.', { band: 2 }],
      ['er-is-kritiek', 'Er is kritiek op …', 'There is criticism of …', 'Er is veel kritiek op het nieuwe plan.', 'There is a lot of criticism of the new plan.', { band: 2 }],
      ['klagen-over', 'klagen over', 'to complain about', 'Bewoners klagen over het lawaai.', 'Residents complain about the noise.', { band: 2 }],
      ['het-nieuws', 'het nieuws', 'the news', 'Ik kijk elke avond naar het nieuws.', 'I watch the news every evening.', { article: 'het' }],
      ['de-krant', 'de krant', 'the newspaper', 'Ik lees de krant op mijn telefoon.', 'I read the newspaper on my phone.', { article: 'de' }],
      ['naar-verluidt', 'naar verluidt', 'reportedly', 'Naar verluidt stopt de minister.', 'Reportedly the minister is stepping down.', { band: 4, register: 'formal', note: "News language. In speech: 'schijnbaar' or 'ze zeggen dat…'." }],
      ['wat-is-er-gebeurd', 'Wat is er gebeurd?', 'What happened?', 'Er staat politie voor de deur. Wat is er gebeurd?', 'There are police at the door. What happened?'],
    ],
    pronunciation: {
      focus: 'ou',
      tip: "OU in 'bouw' (construction) and 'koud': open start, rounded finish.",
      items: [
        { nl: 'Tijdens de bouw was er veel overlast.', en: 'During construction there was a lot of disruption.' },
        { nl: 'Het was koud, maar de bouw ging door.', en: 'It was cold, but construction continued.' },
        { nl: 'Ik hou van podcasts.', en: 'I love podcasts.' },
      ],
    },
    listening: {
      intro: 'A short news bulletin. What is the main story?',
      lines: [
        line('Newsreader', 'Goedenavond. Het is tien uur, dit is het nieuws.', "Good evening. It's ten o'clock, here is the news."),
        line('Newsreader', 'Door zware regen zijn vanmiddag in het zuiden van het land verschillende wegen overstroomd.', 'Because of heavy rain, several roads in the south of the country flooded this afternoon.'),
        line('Newsreader', 'De brandweer heeft tientallen kelders leeggepompt. Er zijn geen gewonden gevallen.', 'The fire brigade pumped out dozens of cellars. Nobody was injured.'),
        line('Newsreader', 'Morgen wordt het droger, met in de middag wat zon.', 'Tomorrow will be drier, with some sun in the afternoon.'),
      ],
      questions: [
        { type: 'choice', prompt: 'What happened?', options: ['A fire', 'Roads flooded after heavy rain', 'A train strike'], answer: 1 },
        { type: 'choice', prompt: 'Were there injuries?', options: ['Yes, many', 'No'], answer: 1 },
        { type: 'choice', prompt: "What's the forecast for tomorrow?", options: ['More rain', 'Drier, with some sun', 'Snow'], answer: 1 },
      ],
    },
    speaking: {
      prompt: 'Tell a friend about a news item you read recently: what happened and what you think about it.',
      mustInclude: [
        i('what', 'Say what happened', 'gelezen|gehoord|in het nieuws|er is|er zijn|volgens|gebeurd'),
        i('opinion', 'Give your reaction', 'vind|denk|volgens mij|erg|goed|slecht|interessant|raar|handig'),
      ],
      modelAnswers: [
        'Ik heb gelezen dat de trein duurder wordt. Ik vind dat echt niet goed.',
        'Volgens het nieuws is er een nieuwe fietsbrug. Ik denk dat dat heel handig is.',
      ],
      hints: ['Ik heb gelezen dat …', 'Ik vind dat …'],
    },
    grammar: {
      title: 'The passive: wordt … geopend, is … geopend',
      explanation:
        "News language loves the **passive**, because the action matters more than who did it. Present: **worden** + participle: *De brug **wordt** morgen **geopend**.* Completed action in the past: **zijn** + participle: *De brug **is** gisteren **geopend**.* The one who did it follows **door**: *…geopend **door** de burgemeester.* In everyday speech people often use an active sentence with *ze*: *Ze openen morgen de brug.*",
      examples: [
        { nl: 'De brug wordt morgen geopend.', en: 'The bridge will be opened tomorrow.', highlight: 'wordt … geopend' },
        { nl: 'De brug is gisteren geopend door de burgemeester.', en: 'The bridge was opened by the mayor yesterday.', highlight: 'is … geopend' },
        { nl: 'Er wordt veel gepraat over het plan.', en: "There's a lot of talk about the plan.", highlight: 'wordt … gepraat' },
      ],
      commonMistake: { wrong: 'De brug heeft geopend.', right: 'De brug is geopend.', why: 'The passive past uses zijn + participle.' },
    },
    culture: {
      title: 'Where to listen',
      body: "Public broadcasting in the Netherlands (NPO, with the NOS news) and in Flanders (VRT NWS) offers free news in clear standard Dutch — ideal listening practice. Many learners start with the Jeugdjournaal, the children's news, which explains the same stories in simpler language. Dutch podcasts cover everything from true crime to history; hosts often talk fast and casually, so try them at 0.8× speed first.",
    },
    review: [
      { type: 'choose', prompt: "'Volgens de politie…' means…", options: ['According to the police…', 'Against the police…', 'Following the police car…'], answer: 0 },
      { type: 'fill', sentence: 'De brug ___ morgen geopend.', en: 'The bridge will be opened tomorrow.', accept: ['wordt'] },
      { type: 'translate', prompt: 'What happened?', accept: ['Wat is er gebeurd', 'Wat is er aan de hand', 'Wat gebeurde er'] },
      { type: 'order', en: 'Residents complain about the noise.', words: ['Bewoners', 'klagen', 'over', 'het', 'lawaai'] },
      { type: 'dictation', nl: 'Er zijn geen gewonden gevallen.', en: 'Nobody was injured.' },
    ],
  }),

  defineLesson({
    id: 'b1.meetings',
    level: 'B1',
    unit: 'Workplace communication',
    order: 4,
    title: 'Meetings and workplace communication',
    subtitle: 'Make suggestions, react to proposals and summarise agreements',
    canDo: 'I can take part in a work meeting: make a suggestion, react to others and summarise agreements.',
    minutes: 15,
    situation: {
      setting: 'A Monday team meeting about a project that is running late.',
      dialogue: [
        line('Linda', 'Oké, zullen we beginnen? Punt één: de planning van het project.', 'Okay, shall we start? Item one: the project schedule.'),
        line('Kees', 'We lopen twee weken achter. De leverancier is te laat.', "We're two weeks behind. The supplier is late."),
        line('Linda', 'Wat stellen jullie voor?', 'What do you suggest?'),
        line('You', 'Ik stel voor dat we de deadline een week opschuiven en de klant vandaag bellen.', 'I suggest we move the deadline by a week and call the client today.'),
        line('Kees', 'Goed idee, maar ik denk niet dat een week genoeg is.', "Good idea, but I don't think a week is enough."),
        line('Linda', 'Zullen we het zo afspreken: jij belt de klant, en Kees vraagt de leverancier om een nieuwe datum?', 'Shall we agree on this: you call the client, and Kees asks the supplier for a new date?'),
        line('You', 'Prima. Ik stuur vanmiddag een samenvatting per mail.', "Fine. I'll send a summary by email this afternoon."),
      ],
    },
    vocabulary: [
      ['ik-stel-voor', 'Ik stel voor dat …', 'I suggest that …', 'Ik stel voor dat we morgen verder praten.', 'I suggest we continue tomorrow.', { band: 2, note: "Voorstellen = to suggest (and also: to introduce). Separable: ik stel voor." }],
      ['achterlopen', 'achterlopen (op schema)', 'to be behind (schedule)', 'We lopen een week achter op schema.', "We're a week behind schedule.", { band: 3 }],
      ['afspreken', 'Zullen we het zo afspreken?', 'Shall we agree on that?', "Zullen we het zo afspreken? Jij doet de presentatie.", "Shall we agree on that? You'll do the presentation.", { note: "'Afgesproken!' = Deal!" }],
      ['het-overleg', 'het overleg', 'the meeting, consultation', 'Het overleg begint om tien uur.', 'The meeting starts at ten.', { article: 'het', band: 2 }],
      ['de-agenda', 'de agenda', 'the agenda; the diary', 'Wat staat er op de agenda?', "What's on the agenda?", { article: 'de' }],
      ['samenvatting', 'een samenvatting', 'a summary', 'Ik stuur je een korte samenvatting.', "I'll send you a short summary.", { band: 2 }],
      ['met-vriendelijke-groet', 'Met vriendelijke groet', 'Kind regards', 'Met vriendelijke groet, Sam Taylor', 'Kind regards, Sam Taylor', { register: 'formal', note: "The standard email closing. Less formal: 'Groet,' — among friends: 'Groetjes'." }],
      ['beste', 'Beste …,', 'Dear …,', 'Beste Linda,', 'Dear Linda,', { note: "The default email opening, formal or informal. 'Geachte heer/mevrouw' is very formal." }],
    ],
    pronunciation: {
      focus: 'sch',
      tip: "SCH in 'schema' = s + ch. But at the end of a word, '-isch' is just 's': 'praktisch' sounds like 'praktis'.",
      items: [
        { nl: 'We lopen achter op schema.', en: "We're behind schedule." },
        { nl: 'Ik stuur een schriftelijke samenvatting.', en: "I'll send a written summary." },
        { nl: 'Dat is niet praktisch.', en: "That's not practical." },
      ],
    },
    listening: {
      intro: "A colleague's voicemail. What does Priya ask you to do?",
      lines: [
        line('Priya', 'Hoi, met Priya. Ik bel even over de presentatie van donderdag.', "Hi, it's Priya. I'm just calling about Thursday's presentation."),
        line('Priya', 'Kun jij de cijfers van het laatste kwartaal nog even controleren? Ik denk dat er een fout in zit.', "Could you check the figures from the last quarter? I think there's a mistake in them."),
        line('Priya', 'Als het lukt, graag voor woensdag twaalf uur. Bel me maar als er iets is. Doei!', "If possible, before twelve o'clock on Wednesday. Call me if there's anything. Bye!"),
      ],
      questions: [
        { type: 'choice', prompt: 'What should you do?', options: ['Prepare the presentation', "Check last quarter's figures", 'Book a room'], answer: 1 },
        { type: 'choice', prompt: 'By when?', options: ['Wednesday 12:00', 'Thursday 12:00', 'Today'], answer: 0 },
      ],
    },
    speaking: {
      prompt: 'In a meeting, suggest a solution for a problem (for example: too many emails) and say who does what.',
      mustInclude: [
        i('suggest', 'Make a suggestion', 'stel voor|voorstel|zullen we|misschien kunnen|wat als|ik zou'),
        i('who', 'Say who does what', 'ik|jij|we|wij|hij|zij'),
      ],
      modelAnswers: [
        'Ik stel voor dat we één keer per week een kort overleg hebben. Ik maak de agenda.',
        'Zullen we een gedeelde lijst maken? Dan stuur ik vanmiddag een voorbeeld.',
      ],
      hints: ['Ik stel voor dat …', 'Zullen we …?'],
    },
    grammar: {
      title: 'Polite suggestions: zullen, zou, kunnen',
      explanation:
        "Dutch meetings are direct but polite. Useful structures: **Zullen we…?** (Shall we…?) · **Ik stel voor dat…** (+ verb at the end) · **Zou je … kunnen…?** (Could you…?) · **Misschien kunnen we…** (Maybe we could…). The conditional **zou/zouden** softens: *Ik **zou** het anders doen* (I'd do it differently).",
      examples: [
        { nl: 'Zullen we om twee uur verder gaan?', en: 'Shall we continue at two?', highlight: 'Zullen we' },
        { nl: 'Zou je dat even kunnen controleren?', en: 'Could you check that?', highlight: 'Zou … kunnen' },
        { nl: 'Misschien kunnen we het uitstellen.', en: 'Maybe we could postpone it.', highlight: 'kunnen' },
      ],
      commonMistake: { wrong: 'Ik stel voor dat we moeten beginnen nu.', right: 'Ik stel voor dat we nu beginnen.', why: "After 'dat' the verb goes to the end — and 'voorstellen' already carries the suggestion." },
    },
    culture: {
      title: 'The polder model',
      body: "Dutch decision-making is famous for 'polderen': discussing until everyone can live with the outcome. Meetings can take a while, and everyone — juniors too — is expected to contribute. Once something is agreed ('afgesproken'), people hold you to it. Emails are short and to the point: 'Beste Linda, … Met vriendelijke groet'. In Flanders, workplace culture is somewhat more hierarchical and formal.",
    },
    review: [
      { type: 'order', patternId: 'verb-final-subclause', en: 'I suggest that we start tomorrow.', words: ['Ik', 'stel', 'voor', 'dat', 'we', 'morgen', 'beginnen'] },
      { type: 'fill', sentence: 'We lopen twee weken ___.', en: "We're two weeks behind.", accept: ['achter'] },
      { type: 'choose', prompt: 'A standard way to close a work email:', options: ['Doei!', 'Met vriendelijke groet,', 'Tot ziens,'], answer: 1 },
      { type: 'translate', prompt: 'Could you check that?', accept: ['Zou je dat kunnen controleren', 'Zou je dat even kunnen controleren', 'Kun je dat controleren', 'Kun je dat even controleren', 'Kunt u dat controleren', 'Zou u dat kunnen controleren'] },
      { type: 'respond', situation: 'End of the meeting: summarise the agreement — you will call the client, and Kees contacts the supplier.', intents: [i('me', 'Say what you will do', 'ik bel|ik neem contact|ik zal|bel ik'), i('kees', 'Say what Kees does', 'kees')], modelAnswers: ['Dus afgesproken: ik bel de klant en Kees belt de leverancier.', 'Oké, ik bel vandaag de klant, en Kees neemt contact op met de leverancier.'] },
    ],
  }),

  defineLesson({
    id: 'b1.storytelling',
    level: 'B1',
    unit: 'Storytelling',
    order: 5,
    title: 'Telling a story',
    subtitle: 'Use the simple past, build suspense and react to stories',
    canDo: 'I can tell a story or anecdote in the past, and react when others tell one.',
    minutes: 15,
    situation: {
      setting: "A birthday dinner. Your friend Sanne tells a funny story about her holiday.",
      dialogue: [
        line('Sanne', 'Je raadt nooit wat me in Italië overkwam.', "You'll never guess what happened to me in Italy."),
        line('You', 'Nou, vertel!', 'Well, tell me!'),
        line('Sanne', 'We zaten op een terras en ineens stond er een man naast me. Hij had mijn tas in zijn hand!', 'We were sitting on a terrace and suddenly there was a man standing next to me. He had my bag in his hand!'),
        line('You', 'Nee! Een dief?', 'No! A thief?'),
        line('Sanne', 'Dat dacht ik ook. Ik begon te schreeuwen, en toen bleek het de ober te zijn. Mijn tas was van de stoel gevallen.', "That's what I thought too. I started shouting, and then it turned out to be the waiter. My bag had fallen off the chair."),
        line('You', 'Haha, wat gênant! Wat zei hij?', 'Haha, how embarrassing! What did he say?'),
        line('Sanne', 'Hij lachte gewoon en bracht ons een gratis limoncello.', 'He just laughed and brought us a free limoncello.'),
      ],
    },
    vocabulary: [
      ['je-raadt-nooit', 'Je raadt nooit …', "You'll never guess …", 'Je raadt nooit wie ik vandaag zag!', "You'll never guess who I saw today!", { note: "A classic story opener. Also: 'Moet je horen!' (Listen to this!)" }],
      ['vertel', 'Vertel!', 'Tell me!', 'Je hebt nieuws? Vertel!', 'You have news? Tell me!', { register: 'informal' }],
      ['ineens', 'ineens / opeens', 'suddenly', 'Ineens ging het licht uit.', 'Suddenly the lights went out.', { band: 2 }],
      ['bleek', 'het bleek …', 'it turned out …', 'Het bleek een grap te zijn.', 'It turned out to be a joke.', { band: 3, note: "From 'blijken'. Also: 'Achteraf bleek dat…' (Afterwards it turned out that…)." }],
      ['wat-genant', 'Wat gênant!', 'How embarrassing!', 'Ik noemde haar de verkeerde naam. Wat gênant!', 'I called her by the wrong name. How embarrassing!', { band: 3 }],
      ['en-toen', 'En toen?', 'And then?', 'We misten de laatste trein. – En toen?', 'We missed the last train. – And then?', { note: "Keep a story going: 'En toen?', 'Echt?', 'Nee!', 'Wat erg!'" }],
      ['moet-je-horen', 'Moet je horen!', 'Listen to this!', 'Moet je horen wat er gisteren gebeurde!', 'Listen to what happened yesterday!'],
      ['wat-erg', 'Wat erg!', 'How awful!', 'Hij is zijn portemonnee kwijt. – Wat erg!', "He's lost his wallet. – How awful!"],
    ],
    pronunciation: {
      focus: 'sch',
      tip: "In 'schreeuwen' say s + ch + r: three sounds in a row. Take it slowly at first.",
      items: [
        { nl: 'Ik begon te schreeuwen.', en: 'I started shouting.' },
        { nl: 'Het was een schok.', en: 'It was a shock.' },
        { nl: 'Wat een schitterend verhaal!', en: 'What a wonderful story!' },
      ],
    },
    listening: {
      intro: 'Ahmed tells about his first week in the Netherlands. What surprised him?',
      lines: [
        line('Ahmed', 'Mijn eerste week in Nederland zal ik nooit vergeten.', "I'll never forget my first week in the Netherlands."),
        line('Ahmed', 'Ik had een fiets gekocht, maar ik kon nog niet zo goed fietsen in de drukte.', "I had bought a bike, but I couldn't cycle very well in the busy traffic yet."),
        line('Ahmed', 'Op de derde dag reed ik bijna een oude mevrouw aan. Ik schrok me dood!', 'On the third day I almost hit an elderly lady. I was scared to death!'),
        line('Ahmed', "Maar zij was helemaal niet boos. Ze zei alleen: 'Rustig aan, jongen, je leert het wel.'", "But she wasn't angry at all. She only said: 'Take it easy, lad, you'll learn.'"),
        line('Ahmed', 'Dat vond ik zo typisch Nederlands: direct, maar vriendelijk.', 'I found that so typically Dutch: direct, but friendly.'),
      ],
      questions: [
        { type: 'choice', prompt: 'What happened on the third day?', options: ['He lost his bike', 'He almost hit an elderly lady', 'He got lost'], answer: 1 },
        { type: 'choice', prompt: 'How did the woman react?', options: ['She was very angry', 'She was calm and friendly', 'She called the police'], answer: 1 },
      ],
    },
    speaking: {
      prompt: "Tell a short anecdote (funny, embarrassing or surprising) in the past. Use at least one story word like 'ineens', 'toen' or 'uiteindelijk'.",
      mustInclude: [
        i('past', 'Use the past tense', 'was|had|ging|kwam|zag|zei|dacht|heb|ben|werd|zat'),
        i('linkers', 'Use story words', 'ineens|opeens|toen|daarna|uiteindelijk|eerst|achteraf'),
      ],
      modelAnswers: [
        "Vorige week zat ik in de trein. Ineens zag ik mijn oude leraar. Toen zei hij: 'Spreek je nu Nederlands?'",
        'Eerst dacht ik dat mijn fiets gestolen was. Uiteindelijk bleek dat ik hem bij het station had laten staan.',
      ],
      hints: ['Vorige week …', 'Ineens …', 'Uiteindelijk …'],
    },
    grammar: {
      title: 'The simple past (imperfectum)',
      explanation:
        "When telling stories, Dutch often switches from the perfect to the **simple past**: *ik zat, hij zei, we gingen*. Regular verbs add **-te(n)** or **-de(n)** ('t kofschip again): *werken → werkte(n)*, *wonen → woonde(n)*. The most frequent verbs are irregular: *zijn → was/waren, hebben → had/hadden, gaan → ging, komen → kwam, zien → zag, zeggen → zei, doen → deed*. A typical pattern: open with the perfect (*Ik heb iets geks meegemaakt*), then tell the story in the simple past.",
      examples: [
        { nl: 'Ik werkte toen in Rotterdam.', en: 'I was working in Rotterdam at the time.', highlight: 'werkte' },
        { nl: 'We woonden in een klein huis.', en: 'We lived in a small house.', highlight: 'woonden' },
        { nl: 'Ineens kwam er een man binnen.', en: 'Suddenly a man came in.', highlight: 'kwam' },
        { nl: 'Ze zei niets en ging weg.', en: 'She said nothing and left.', highlight: 'zei … ging' },
      ],
      commonMistake: { wrong: 'Ik werkde in een winkel.', right: 'Ik werkte in een winkel.', why: "'Werk' ends in k (in 't kofschip), so the past ending is -te." },
    },
    culture: {
      title: 'Understatement and active listening',
      body: "Dutch storytellers love understatement and self-mockery: a disaster is 'niet helemaal handig' (not entirely clever), a big success 'best aardig' (quite nice). Listeners react actively — 'Nee!', 'Echt?', 'Wat erg!', 'En toen?' — so a story becomes a little dialogue. Over-the-top drama may be met with a dry 'Nou, nou…'.",
    },
    review: [
      { type: 'fill', sentence: 'Gisteren ___ ik mijn oude leraar. (zien)', en: 'Yesterday I saw my old teacher.', accept: ['zag'] },
      { type: 'fill', sentence: 'We ___ vroeger in Gent. (wonen)', en: 'We used to live in Ghent.', accept: ['woonden'] },
      { type: 'choose', prompt: "A friend says 'Ik ben mijn paspoort kwijt!' A natural reaction:", options: ['Wat erg!', 'Wat leuk!', 'Proost!'], answer: 0 },
      { type: 'order', patternId: 'word-order-v2', en: 'Suddenly the lights went out.', words: ['Ineens', 'ging', 'het', 'licht', 'uit'] },
      { type: 'translate', prompt: 'It turned out to be a joke.', accept: ['Het bleek een grap te zijn', 'Het bleek een grapje te zijn', 'Het was een grap', 'Het was een grapje'] },
      { type: 'respond', situation: "Your friend starts: 'Je raadt nooit wat me vandaag overkwam!' Encourage the story.", npc: { nl: 'Je raadt nooit wat me vandaag overkwam!', en: "You'll never guess what happened to me today!" }, intents: [i('encourage', 'Encourage them to tell', 'vertel|wat dan|nou|echt|zeg het maar')], modelAnswers: ['Nou, vertel!', 'Echt? Wat dan?'] },
    ],
  }),
];
