import { defineLesson, i, line } from '../helpers.js';

export const b2Lessons = [
  defineLesson({
    id: 'b2.natural',
    level: 'B2',
    unit: 'Natural conversations',
    order: 1,
    title: 'Sounding natural: softeners and fillers',
    subtitle: 'Use eigenlijk, gewoon, best, nou and even like a native',
    canDo: 'I can use common particles and fillers to sound natural and friendly in conversation.',
    minutes: 15,
    situation: {
      setting: 'Your neighbour Femke asks you to help carry a cabinet upstairs.',
      dialogue: [
        line('Femke', 'Zeg, zou je me even kunnen helpen? Die kast moet naar boven.', 'Hey, could you help me for a moment? That cabinet needs to go upstairs.'),
        line('You', 'Ja hoor, geen probleem. Nu meteen?', 'Sure, no problem. Right now?'),
        line('Femke', 'Als het uitkomt, graag. Het is eigenlijk best zwaar, dus rustig aan.', "If it suits you, please. It's actually quite heavy, so take it easy."),
        line('You', 'Oké, pak jij die kant maar, dan til ik hier.', "Okay, you take that side, and I'll lift here."),
        line('Femke', 'Wacht even… zo. Nou, gaat-ie?', "Hang on… there. Well, how's it going?"),
        line('You', 'Ja, gaat wel. Gewoon langzaam blijven lopen.', "Yeah, it's okay. Just keep walking slowly."),
        line('Femke', 'Top, hij staat! Heel erg bedankt, hoor. Wil je iets drinken?', "Great, it's in place! Thanks so much. Would you like something to drink?"),
        line('You', 'Nou, een biertje zou er wel in gaan.', "Well, I wouldn't say no to a beer."),
      ],
    },
    vocabulary: [
      ['eigenlijk', 'eigenlijk', 'actually; really', 'Eigenlijk heb ik geen zin.', "Actually, I don't feel like it.", { note: 'Softens statements and refusals. Extremely frequent.' }],
      ['gewoon', 'gewoon', 'just, simply; normal', 'Doe gewoon wat je wilt.', 'Just do what you want.', { note: "Downplays: 'Het is gewoon een kleine fout' (it's just a small mistake)." }],
      ['best', 'best', 'quite; fine', 'Het is best duur. – Dat is best.', "It's quite expensive. – That's fine.", { note: "As a particle 'best' means 'quite' — not 'best'! 'Het is best goed' = it's pretty good." }],
      ['nou', 'nou', 'well', 'Nou, dat valt tegen.', "Well, that's disappointing.", { note: 'Starts a reaction — often hesitation or an objection.' }],
      ['hoor', 'hoor', '(reassuring particle)', 'Dat is prima, hoor.', "That's fine, really.", { note: "'Nee hoor' = no, not at all." }],
      ['gaat-wel', 'Gaat wel', "So-so; it's okay", 'Hoe was het examen? – Gaat wel.', 'How was the exam? – So-so.', { register: 'informal' }],
      ['rustig-aan', 'Rustig aan', 'Take it easy', 'Rustig aan, we hebben tijd genoeg.', 'Take it easy, we have plenty of time.'],
      ['zou-er-wel-in-gaan', 'Dat zou er wel in gaan', "I wouldn't say no to that", 'Een stukje taart? – Dat zou er wel in gaan!', "A piece of cake? – I wouldn't say no!", { register: 'informal', band: 3 }],
    ],
    pronunciation: {
      focus: 'w',
      tip: "W in 'gewoon', 'wel', 'wacht': upper teeth lightly on the lower lip, no buzz. Particles are unstressed — say them lightly and quickly.",
      items: [
        { nl: 'Gewoon langzaam blijven lopen.', en: 'Just keep walking slowly.' },
        { nl: 'Wacht even!', en: 'Hang on!' },
        { nl: 'Dat gaat wel.', en: "That's okay." },
      ],
    },
    listening: {
      intro: 'Two friends plan a dinner. Listen for the particles. What should Jesse bring?',
      lines: [
        line('Mila', 'Zullen we zaterdag gewoon bij mij eten?', 'Shall we just eat at my place on Saturday?'),
        line('Jesse', 'Leuk! Moet ik iets meenemen?', 'Nice! Should I bring anything?'),
        line('Mila', 'Nee hoor, hoeft niet. Nou ja, misschien een fles wijn, als je wilt.', 'No, no need. Well, maybe a bottle of wine, if you like.'),
        line('Jesse', 'Doe ik. Eigenlijk kan ik ook wel een toetje maken.', 'Will do. Actually, I could make a dessert too.'),
        line('Mila', 'O, dat is wel heel lief. Maar echt, doe geen moeite, hè.', "Oh, that's really sweet. But really, don't go to any trouble, okay?"),
      ],
      questions: [
        { type: 'choice', prompt: 'What does Mila say about bringing something?', options: ['Bring wine and dessert', 'No need — well, maybe a bottle of wine', 'Bring nothing at all'], answer: 1 },
        { type: 'choice', prompt: "What does 'doe geen moeite' mean?", options: ["Don't go to any trouble", "Don't come", "Don't be late"], answer: 0 },
      ],
    },
    speaking: {
      prompt: "A friend asks you to help them move on Saturday, but you can't really. Say no politely with softeners (eigenlijk, helaas, nou…) and offer an alternative.",
      mustInclude: [
        i('soft', 'Use a softener', 'eigenlijk|helaas|nou|misschien|sorry|jammer genoeg'),
        i('decline', 'Decline', 'kan niet|kan ik|lukt|geen tijd|niet zo goed|niet uit'),
        i('alt', 'Offer an alternative', 'wel|misschien|volgende|zondag|andere keer|zal ik'),
      ],
      modelAnswers: [
        'Nou, eigenlijk kan ik zaterdag niet zo goed. Maar zondag kan ik wel even helpen.',
        'Sorry, zaterdag lukt helaas niet. Zal ik volgende week langskomen?',
      ],
      hints: ['Nou, eigenlijk …', 'Maar … kan ik wel …'],
    },
    grammar: {
      title: 'Softening: particles, zou and diminutives',
      explanation:
        "Native speakers rarely give a bare 'no' or a bare order. They soften with **particles** (*eigenlijk, even, maar, wel, hoor*), the conditional **zou** (*Zou je me kunnen helpen?*) and **diminutives** (*even een vraagje* – just a quick question). Compare: *Help me.* (bossy) → *Kun je me even helpen?* (normal) → *Zou je me heel even kunnen helpen?* (very polite).",
      examples: [
        { nl: 'Kun je me even helpen?', en: 'Can you help me for a moment?', highlight: 'even' },
        { nl: 'Zou je me even kunnen helpen?', en: 'Could you help me for a sec?', highlight: 'Zou … kunnen' },
        { nl: 'Ik heb even een vraagje.', en: 'I just have a quick question.', highlight: 'vraagje' },
        { nl: 'Eigenlijk heb ik geen tijd.', en: "Actually, I don't have time.", highlight: 'Eigenlijk' },
      ],
      commonMistake: { wrong: 'Het is best restaurant.', right: 'Het is het beste restaurant.', why: "As a particle 'best' means 'quite'. The superlative is 'het beste'." },
    },
    culture: {
      title: 'Direct, with a cushion',
      body: "Dutch directness comes with its own cushions: 'eigenlijk', 'even', 'hoor' and diminutives keep things friendly without losing clarity. 'Nee hoor' sounds warm; a bare 'Nee.' can sound cold. Overdoing politeness ('Zou u misschien eventueel…') can sound stiff or even sarcastic — aim for the middle: 'Kun je even…?'",
    },
    review: [
      { type: 'choose', prompt: "'Het is best duur' means…", options: ["It's the most expensive", "It's quite expensive", "It isn't expensive"], answer: 1 },
      { type: 'fill', sentence: 'Kun je me ___ helpen?', en: 'Can you help me for a moment?', accept: ['even'] },
      { type: 'choose', prompt: 'Which sounds friendliest when refusing a second coffee?', options: ['Nee.', 'Nee hoor, dank je!', 'Ik wil niet.'], answer: 1 },
      { type: 'translate', prompt: "Actually, I don't feel like it.", accept: ['Eigenlijk heb ik geen zin', 'Ik heb eigenlijk geen zin', 'Eigenlijk heb ik er geen zin in', 'Ik heb er eigenlijk geen zin in'] },
      { type: 'respond', situation: "A colleague asks 'Kun jij morgen mijn dienst overnemen?' You can't. Say no in a natural, friendly way.", npc: { nl: 'Kun jij morgen mijn dienst overnemen?', en: 'Could you cover my shift tomorrow?' }, intents: [i('decline', 'Decline', 'kan niet|kan ik|lukt niet|helaas|geen tijd|jammer')], modelAnswers: ['Sorry, morgen lukt helaas niet.', 'Ah, jammer, morgen kan ik echt niet. Misschien een andere keer?'] },
    ],
  }),

  defineLesson({
    id: 'b2.idioms',
    level: 'B2',
    unit: 'Idioms',
    order: 2,
    title: 'Dutch idioms',
    subtitle: 'Understand and use common expressions',
    canDo: 'I can understand and use common Dutch idioms in the right situations.',
    minutes: 15,
    situation: {
      setting: 'Coffee break with colleagues. Team leader Wim talks about the new director.',
      dialogue: [
        line('Wim', 'Nou, de nieuwe directeur valt echt met de deur in huis.', 'Well, the new director really gets straight to the point.'),
        line('Priya', 'Hoezo? Wat is er gebeurd?', 'How so? What happened?'),
        line('Wim', 'Hij wil alles veranderen. Ik heb er een hard hoofd in.', 'He wants to change everything. I have serious doubts about it.'),
        line('Priya', 'Ach, ik zou eerst de kat uit de boom kijken. Misschien valt het mee.', "Oh, I'd wait and see first. Maybe it won't be so bad."),
        line('You', 'En wat vindt de rest van het team?', 'And what does the rest of the team think?'),
        line('Wim', 'Die zitten ook met de handen in het haar. Maar goed, het is geen ramp.', "They're at their wits' end too. But okay, it's not a disaster."),
        line('Priya', 'Precies. We zien wel. Nu eerst koffie, anders word ik chagrijnig.', "Exactly. We'll see. Coffee first, otherwise I'll get grumpy."),
      ],
    },
    vocabulary: [
      ['met-de-deur-in-huis', 'met de deur in huis vallen', 'to get straight to the point', 'Ik val maar meteen met de deur in huis: ik stop.', "I'll get straight to the point: I'm quitting.", { band: 3, note: "Literally 'to fall into the house with the door'." }],
      ['hard-hoofd', 'er een hard hoofd in hebben', 'to have serious doubts', 'Ik heb er een hard hoofd in dat we op tijd klaar zijn.', "I seriously doubt we'll be ready on time.", { band: 4 }],
      ['kat-uit-de-boom', 'de kat uit de boom kijken', 'to wait and see', 'Ik kijk eerst de kat uit de boom.', "I'll wait and see first.", { band: 3, note: "Literally 'to watch the cat out of the tree'." }],
      ['handen-in-het-haar', 'met de handen in het haar zitten', "to be at one's wits' end", 'Ik zit met de handen in het haar: mijn laptop is kapot.', "I'm at my wits' end: my laptop is broken.", { band: 4 }],
      ['valt-mee', 'Het valt mee', "It's not as bad as expected", 'Was het examen moeilijk? – Het viel mee.', "Was the exam hard? – It wasn't too bad.", { note: "Opposite: 'Het valt tegen' (it's disappointing)." }],
      ['makkie', 'Dat is een makkie', "That's a piece of cake", 'Die toets? Dat is een makkie!', "That test? It's a piece of cake!", { register: 'informal', band: 3 }],
      ['regent-pijpenstelen', 'Het regent pijpenstelen', "It's raining cats and dogs", 'Neem een paraplu mee, het regent pijpenstelen!', "Bring an umbrella, it's pouring!", { band: 4 }],
      ['aap-uit-de-mouw', 'Daar komt de aap uit de mouw', "So that's what it's really about", 'Hij wil geld lenen? Daar komt de aap uit de mouw.', "He wants to borrow money? So that's what it's really about.", { band: 4, note: 'The hidden motive is revealed.' }],
    ],
    pronunciation: {
      focus: 'ui',
      tip: "Idioms are full of UI and OU: 'huis', 'uit', 'mouw'. Keep them apart: UI with rounded, forward lips; OU opening wider.",
      items: [
        { nl: 'Hij valt met de deur in huis.', en: 'He gets straight to the point.' },
        { nl: 'Daar komt de aap uit de mouw.', en: "So that's what it's about." },
        { nl: 'De kat uit de boom kijken.', en: 'To wait and see.' },
      ],
    },
    listening: {
      intro: 'A radio sketch: two neighbours argue about a hedge. Which expression means "wait and see"?',
      lines: [
        line('Gerrit', 'Die heg van jou is veel te hoog. Ik zie geen zon meer!', "That hedge of yours is far too high. I can't see the sun anymore!"),
        line('Joke', 'Nou, nou, je hoeft niet meteen op je achterste benen te staan.', "Well, well, no need to get so defensive straight away."),
        line('Gerrit', 'Ik zeg gewoon waar het op staat.', "I'm just telling it like it is."),
        line('Joke', 'Oké. Ik bel volgende week de tuinman. Laten we even de kat uit de boom kijken.', "Okay. I'll call the gardener next week. Let's wait and see."),
        line('Gerrit', 'Prima. Maar als het dan niet gebeurt, trek ik aan de bel!', "Fine. But if it doesn't happen then, I'm raising the alarm!"),
      ],
      questions: [
        { type: 'choice', prompt: "Which expression means 'wait and see'?", options: ['op je achterste benen staan', 'de kat uit de boom kijken', 'aan de bel trekken'], answer: 1 },
        { type: 'choice', prompt: "'Op je achterste benen staan' means…", options: ['to get angry or defensive', 'to be very tall', 'to run away'], answer: 0 },
        { type: 'choice', prompt: "'Aan de bel trekken' means…", options: ['to ring a doorbell', 'to raise the alarm / complain formally', 'to call a friend'], answer: 1 },
      ],
    },
    speaking: {
      prompt: 'Use one idiom in a short situation — for example a stressful week or an easy exam.',
      mustInclude: [
        i('idiom', 'Use an idiom', ['valt|viel', 'mee|tegen'], 'makkie|hard hoofd|kat uit de boom|handen in het haar|deur in huis|pijpenstelen|aap uit de mouw'),
      ],
      modelAnswers: [
        'Mijn examen was een makkie, maar mijn verhuizing valt tegen.',
        'Deze week zit ik echt met de handen in het haar, want mijn baas wil alles morgen al hebben.',
      ],
      hints: ['Het viel mee …', 'Ik zit met de handen in het haar, want …'],
    },
    grammar: {
      title: "Fixed expressions: don't translate word for word",
      explanation:
        "Idioms are fixed chunks: learn them whole and don't change the words. Many contain a fixed preposition or 'er': *met de handen in het haar zitten*, *er een hard hoofd in hebben*. Some come in pairs: *Het valt mee* (better than expected) / *Het valt tegen* (worse than expected). Use them sparingly — one well-placed idiom sounds native; five in a row sounds like a textbook.",
      examples: [
        { nl: 'Het valt mee.', en: "It's not as bad as I thought." },
        { nl: 'Het valt tegen.', en: "It's disappointing." },
        { nl: 'We kijken eerst de kat uit de boom.', en: "We'll wait and see first." },
      ],
      commonMistake: { wrong: 'Het regent katten en honden.', right: 'Het regent pijpenstelen.', why: 'Idioms rarely translate literally.' },
    },
    culture: {
      title: 'Where idioms come from',
      body: "Many Dutch idioms come from seafaring and farming: 'de kust is veilig' (the coast is clear), 'de boot afhouden' (to avoid committing), 'iets aan de grote klok hangen' (to broadcast something, from church bells). Using them correctly shows real fluency — and Dutch people love it when a learner drops a well-timed 'Dat valt mee!'.",
    },
    review: [
      { type: 'choose', prompt: "'Het viel mee' means…", options: ['It was better than expected', 'It fell down', 'It was disappointing'], answer: 0 },
      { type: 'choose', prompt: "'De kat uit de boom kijken' means…", options: ['to wait and see', 'to rescue a cat', 'to be lazy'], answer: 0 },
      { type: 'fill', sentence: 'Die toets was een ___! (piece of cake)', en: 'That test was a piece of cake!', accept: ['makkie'] },
      { type: 'translate', prompt: "It's raining cats and dogs.", accept: ['Het regent pijpenstelen'] },
      { type: 'respond', situation: "A friend asks 'Hoe was je sollicitatiegesprek?' It went better than expected. Answer with an idiom.", npc: { nl: 'Hoe was je sollicitatiegesprek?', en: 'How was your job interview?' }, intents: [i('idiom', 'Use an idiom', ['viel|valt', 'mee'], 'makkie')], modelAnswers: ['Het viel eigenlijk heel erg mee!', 'Het viel mee, hoor. Het was bijna een makkie.'] },
    ],
  }),

  defineLesson({
    id: 'b2.humour',
    level: 'B2',
    unit: 'Humour',
    order: 3,
    title: 'Dutch humour',
    subtitle: 'Irony, understatement and teasing — and how to respond',
    canDo: 'I can recognise irony and teasing in Dutch and respond with humour.',
    minutes: 15,
    situation: {
      setting: 'It is pouring with rain. You arrive at work completely soaked. Your colleagues Sophie and Jan see you.',
      dialogue: [
        line('Sophie', 'Nou, lekker weertje, hè?', 'Well, lovely weather, huh?'),
        line('You', 'Heerlijk. Ik heb vandaag gratis gedoucht.', 'Wonderful. I got a free shower today.'),
        line('Jan', 'Haha! Welkom in Nederland. Had je geen regenpak?', "Haha! Welcome to the Netherlands. Didn't you have rain gear?"),
        line('You', 'Jawel, maar dat hangt thuis. Heel handig.', "Yes, but it's hanging at home. Very handy."),
        line('Sophie', 'Lekker bezig! Wil je een handdoek?', 'Nice going! Want a towel?'),
        line('You', 'Graag. En een koffie. Of drie.', 'Yes please. And a coffee. Or three.'),
        line('Jan', 'Nou, het had erger gekund. Vorige week viel ik met fiets en al in een plas.', 'Well, it could have been worse. Last week I fell into a puddle, bike and all.'),
      ],
    },
    vocabulary: [
      ['lekker-weertje', 'Lekker weertje, hè?', 'Lovely weather, huh? (ironic)', 'Het stormt. Lekker weertje, hè?', "It's storming. Lovely weather, huh?", { note: 'Irony is recognised from context and tone. The diminutive adds to it.' }],
      ['lekker-bezig', 'Lekker bezig!', 'Nice going! (often ironic)', 'Je koffie over je laptop? Lekker bezig!', 'Coffee all over your laptop? Nice going!', { register: 'informal', band: 3 }],
      ['had-erger-gekund', 'Het had erger gekund', 'It could have been worse', 'Mijn fiets is gestolen, maar het had erger gekund.', 'My bike was stolen, but it could have been worse.', { band: 3 }],
      ['doe-normaal', 'Doe normaal!', 'Behave! / Come on! / No way!', 'Doe normaal, dat kost toch geen honderd euro?', "Come on, that doesn't cost a hundred euros, does it?", { register: 'informal', note: 'A rebuke, disbelief or a joke — the tone decides.' }],
      ['grapje', 'Grapje!', 'Just kidding!', 'Je bent ontslagen. Grapje!', "You're fired. Just kidding!", { register: 'informal' }],
      ['plagen', 'iemand plagen', 'to tease someone', 'Ze plagen je alleen maar omdat ze je aardig vinden.', 'They only tease you because they like you.', { band: 3 }],
      ['nou-lekker-dan', 'Nou, lekker dan!', 'Well, great! (ironic)', 'De trein rijdt niet. Nou, lekker dan!', "The train isn't running. Well, great!", { register: 'informal', band: 3 }],
      ['droog', 'droge humor', 'dry humour', 'Mijn vader heeft echt droge humor.', 'My father has a really dry sense of humour.', { band: 3 }],
    ],
    pronunciation: {
      focus: 'vowel-length',
      tip: "Irony lives in the melody: say 'Lekker weertje, hè?' with a flat, drawn-out tone. Keep the long vowels (aa, ee, oo) long.",
      items: [
        { nl: 'Doe normaal!', en: 'Come on!' },
        { nl: 'Lekker weertje, hè?', en: 'Lovely weather, huh?' },
        { nl: 'Hij heeft droge humor.', en: 'He has a dry sense of humour.' },
      ],
    },
    listening: {
      intro: 'A stand-up comedian jokes about Dutch habits. What is the joke about?',
      lines: [
        line('Comedian', 'Nederlanders zijn heel gastvrij. Echt waar.', 'Dutch people are very hospitable. Really.'),
        line('Comedian', 'Je komt op bezoek, je krijgt een kopje koffie… en één koekje.', 'You come to visit, you get a cup of coffee… and one biscuit.'),
        line('Comedian', 'Dan gaat de trommel weer dicht. Klik.', 'Then the tin closes again. Click.'),
        line('Comedian', "En als je om zes uur nog zit, zeggen ze: 'Nou, wij gaan zo eten, hoor!'", "And if you're still there at six, they say: 'Well, we're about to have dinner, you know!'"),
      ],
      questions: [
        { type: 'choice', prompt: 'What is the joke about?', options: ['Bad Dutch cooking', 'Dutch hospitality being rather limited', 'Strong Dutch coffee'], answer: 1 },
        { type: 'choice', prompt: "Is 'Nederlanders zijn heel gastvrij' meant literally here?", options: ['Yes', "No, it's ironic"], answer: 1 },
      ],
    },
    speaking: {
      prompt: 'Something went wrong (you missed the bus, spilled coffee…). React with a bit of Dutch-style irony or understatement.',
      mustInclude: [i('irony', 'Use irony or understatement', 'lekker|handig|mooi|geweldig|erger gekund|nou|typisch|prima|fantastisch')],
      modelAnswers: ['Nou, lekker dan! Bus gemist en het regent.', 'Koffie over mijn broek. Heel handig. Maar goed, het had erger gekund.'],
      hints: ['Nou, lekker dan!', 'Het had erger gekund.'],
    },
    grammar: {
      title: 'Understatement: niet onaardig, best wel, niet helemaal',
      explanation:
        "Dutch humour and politeness love **understatement**: saying less than you mean. *Niet onaardig* (not unkind) = quite good; *niet helemaal handig* (not entirely clever) = a big mistake; *best wel leuk* = really nice. Double negatives with **niet on-** + adjective are typical: *niet onverstandig* (not unwise = wise).",
      examples: [
        { nl: 'Dat was niet helemaal handig.', en: 'That was not the smartest move.' },
        { nl: 'Dat is niet onaardig!', en: "That's pretty good!" },
        { nl: 'Het was best wel leuk.', en: 'It was actually quite nice.' },
      ],
      commonMistake: { wrong: 'Dat is heel, heel fantastisch!', right: 'Dat is niet slecht, hè!', why: 'Over-the-top praise can sound insincere; understatement sounds warmer.' },
    },
    culture: {
      title: 'What makes the Dutch laugh',
      body: "Dutch humour is dry, direct and self-mocking. People tease friends and colleagues ('plagen') — being teased usually means you're accepted. Irony is everywhere, especially about the weather, the trains and money. The Dutch and the Flemish joke about each other: the Dutch tease Belgians for being slow, Belgians tease the Dutch for being stingy and loud. Take it lightly — and give it back with a smile.",
    },
    review: [
      { type: 'choose', prompt: "It's storming and a colleague says 'Lekker weertje, hè?' They mean…", options: ['The weather is nice', 'The weather is terrible (ironic)', 'They love storms'], answer: 1 },
      { type: 'choose', prompt: "'Niet onaardig' means…", options: ['very unkind', 'quite good', 'not interesting'], answer: 1 },
      { type: 'fill', sentence: 'Mijn fiets is kapot, maar het had ___ gekund.', en: 'My bike is broken, but it could have been worse.', accept: ['erger'] },
      { type: 'translate', prompt: 'Just kidding!', accept: ['Grapje', 'Geintje', 'Grapje hoor', 'Het is maar een grapje'] },
      { type: 'respond', situation: "A colleague teases you: 'Ben jij wel eens op tijd?' Respond with humour.", npc: { nl: 'Ben jij wel eens op tijd?', en: 'Are you ever on time?' }, intents: [i('humor', 'Respond with a joke or irony', 'haha|grapje|nooit|altijd|natuurlijk|jij ook|kijk wie|nou')], modelAnswers: ['Haha, natuurlijk! Vorig jaar één keer.', 'Nou, kijk wie het zegt!'] },
    ],
  }),

  defineLesson({
    id: 'b2.professional',
    level: 'B2',
    unit: 'Professional Dutch',
    order: 4,
    title: 'Professional Dutch: emails and negotiation',
    subtitle: 'Write formal emails and negotiate politely',
    canDo: 'I can write a clear professional email and negotiate conditions politely.',
    minutes: 15,
    situation: {
      setting: 'You negotiate the price of a freelance project by phone with a client, Mr Van Dijk.',
      dialogue: [
        line('Van Dijk', 'Goedemiddag, met Van Dijk. Ik heb uw offerte ontvangen, dank daarvoor.', "Good afternoon, Van Dijk speaking. I've received your quote, thank you for that."),
        line('You', 'Graag gedaan. Heeft u nog vragen?', "You're welcome. Do you have any questions?"),
        line('Van Dijk', 'Eerlijk gezegd vinden wij het bedrag aan de hoge kant.', 'To be honest, we find the amount rather high.'),
        line('You', 'Dat begrijp ik. Het bedrag is gebaseerd op veertig uur werk. Waar zat u ongeveer aan te denken?', 'I understand. The amount is based on forty hours of work. What did you have in mind, roughly?'),
        line('Van Dijk', 'Als we het met tien procent kunnen verlagen, gaan wij akkoord.', "If we can lower it by ten percent, we'll agree."),
        line('You', 'Dat is mogelijk als we de deadline een week verschuiven. Zou dat voor u werken?', "That's possible if we move the deadline by a week. Would that work for you?"),
        line('Van Dijk', 'Dat lijkt me redelijk. Kunt u een aangepaste offerte sturen?', 'That seems reasonable. Could you send an adjusted quote?'),
        line('You', 'Zeker. U ontvangt hem vandaag nog per e-mail.', "Certainly. You'll receive it by email today."),
      ],
    },
    vocabulary: [
      ['de-offerte', 'de offerte', 'the quote (price proposal)', 'Kunt u ons een offerte sturen?', 'Could you send us a quote?', { article: 'de', band: 3 }],
      ['aan-de-hoge-kant', 'aan de hoge kant', 'on the high side', 'De prijs is wat aan de hoge kant.', 'The price is a bit on the high side.', { band: 3, note: "A diplomatic way to say 'too expensive'." }],
      ['akkoord', 'akkoord gaan (met)', 'to agree (to)', 'Wij gaan akkoord met de voorwaarden.', 'We agree to the terms.', { band: 3, register: 'formal' }],
      ['dat-lijkt-me-redelijk', 'Dat lijkt me redelijk', 'That seems reasonable', 'Een week extra? Dat lijkt me redelijk.', 'An extra week? That seems reasonable.', { band: 2 }],
      ['in-de-bijlage', 'In de bijlage vindt u …', 'Please find attached …', 'In de bijlage vindt u de aangepaste offerte.', 'Please find attached the adjusted quote.', { register: 'formal', band: 3 }],
      ['ik-kom-erop-terug', 'Ik kom erop terug', "I'll get back to you on that", 'Goede vraag, ik kom er morgen op terug.', "Good question, I'll get back to you on that tomorrow.", { band: 3 }],
      ['graag-ontvang-ik', 'Graag ontvang ik …', 'I would appreciate receiving …', 'Graag ontvang ik uw reactie voor vrijdag.', "I'd appreciate your reply before Friday.", { register: 'formal', band: 3 }],
      ['eerlijk-gezegd', 'eerlijk gezegd', 'to be honest', 'Eerlijk gezegd had ik meer verwacht.', 'To be honest, I had expected more.', { band: 2 }],
    ],
    pronunciation: {
      focus: 'r',
      tip: "Clear R's make you sound confident in a negotiation: 'redelijk', 'prijs', 'verlagen'.",
      items: [
        { nl: 'Dat lijkt me redelijk.', en: 'That seems reasonable.' },
        { nl: 'Kunnen we de prijs verlagen?', en: 'Can we lower the price?' },
        { nl: 'U ontvangt de offerte vandaag.', en: "You'll receive the quote today." },
      ],
    },
    listening: {
      intro: 'A formal voicemail from a recruiter. What does she ask you to do?',
      lines: [
        line('Recruiter', 'Goedemorgen, u spreekt met Marloes de Wit van bureau Talentwerk.', 'Good morning, this is Marloes de Wit from the Talentwerk agency.'),
        line('Recruiter', 'Ik bel naar aanleiding van uw sollicitatie voor de functie van projectleider.', "I'm calling regarding your application for the position of project manager."),
        line('Recruiter', 'Wij zouden u graag uitnodigen voor een tweede gesprek. Zou u mij willen terugbellen om een afspraak in te plannen?', 'We would like to invite you for a second interview. Would you call me back to schedule an appointment?'),
        line('Recruiter', 'Mijn nummer is 020 123 45 67. Met vriendelijke groet, en tot horens.', 'My number is 020 123 45 67. Kind regards, and speak to you soon.'),
      ],
      questions: [
        { type: 'choice', prompt: 'Why is she calling?', options: ['To reject the application', 'To invite you for a second interview', 'To offer you the job'], answer: 1 },
        { type: 'choice', prompt: 'What should you do?', options: ['Send an email', 'Call her back', 'Come to the office'], answer: 1 },
      ],
    },
    speaking: {
      prompt: 'A client finds your price too high. Respond diplomatically: show understanding, explain the price, and propose a compromise.',
      mustInclude: [
        i('understand', 'Show understanding', 'begrijp|snap|kan me voorstellen|dat klopt'),
        i('explain', 'Explain the price', 'gebaseerd|uur|omdat|want|kosten|werk'),
        i('compromise', 'Propose a compromise', 'als we|voorstel|zou|kunnen we|korting|verschuiven|minder'),
      ],
      modelAnswers: [
        'Dat begrijp ik. De prijs is gebaseerd op veertig uur werk. Als we de deadline verschuiven, kan ik tien procent korting geven.',
        'Ik kan me voorstellen dat het veel lijkt, want het is veel werk. Mijn voorstel: we beginnen met een kleiner project.',
      ],
      hints: ['Dat begrijp ik.', 'De prijs is gebaseerd op …', 'Als we …, kan ik …'],
    },
    grammar: {
      title: 'Formal register: u, zouden, graag + inversion',
      explanation:
        "Professional Dutch uses **u/uw**, the conditional **zouden** (*Zou u… willen…?*) and **graag** for polite requests — often at the start, with inversion: ***Graag ontvang ik*** *uw reactie.* Written business Dutch also likes fixed phrases such as *naar aanleiding van* (with reference to) and *met betrekking tot* (regarding). Don't overdo it, though: modern Dutch business emails are short and fairly personal.",
      examples: [
        { nl: 'Zou u mij willen terugbellen?', en: 'Would you call me back?', highlight: 'Zou u … willen' },
        { nl: 'Graag ontvang ik uw reactie.', en: "I'd appreciate your reply.", highlight: 'Graag ontvang ik' },
        { nl: 'Naar aanleiding van ons gesprek stuur ik u de offerte.', en: "Following our conversation, I'm sending you the quote.", highlight: 'Naar aanleiding van' },
      ],
      commonMistake: { wrong: 'Geachte Linda,', right: 'Beste Linda, / Geachte mevrouw De Vries,', why: "'Geachte' goes with a title and surname; with a first name use 'Beste'." },
    },
    culture: {
      title: 'Negotiating with the Dutch',
      body: "Dutch business partners get to the point quickly, name numbers openly and expect you to do the same. A 'nee' in a negotiation is rarely final — it's an invitation to a counter-offer. Agreements are confirmed in writing, and deadlines are taken seriously. In Belgium, relationships and formality (titles, 'u', a proper lunch) often matter more before business starts.",
    },
    review: [
      { type: 'choose', prompt: "The most diplomatic way to say 'too expensive':", options: ['Dat is te duur.', 'Dat is wat aan de hoge kant.', 'Dat is belachelijk.'], answer: 1 },
      { type: 'fill', sentence: 'In de ___ vindt u de offerte.', en: 'Please find the quote attached.', accept: ['bijlage'] },
      { type: 'translate', prompt: "I'll get back to you on that.", accept: ['Ik kom erop terug', 'Ik kom er nog op terug', 'Ik kom daarop terug', 'Ik kom er later op terug'] },
      { type: 'choose', patternId: 'register-formal', prompt: "Opening an email to Mrs Jansen, whom you don't know:", options: ['Hoi Jansen,', 'Geachte mevrouw Jansen,', 'Beste Jansen,'], answer: 1 },
      { type: 'order', en: 'Would you call me back?', words: ['Zou', 'u', 'mij', 'willen', 'terugbellen'] },
      { type: 'respond', situation: "End a formal phone call: say you'll send the adjusted quote today, and say goodbye.", intents: [i('send', "Say you'll send it", 'stuur|sturen|ontvangt|mail'), i('bye', 'Say goodbye', 'tot ziens|tot horens|fijne dag|goedendag|prettige dag')], modelAnswers: ['Ik stuur u vandaag de aangepaste offerte. Tot horens!', 'U ontvangt de offerte vandaag nog per mail. Prettige dag verder.'] },
    ],
  }),

  defineLesson({
    id: 'b2.discussions',
    level: 'B2',
    unit: 'Complex discussions',
    order: 5,
    title: 'Complex discussions',
    subtitle: 'Weigh arguments, make concessions and structure your point',
    canDo: 'I can take part in a discussion on a complex topic, weigh arguments and defend my position.',
    minutes: 18,
    situation: {
      setting: 'A neighbourhood meeting about a plan to build 200 new homes on a local park.',
      dialogue: [
        line('Chair', 'We horen graag alle meningen. Wie wil beginnen?', "We'd like to hear all opinions. Who wants to start?"),
        line('Mrs Bakker', 'Ik ben absoluut tegen. Dat park is de enige groene plek in de wijk.', "I'm absolutely against it. That park is the only green space in the neighbourhood."),
        line('Mr Aydın', 'Maar er is een enorm woningtekort. Mijn kinderen kunnen nergens wonen.', "But there's a huge housing shortage. My children can't find anywhere to live."),
        line('You', 'Ik begrijp beide kanten. Enerzijds hebben we dringend woningen nodig, anderzijds is groen belangrijk voor de gezondheid.', 'I understand both sides. On the one hand we urgently need homes, on the other hand green space is important for our health.'),
        line('Mrs Bakker', 'Dat klinkt mooi, maar wat stelt u dan voor?', 'That sounds nice, but what do you propose, then?'),
        line('You', 'Zouden we niet op de oude parkeerplaats kunnen bouwen? Dan blijft het park bestaan.', "Couldn't we build on the old car park? Then the park stays."),
        line('Mr Aydın', 'Dat is een interessant idee, al weet ik niet of daar genoeg ruimte is.', "That's an interesting idea, although I'm not sure there's enough space there."),
        line('Chair', 'Laten we dat laten onderzoeken. Dank u voor dit constructieve voorstel.', "Let's have that looked into. Thank you for this constructive proposal."),
      ],
    },
    vocabulary: [
      ['enerzijds-anderzijds', 'enerzijds … anderzijds', 'on the one hand … on the other', 'Enerzijds is het duur, anderzijds bespaart het energie.', "On the one hand it's expensive, on the other it saves energy.", { band: 3, register: 'formal' }],
      ['dat-neemt-niet-weg', 'Dat neemt niet weg dat …', "That doesn't change the fact that …", 'Dat neemt niet weg dat we een oplossing nodig hebben.', "That doesn't change the fact that we need a solution.", { band: 4 }],
      ['weliswaar', 'weliswaar … maar', 'admittedly … but', 'Het plan is weliswaar duur, maar het werkt.', 'The plan is admittedly expensive, but it works.', { band: 4 }],
      ['al', 'al (+ verb second)', 'although', 'Het is een goed idee, al weet ik niet of het kan.', "It's a good idea, although I don't know if it's possible.", { band: 4, note: "Concessive 'al' keeps main-clause word order: 'al weet ik…'." }],
      ['ik-begrijp-beide-kanten', 'Ik begrijp beide kanten', 'I understand both sides', 'Ik begrijp beide kanten, maar ik kies voor het park.', 'I understand both sides, but I choose the park.', { band: 3 }],
      ['het-woningtekort', 'het woningtekort', 'the housing shortage', 'Het woningtekort is een groot probleem.', 'The housing shortage is a big problem.', { article: 'het', band: 3 }],
      ['wat-stelt-u-voor', 'Wat stelt u voor?', 'What do you propose?', 'Goed, maar wat stelt u dan voor?', 'Fine, but what do you propose, then?', { band: 2 }],
      ['laten-we', 'Laten we …', "Let's …", 'Laten we eerst de feiten bekijken.', "Let's look at the facts first."],
    ],
    pronunciation: {
      focus: 'ij',
      tip: "'Enerzijds' and 'anderzijds' both have IJ in the last syllable; the stress falls on the first: E-ner-zijds, AN-der-zijds.",
      items: [
        { nl: 'Enerzijds wel, anderzijds niet.', en: 'On the one hand yes, on the other no.' },
        { nl: 'Het park is de enige groene plek in de wijk.', en: 'The park is the only green space in the neighbourhood.' },
        { nl: 'Dat is een kwestie van tijd.', en: "That's a matter of time." },
      ],
    },
    listening: {
      intro: "A podcast segment on the four-day working week. What is the host's conclusion?",
      lines: [
        line('Host', 'De vierdaagse werkweek: is het de toekomst of een hype?', 'The four-day working week: is it the future or a hype?'),
        line('Host', 'Voorstanders wijzen erop dat werknemers productiever en minder gestrest zijn.', 'Supporters point out that employees are more productive and less stressed.'),
        line('Host', 'Tegenstanders vrezen dat vooral kleine bedrijven het niet kunnen betalen.', 'Opponents fear that small businesses in particular cannot afford it.'),
        line('Host', 'Mijn conclusie? Het werkt weliswaar niet voor iedereen, maar een experiment lijkt me zeker de moeite waard.', "My conclusion? It doesn't work for everyone, admittedly, but an experiment certainly seems worthwhile to me."),
      ],
      questions: [
        { type: 'choice', prompt: 'What do supporters say?', options: ['Employees are more productive and less stressed', "It's cheaper", 'It creates more jobs'], answer: 0 },
        { type: 'choice', prompt: "What is the host's conclusion?", options: ["It's a hype", "It's worth experimenting with, though not for everyone", 'It should become law'], answer: 1 },
      ],
    },
    speaking: {
      prompt: 'Should the Netherlands build on green spaces to solve the housing shortage? Weigh both sides and give your position.',
      mustInclude: [
        i('both', 'Weigh both sides', 'enerzijds|anderzijds|aan de ene kant|aan de andere kant|beide kanten|weliswaar|hoewel|maar'),
        i('position', 'Give your position', 'vind|volgens mij|ik ben voor|ik ben tegen|mijn mening|ik denk|daarom'),
      ],
      modelAnswers: [
        'Enerzijds zijn er te weinig huizen, anderzijds hebben we groen nodig. Daarom vind ik dat we eerst op oude bedrijfsterreinen moeten bouwen.',
        'Het woningtekort is weliswaar groot, maar volgens mij moeten we parken beschermen. Ik ben dus tegen bouwen in het groen.',
      ],
      hints: ['Enerzijds …, anderzijds …', 'Daarom vind ik dat …'],
    },
    grammar: {
      title: 'Concessions: hoewel, weliswaar, al, toch',
      explanation:
        "To acknowledge the other side before making your point: **hoewel** + verb at the end (*Hoewel het duur **is**, …*); **weliswaar … maar** (*Het is weliswaar duur, maar…*); **al** + normal main-clause order (*…, al **weet** ik niet of het kan*); and **toch** in the main clause (*Het is duur. Toch doe ik het.*). After a fronted subordinate clause, the main clause starts with its verb: *Hoewel het regent, **gaan** we wandelen.*",
      examples: [
        { nl: 'Hoewel het duur is, is het een goede investering.', en: "Although it's expensive, it's a good investment.", highlight: 'Hoewel … is, is' },
        { nl: 'Het plan is weliswaar ambitieus, maar het is haalbaar.', en: 'The plan is ambitious, admittedly, but achievable.', highlight: 'weliswaar' },
        { nl: 'Het is laat. Toch ga ik nog even sporten.', en: "It's late. Still, I'm going to work out.", highlight: 'Toch ga ik' },
      ],
      commonMistake: { wrong: 'Hoewel het is duur, ik koop het.', right: 'Hoewel het duur is, koop ik het.', why: "'Hoewel' sends its verb to the end, and the main clause then starts with the verb." },
    },
    culture: {
      title: 'Polderen in public',
      body: "Public debate in the Netherlands and Flanders values arguments over emotion. At neighbourhood meetings, council hearings and at work, people are expected to acknowledge other views before stating their own ('Ik begrijp uw punt, maar…'). Consensus-seeking runs deep: the country literally had to cooperate to keep the water out, and many people see the 'polder model' as a legacy of that.",
    },
    review: [
      { type: 'order', patternId: 'verb-final-subclause', en: 'Although it is expensive, I buy it.', words: ['Hoewel', 'het', 'duur', 'is', 'koop', 'ik', 'het'] },
      { type: 'choose', prompt: "'Dat neemt niet weg dat…' means…", options: ["That doesn't change the fact that…", 'That takes away…', "That doesn't matter…"], answer: 0 },
      { type: 'fill', sentence: 'Het is duur. ___ doe ik het.', en: "It's expensive. Still, I'm doing it.", accept: ['Toch'] },
      { type: 'translate', prompt: 'I understand both sides.', accept: ['Ik begrijp beide kanten', 'Ik snap beide kanten', 'Ik begrijp allebei de kanten'] },
      { type: 'respond', situation: "In the meeting someone says: 'Nieuwe huizen zijn belangrijker dan een park.' Acknowledge their point, then add a counter-argument.", npc: { nl: 'Nieuwe huizen zijn belangrijker dan een park.', en: 'New homes are more important than a park.' }, intents: [i('ack', 'Acknowledge their point', 'begrijp|snap|klopt|gelijk|punt|weliswaar'), i('counter', 'Add a counter-argument', 'maar|toch|anderzijds|echter')], modelAnswers: ['Ik begrijp uw punt, maar een park is ook belangrijk voor de gezondheid.', 'U heeft weliswaar gelijk dat er huizen nodig zijn, maar we kunnen ook ergens anders bouwen.'] },
    ],
  }),
];
