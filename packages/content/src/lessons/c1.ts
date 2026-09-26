import { defineLesson, i, line } from '../helpers.js';

export const c1Lessons = [
  defineLesson({
    id: 'c1.native',
    level: 'C1',
    unit: 'Native expressions',
    order: 1,
    title: 'Native expressions',
    subtitle: 'Colloquial phrases that make you sound local',
    canDo: 'I can understand and use the colloquial expressions natives use in everyday situations.',
    minutes: 18,
    situation: {
      setting: 'Your friend Thijs calls to vent about his chaotic renovation.',
      dialogue: [
        line('Thijs', 'Ik ben er echt helemaal klaar mee. Die verbouwing duurt nu al drie maanden.', "I'm completely fed up with it. The renovation has been going on for three months now."),
        line('You', 'Wat balen. Is het einde al in zicht?', 'What a pain. Is the end in sight yet?'),
        line('Thijs', "Welnee. De aannemer zegt steeds 'komt goed', maar er gebeurt niks.", "Not at all. The contractor keeps saying 'it'll be fine', but nothing happens."),
        line('You', 'Dat slaat toch nergens op? Heb je hem al eens flink de waarheid gezegd?', 'That makes no sense, does it? Have you given him a piece of your mind yet?'),
        line('Thijs', 'Nou, ik heb gisteren wel even mijn hart gelucht. Nu ligt de bal bij hem.', 'Well, I did get it off my chest yesterday. Now the ball is in his court.'),
        line('You', 'Goed zo. En anders zoek je gewoon een ander. Je moet je niet laten afschepen.', "Good. And otherwise you just find someone else. Don't let yourself be fobbed off."),
        line('Thijs', 'Je hebt gelijk. Zullen we vanavond een biertje doen? Ik kan wel wat afleiding gebruiken.', "You're right. Shall we grab a beer tonight? I could use some distraction."),
        line('You', 'Dat zit wel snor. Acht uur in de kroeg?', 'Sounds good. Eight o’clock at the pub?'),
      ],
    },
    vocabulary: [
      ['klaar-mee', 'Ik ben er klaar mee', "I'm fed up with it", 'Die herrie van de buren, ik ben er klaar mee!', "That racket from the neighbours — I'm fed up with it!", { register: 'informal', band: 3 }],
      ['slaat-nergens-op', 'Dat slaat nergens op', 'That makes no sense', 'Tien euro voor een kop koffie? Dat slaat nergens op.', "Ten euros for a cup of coffee? That's ridiculous.", { register: 'informal', band: 3 }],
      ['komt-goed', 'Komt goed', "It'll be fine / I'll sort it", 'Geen stress, komt goed!', "No stress, it'll be fine!", { register: 'informal', band: 2 }],
      ['zit-wel-snor', 'Dat zit wel snor', "That's fine / all sorted", 'Maak je geen zorgen, dat zit wel snor.', "Don't worry, it's all sorted.", { register: 'informal', band: 4 }],
      ['hart-luchten', 'je hart luchten', 'to get something off your chest', 'Soms moet je gewoon even je hart luchten.', 'Sometimes you just need to get it off your chest.', { band: 4 }],
      ['de-bal-ligt-bij', 'De bal ligt bij …', "The ball is in …'s court", 'Ik heb mijn voorstel gestuurd; de bal ligt nu bij hen.', "I've sent my proposal; the ball is in their court now.", { band: 3 }],
      ['afschepen', 'zich laten afschepen', 'to let yourself be fobbed off', 'Laat je niet afschepen met een excuus.', "Don't let them fob you off with an excuse.", { band: 4 }],
      ['een-biertje-doen', 'een biertje doen', 'to grab a beer', 'Zullen we na het werk een biertje doen?', 'Shall we grab a beer after work?', { register: 'informal', note: "'Doen' is common in casual plans: een koffietje doen, een hapje doen." }],
    ],
    pronunciation: {
      focus: 'r',
      tip: "At C1 the goal is flow: link words together ('slaat-nergens-op') and keep your R's short and light.",
      items: [
        { nl: 'Dat slaat nergens op.', en: 'That makes no sense.' },
        { nl: 'Acht uur in de kroeg?', en: "Eight o'clock at the pub?" },
        { nl: 'Die herrie, ik ben er klaar mee.', en: "That racket — I'm fed up with it." },
      ],
    },
    listening: {
      intro: 'Two young Amsterdammers chat. Listen for slang: what did Yasmina think of the party?',
      lines: [
        line('Yasmina', 'Die borrel gisteren was echt vet, man.', 'That party yesterday was really cool, man.'),
        line('Daan', 'Ja toch? Maar die DJ, pff, echt niet te doen.', 'Right? But that DJ, ugh, really unbearable.'),
        line('Yasmina', 'Haha, klopt. Maar de sfeer was chill. Ik ben pas om drie uur naar huis gegaan.', "Haha, true. But the vibe was chill. I didn't go home until three."),
        line('Daan', 'Serieus? Ik lag al om één uur in bed. Ik ben echt een opa aan het worden.', "Seriously? I was in bed by one. I'm really turning into a grandpa."),
      ],
      questions: [
        { type: 'choice', prompt: 'What did Yasmina think of the party?', options: ['It was great (vet)', 'It was boring', 'It was too crowded'], answer: 0 },
        { type: 'choice', prompt: "'Niet te doen' means…", options: ['unbearable', 'impossible homework', 'not allowed'], answer: 0 },
        { type: 'choice', prompt: "Why does Daan call himself 'een opa'?", options: ['He went home early', 'He has grandchildren', 'He danced a lot'], answer: 0 },
      ],
    },
    speaking: {
      prompt: 'A friend complains about something annoying (a landlord, a delayed train…). React like a native: show sympathy with a colloquial expression and give advice.',
      mustInclude: [
        i('sympathy', 'Show sympathy colloquially', 'balen|wat een gedoe|slaat nergens op|klaar mee|wat erg|zonde|belachelijk'),
        i('advice', 'Give advice', 'moet|zou|laat|probeer|gewoon'),
      ],
      modelAnswers: [
        'Wat balen, zeg! Dat slaat echt nergens op. Je moet hem gewoon bellen en je hart luchten.',
        'Wat een gedoe. Laat je niet afschepen, hoor. Ik zou een klacht indienen.',
      ],
      hints: ['Wat balen, zeg!', 'Laat je niet afschepen.'],
    },
    grammar: {
      title: "Colloquial grammar: 'er', split prepositions and dropped words",
      explanation:
        "Native speech is full of **er**-constructions: *Ik ben **er** klaar mee* (with it), *Dat slaat **nergens** op* (on nothing), *Ik heb **er** zin in*. The preposition often moves to the end: *Waar heb je het **over**?* · *Daar ben ik het niet mee eens.* In casual reactions speakers drop subjects and verbs: *(Dat) klopt.* · *(Het) komt goed.* · *(Ik heb) geen idee.*",
      examples: [
        { nl: 'Waar heb je het over?', en: 'What are you talking about?', highlight: 'Waar … over' },
        { nl: 'Daar heb ik geen zin in.', en: "I don't feel like that.", highlight: 'Daar … in' },
        { nl: 'Ik ben er klaar mee.', en: "I'm fed up with it.", highlight: 'er … mee' },
      ],
      commonMistake: { wrong: 'Ik ben klaar met het.', right: 'Ik ben er klaar mee.', why: "'Met het' becomes 'ermee', usually split: er … mee." },
    },
    culture: {
      title: 'Slang, anglicisms and street Dutch',
      body: "Young people in the Randstad mix Dutch with English ('chill', 'nice', 'random') and with words from Surinamese, Moroccan and Turkish Dutch ('mattie' = mate, 'wollah' = I swear, 'doekoe' = money). In Flanders you'll hear 'plezant', 'amai' and 'goesting'. Learners should understand slang but use it sparingly — from a newcomer it can sound forced. The expressions in this lesson are safe for all ages.",
    },
    review: [
      { type: 'choose', prompt: "'Dat zit wel snor' means…", options: ["It's all fine / sorted", 'It has a moustache', "It's a problem"], answer: 0 },
      { type: 'translate', prompt: "I'm fed up with it.", accept: ['Ik ben er klaar mee', 'Ik ben er helemaal klaar mee', 'Ik heb er genoeg van', 'Ik ben het zat'] },
      { type: 'fill', sentence: 'Dat slaat ___ op.', en: 'That makes no sense.', accept: ['nergens'] },
      { type: 'order', en: 'What are you talking about?', words: ['Waar', 'heb', 'je', 'het', 'over'] },
      { type: 'respond', situation: "Your friend says 'Mijn huisbaas wil de huur weer verhogen.' React with sympathy and a colloquial expression.", npc: { nl: 'Mijn huisbaas wil de huur weer verhogen.', en: 'My landlord wants to raise the rent again.' }, intents: [i('react', 'React colloquially', 'balen|slaat nergens op|belachelijk|wat een gedoe|niet normaal|zonde|serieus')], modelAnswers: ['Serieus? Dat slaat toch nergens op!', 'Wat balen, zeg. Laat je niet afschepen!'] },
    ],
  }),

  defineLesson({
    id: 'c1.references',
    level: 'C1',
    unit: 'Cultural references',
    order: 2,
    title: 'Cultural references',
    subtitle: 'Sayings, traditions and history that natives take for granted',
    canDo: 'I can understand cultural references and sayings that assume shared Dutch knowledge.',
    minutes: 18,
    situation: {
      setting: 'A dinner party. Your host Marieke drops one cultural reference after another.',
      dialogue: [
        line('Marieke', 'Neem gerust nog een kroket. Doe maar normaal, dan doe je al gek genoeg!', "Feel free to have another croquette. Just act normal, that's crazy enough!"),
        line('You', 'Haha, ik ken die uitdrukking. Nederlanders houden niet van opvallen, toch?', "Haha, I know that expression. Dutch people don't like to stand out, right?"),
        line('Marieke', 'Precies. Hoge bomen vangen veel wind, zeggen we.', 'Exactly. Tall trees catch a lot of wind, as we say.'),
        line('Joost', 'Behalve op Koningsdag. Dan loopt het hele land in het oranje.', "Except on King's Day. Then the whole country walks around in orange."),
        line('You', 'En in december is het Sinterklaas, met die gedichten, hè?', "And in December it's Sinterklaas, with those poems, right?"),
        line('Marieke', 'Ja! En als het ooit weer hard genoeg vriest, hopen we allemaal op de Elfstedentocht.', 'Yes! And if it ever freezes hard enough again, we all hope for the Elfstedentocht.'),
        line('Joost', 'Dat gebeurt nooit meer. De laatste was in 1997.', 'That will never happen again. The last one was in 1997.'),
      ],
    },
    vocabulary: [
      ['doe-maar-normaal', 'Doe maar normaal, dan doe je al gek genoeg', "Just act normal, that's crazy enough", 'Ze zijn heel rijk, maar ze leven bescheiden: doe maar normaal.', 'They are very rich, but they live modestly: just act normal.', { band: 3, note: 'The famous Dutch value of modesty and not showing off.' }],
      ['hoge-bomen', 'Hoge bomen vangen veel wind', 'Tall trees catch a lot of wind', 'Hij is nu directeur, maar hoge bomen vangen veel wind.', "He's director now, but tall trees catch a lot of wind.", { band: 4, note: 'People who stand out attract criticism.' }],
      ['koningsdag', 'Koningsdag', "King's Day (27 April)", 'Op Koningsdag verkoopt iedereen spullen op de vrijmarkt.', "On King's Day everyone sells things at the street market.", { band: 2, note: 'Street-wide flea markets (vrijmarkt), music and orange everything.' }],
      ['sinterklaas', 'Sinterklaas', 'St Nicholas (5 December)', 'Met Sinterklaas schrijven we elkaar gedichten.', 'At Sinterklaas we write each other poems.', { band: 2 }],
      ['elfstedentocht', 'de Elfstedentocht', 'the Eleven Cities skating tour', 'Iedereen droomt nog van een nieuwe Elfstedentocht.', 'Everyone still dreams of a new Eleven Cities tour.', { article: 'de', band: 4, note: 'A 200 km skating tour through Friesland, only held when the ice is thick enough.' }],
      ['gezelligheid', 'de gezelligheid', 'cosiness, good company', 'Het gaat niet om het eten, het gaat om de gezelligheid.', "It's not about the food, it's about the company.", { article: 'de', band: 2 }],
      ['polderen', 'polderen', 'to seek consensus', 'Na veel polderen kwamen ze tot een compromis.', 'After a lot of consensus-seeking they reached a compromise.', { band: 4 }],
      ['zuinig', 'zuinig', 'thrifty, frugal', 'Mijn opa is heel zuinig: hij gooit niets weg.', "My grandpa is very thrifty: he doesn't throw anything away.", { band: 3 }],
    ],
    pronunciation: {
      focus: 'vowel-length',
      tip: "Sayings have a rhythm — say them in one breath. Watch the long vowels: 'maar', 'normaal', 'hoge bomen'.",
      items: [
        { nl: 'Doe maar normaal, dan doe je al gek genoeg.', en: "Just act normal, that's crazy enough." },
        { nl: 'Hoge bomen vangen veel wind.', en: 'Tall trees catch a lot of wind.' },
        { nl: 'Op Koningsdag is alles oranje.', en: "On King's Day everything is orange." },
      ],
    },
    listening: {
      intro: 'A short podcast about how Sinterklaas has changed. What changed?',
      lines: [
        line('Host', 'Sinterklaas is voor veel Nederlanders het gezelligste feest van het jaar.', 'For many Dutch people Sinterklaas is the cosiest celebration of the year.'),
        line('Host', 'Maar het feest is de afgelopen jaren ook veranderd.', 'But the celebration has also changed in recent years.'),
        line('Host', 'Na veel discussie over racisme is de traditionele Zwarte Piet op de meeste plekken vervangen door roetveegpieten: helpers met alleen wat roet op hun gezicht.', "After a lot of debate about racism, the traditional Black Pete has been replaced in most places by 'soot-smudge Petes': helpers with just some soot on their faces."),
        line('Host', 'Voor de kinderen blijft het belangrijkste hetzelfde: cadeautjes, pepernoten en spanning.', 'For the children the most important thing stays the same: presents, pepernoten and excitement.'),
      ],
      questions: [
        { type: 'choice', prompt: 'What has changed?', options: ['Sinterklaas is no longer celebrated', 'Black Pete has largely been replaced by soot-smudge Petes', 'The celebration moved to Christmas'], answer: 1 },
        { type: 'choice', prompt: 'What stays the same for children?', options: ['Presents, pepernoten and excitement', 'The poems', 'Nothing'], answer: 0 },
      ],
    },
    speaking: {
      prompt: 'Explain a tradition or saying from your own country to a Dutch friend, and compare it with a Dutch one.',
      mustInclude: [
        i('explain', 'Explain a tradition or saying', 'bij ons|in mijn land|traditie|zeggen|vieren|feest|gewoonte'),
        i('compare', 'Compare with the Netherlands', 'nederland*|hier|net als|zoals|anders dan|hetzelfde|sinterklaas|koningsdag|kerst'),
      ],
      modelAnswers: [
        'Bij ons vieren we Thanksgiving met de hele familie. Dat is een beetje zoals Kerst hier, maar dan met kalkoen.',
        'In mijn land zeggen we: de spijker op zijn kop slaan. In Nederland zeggen jullie precies hetzelfde!',
      ],
      hints: ['Bij ons …', 'Dat is een beetje zoals … hier.'],
    },
    grammar: {
      title: 'Nominalised adjectives: het leuke, het belangrijkste',
      explanation:
        "Dutch turns adjectives into nouns with **het** + adjective + **-e**: *het leuke aan Nederland* (the nice thing about the Netherlands), *het rare is dat…* (the strange thing is that…). With superlatives: *het belangrijkste* (the most important thing). Superlatives take **-st(e)**: *gezellig → het gezelligste feest*; irregular: *goed → best, veel → meest, graag → liefst*.",
      examples: [
        { nl: 'Het leuke aan Nederland is de fietscultuur.', en: 'The nice thing about the Netherlands is the cycling culture.', highlight: 'Het leuke' },
        { nl: 'Het belangrijkste is dat je plezier hebt.', en: 'The most important thing is that you have fun.', highlight: 'Het belangrijkste' },
        { nl: 'Dat was het gezelligste feest van het jaar.', en: 'That was the cosiest party of the year.', highlight: 'gezelligste' },
      ],
      commonMistake: { wrong: 'Het meest belangrijke ding is…', right: 'Het belangrijkste is…', why: 'Dutch uses -ste and a nominalised adjective, not a literal translation.' },
    },
    culture: {
      title: 'Shared references',
      body: "Some references appear everywhere: 'Doe maar normaal' (modesty), 'Hollandse Nieuwe' (the first herring of the season), the Elfstedentocht (the Frisian skating dream, last held in 1997), King's Day in orange, and Sinterklaas poems that gently mock the recipient. Remembrance matters too: on 4 May the Netherlands falls silent for two minutes at 20:00 to remember the war dead, and 5 May is Liberation Day. In Flanders, 11 July (the day of the Flemish Community) and local carnival traditions play a similar role.",
    },
    review: [
      { type: 'choose', prompt: "'Doe maar normaal, dan doe je al gek genoeg' expresses…", options: ["modesty — don't show off", 'that people should be crazy', 'a joke about work'], answer: 0 },
      { type: 'choose', prompt: 'When is Koningsdag?', options: ['27 April', '5 May', '5 December'], answer: 0 },
      { type: 'fill', sentence: 'Het ___ is dat je plezier hebt. (belangrijk)', en: 'The most important thing is that you have fun.', accept: ['belangrijkste'] },
      { type: 'translate', prompt: 'The nice thing about Utrecht is the canals.', accept: ['Het leuke aan Utrecht zijn de grachten'] },
      { type: 'respond', situation: "A Dutch friend asks: 'Wat vind jij het raarste aan Nederland?' Answer honestly, with a bit of humour.", npc: { nl: 'Wat vind jij het raarste aan Nederland?', en: 'What do you find the weirdest thing about the Netherlands?' }, intents: [i('weird', 'Name something', 'raarste|raar|vreemd|gek')], modelAnswers: ['Het raarste vind ik dat jullie iedereen feliciteren op een verjaardag!', 'Eerlijk gezegd vind ik het raar dat jullie om zes uur al eten.'] },
    ],
  }),

  defineLesson({
    id: 'c1.registers',
    level: 'C1',
    unit: 'Formal and informal language',
    order: 3,
    title: 'Switching registers',
    subtitle: 'From officialese to casual speech — and knowing when to switch',
    canDo: 'I can adapt my language to the situation — formal letters, work, friends — and switch smoothly.',
    minutes: 18,
    situation: {
      setting: 'You received a letter from the municipality about your parking permit. You call them, then explain it to your housemate Lieke.',
      dialogue: [
        line('Frank', 'Gemeente Utrecht, goedemiddag, u spreekt met Frank. Waarmee kan ik u van dienst zijn?', 'Utrecht municipality, good afternoon, Frank speaking. How may I help you?'),
        line('You', 'Goedemiddag. Ik heb een brief ontvangen over mijn parkeervergunning, maar ik begrijp niet precies wat ik moet doen.', "Good afternoon. I've received a letter about my parking permit, but I don't quite understand what I need to do."),
        line('Frank', 'Ik kijk even mee. U dient uw vergunning binnen zes weken te verlengen via het digitale loket.', 'Let me have a look. You are required to renew your permit within six weeks via the online portal.'),
        line('You', 'Dus ik moet hem online verlengen, voor eind oktober?', 'So I have to renew it online, before the end of October?'),
        line('Frank', 'Klopt. Met uw DigiD.', 'Correct. With your DigiD.'),
        line('You', 'Nou, die brief was echt ambtenarentaal. Maar het komt erop neer dat ik mijn vergunning online moet verlengen.', 'Well, that letter was real officialese. But it boils down to me having to renew my permit online.'),
        line('Lieke', "Haha, 'u dient'! Waarom schrijven ze niet gewoon 'u moet'?", "Haha, 'u dient'! Why don't they just write 'you must'?"),
      ],
    },
    vocabulary: [
      ['u-dient', 'U dient … te …', 'You are required to …', 'U dient het formulier voor 1 mei in te leveren.', 'You are required to submit the form before 1 May.', { register: 'formal', band: 4, note: "Officialese for 'u moet'. You'll read it; you'll rarely say it." }],
      ['waarmee-kan-ik', 'Waarmee kan ik u van dienst zijn?', 'How may I help you?', 'Goedemorgen, waarmee kan ik u van dienst zijn?', 'Good morning, how may I help you?', { register: 'formal', band: 3 }],
      ['komt-erop-neer', 'Het komt erop neer dat …', 'It boils down to …', 'Het komt erop neer dat we meer moeten betalen.', 'It boils down to us having to pay more.', { band: 3 }],
      ['ambtenarentaal', 'ambtenarentaal', 'officialese', 'Die brief staat vol ambtenarentaal.', 'That letter is full of officialese.', { band: 4 }],
      ['middels', 'middels', 'by means of (formal)', 'Middels deze brief informeren wij u over de wijziging.', 'By means of this letter we inform you of the change.', { register: 'formal', band: 4, note: "Formal writing only. In speech: 'met' or 'via'." }],
      ['ik-kijk-even-mee', 'Ik kijk even mee', 'Let me have a look', 'Ik kijk even mee in het systeem.', 'Let me have a look in the system.', { band: 3 }],
      ['zeg-maar-jij', 'Zeg maar jij', "Feel free to say 'jij'", 'Zeg maar jij, hoor, zo oud ben ik nog niet!', "Just say 'jij', I'm not that old yet!", { register: 'informal', band: 2 }],
      ['ge-gij', 'ge / gij (Flemish)', 'you (Flemish, informal speech)', 'Hebt ge dat gezien?', 'Did you see that?', { register: 'informal', band: 4, note: "In Flemish speech 'ge/gij' is the everyday 'you' — neither formal nor rude." }],
    ],
    pronunciation: {
      focus: 'g',
      tip: "Formal speech is slower and more careful: pronounce every G and the final -n clearly. In casual speech the -n in 'verlengen' often disappears.",
      items: [
        { nl: 'Gemeente Utrecht, goedemiddag.', en: 'Utrecht municipality, good afternoon.' },
        { nl: 'Ik moet mijn vergunning verlengen.', en: 'I have to renew my permit.' },
        { nl: 'Via het digitale loket.', en: 'Via the online portal.' },
      ],
    },
    listening: {
      intro: 'Two versions of the same message: a formal letter read aloud, and a friend’s summary. What do you have to do?',
      lines: [
        line('Letter', 'Geachte heer, mevrouw, middels deze brief delen wij u mede dat uw huurtoeslag per 1 januari wordt herzien.', 'Dear Sir or Madam, by means of this letter we inform you that your rent allowance will be revised as of 1 January.'),
        line('Letter', 'Indien uw inkomen is gewijzigd, dient u dit binnen vier weken door te geven.', 'If your income has changed, you are required to report this within four weeks.'),
        line('Friend', 'Oftewel: als je meer of minder verdient, moet je dat binnen vier weken melden. Anders moet je misschien geld terugbetalen.', 'In other words: if you earn more or less, you have to report it within four weeks. Otherwise you might have to pay money back.'),
      ],
      questions: [
        { type: 'choice', prompt: 'What must you do if your income has changed?', options: ['Report it within four weeks', 'Apply for a new allowance', 'Nothing'], answer: 0 },
        { type: 'choice', prompt: "Which word is the formal equivalent of 'als' (if)?", options: ['indien', 'middels', 'oftewel'], answer: 0 },
      ],
    },
    speaking: {
      prompt: "Say the same thing twice: first formally to a civil servant ('I'd like to report my change of address'), then casually to a friend.",
      mustInclude: [
        i('formal', 'Formal version (u)', 'u|uw'),
        i('informal', 'Casual version (je/jij or casual words)', 'je|jij|even|gewoon'),
      ],
      modelAnswers: [
        'Goedemorgen, ik zou graag mijn adreswijziging doorgeven. Kunt u mij daarbij helpen? En tegen mijn vriend: ik moet even mijn nieuwe adres doorgeven bij de gemeente.',
        'Kunt u mij vertellen hoe ik mijn adres kan wijzigen? En informeel: weet jij hoe ik gewoon mijn adres verander?',
      ],
      hints: ['Ik zou graag … doorgeven.', 'Ik moet even …'],
    },
    grammar: {
      title: 'Register markers',
      explanation:
        "Registers differ in pronouns, verbs and vocabulary. **Formal/written**: *u, dienen te, indien (als), middels (via), ontvangen (krijgen), verzoeken (vragen)*. **Neutral**: *u/je, moeten, als, krijgen*. **Informal**: *je/jij, even, gewoon, ff (texting), balen*. In Flanders, *ge/gij* is informal speech, while *u* is used more widely than in the Netherlands. Mastery means understanding all registers and switching deliberately.",
      examples: [
        { nl: 'Wij verzoeken u het formulier te ondertekenen.', en: 'We kindly request that you sign the form.', highlight: 'verzoeken u' },
        { nl: 'Kunt u het formulier tekenen?', en: 'Could you sign the form?', highlight: 'Kunt u' },
        { nl: 'Kun je dat formulier even tekenen?', en: 'Could you just sign that form?', highlight: 'even' },
      ],
      commonMistake: { wrong: 'Hoi meneer de burgemeester, hoe is het?', right: 'Goedemiddag, burgemeester. Hoe gaat het met u?', why: 'Match the register to the person and the situation.' },
    },
    culture: {
      title: 'u, je, ge — and the letters',
      body: "Official Dutch ('ambtelijk taalgebruik') is known for long sentences and old-fashioned words — even the government runs initiatives to write more clearly. You'll get such letters from the gemeente, the Belastingdienst (tax office) or your health insurer: read the first and last paragraphs first. In daily life the Netherlands uses 'je' widely; in Flanders 'u' is more common, and in speech 'ge/gij' is normal among friends and family.",
    },
    review: [
      { type: 'choose', prompt: "'Indien' means…", options: ['if', 'instead', 'because'], answer: 0 },
      { type: 'choose', prompt: "'U dient het formulier in te leveren' in everyday Dutch:", options: ['U moet het formulier inleveren.', 'U mag het formulier houden.', 'U hoeft niets te doen.'], answer: 0 },
      { type: 'translate', prompt: 'It boils down to us having to pay more.', accept: ['Het komt erop neer dat we meer moeten betalen', 'Het komt erop neer dat wij meer moeten betalen'] },
      { type: 'fill', sentence: '___ kan ik u van dienst zijn?', en: 'How may I help you?', accept: ['Waarmee'] },
      { type: 'respond', situation: "Rewrite this officialese in plain spoken Dutch: 'Middels deze brief verzoeken wij u vriendelijk uw adreswijziging door te geven.'", intents: [i('plain', 'Say it plainly', 'met deze brief|we vragen|wij vragen|kunt u|wilt u'), i('address', 'Mention the address change', 'adres*')], modelAnswers: ['Met deze brief vragen we u om uw nieuwe adres door te geven.', 'Wilt u alstublieft uw adreswijziging doorgeven?'] },
    ],
  }),

  defineLesson({
    id: 'c1.listening',
    level: 'C1',
    unit: 'Advanced listening',
    order: 4,
    title: 'Advanced listening: fast speech and accents',
    subtitle: 'Reduced forms, regional accents and real-speed Dutch',
    canDo: 'I can understand fast, informal speech with reduced forms and regional accents.',
    minutes: 18,
    situation: {
      setting: 'The canteen of a football club in Brabant. A friendly local talks to you at full speed.',
      dialogue: [
        line('Harrie', "Hé, 'k heb je hier nog nooit gezien. Kom je uit de buurt?", "Hey, I've never seen you here before. Are you from around here?"),
        line('You', 'Nee, ik woon sinds kort in Eindhoven. Mijn buurman heeft me meegenomen.', 'No, I recently moved to Eindhoven. My neighbour brought me along.'),
        line('Harrie', "Ah, da's mooi. Hebbie al een biertje?", "Ah, that's nice. Have you got a beer yet?"),
        line('You', "Sorry, 'hebbie'?", "Sorry, 'hebbie'?"),
        line('Harrie', "Haha, 'heb je'. Wij praten hier een beetje plat, hè. Houdoe en bedankt, zeggen we hier.", "Haha, 'heb je'. We speak a bit of dialect here, you know. 'Houdoe en bedankt', as we say around here."),
        line('You', "Houdoe… dat is toch 'dag'?", "Houdoe… that means 'bye', right?"),
        line('Harrie', "Klopt! Je leert snel, jongen. Ik haal d'r ff eentje voor je.", "Right! You learn fast, lad. I'll quickly get you one."),
      ],
    },
    vocabulary: [
      ['k', "'k (ik)", 'I (reduced)', "'k Weet het niet.", "I don't know.", { register: 'informal', note: "Unstressed 'ik' often becomes 'k: ''k Heb geen idee.'" }],
      ['das', "da's (dat is)", "that's", "Da's leuk!", "That's nice!", { register: 'informal' }],
      ['hebbie', 'hebbie (heb je)', 'have you', 'Hebbie zin in koffie?', 'Do you fancy a coffee?', { register: 'informal', band: 4, note: "Fast speech merges 'heb je' into 'hebbie' and 'ben je' into 'bennie' — typical of Holland and Brabant." }],
      ['mn-zn', "m'n, z'n, d'r", 'my, his, her/there (reduced)', "M'n fiets staat bij z'n huis.", 'My bike is at his house.', { register: 'informal', note: 'Also common in informal writing.' }],
      ['ie', 'ie (hij)', 'he (reduced, after the verb)', 'Komt-ie ook?', 'Is he coming too?', { register: 'informal', note: "Unstressed 'hij' after a verb becomes 'ie': 'Hoe gaat-ie?'" }],
      ['houdoe', 'Houdoe!', 'Bye! (Brabant)', 'Houdoe en bedankt!', 'Bye and thanks!', { register: 'informal', band: 4, note: "Brabant dialect. Compare 'Salut' (Flanders) and 'Doei' (general)." }],
      ['plat-praten', 'plat praten', 'to speak dialect / very colloquially', 'In het dorp praten ze nog echt plat.', 'In the village they still speak real dialect.', { band: 4 }],
      ['ff', 'ff (even)', 'just, quickly (texting)', 'Kun je ff bellen?', 'Can you give me a quick call?', { register: 'informal', note: "Texting abbreviation, pronounced 'effe'." }],
    ],
    pronunciation: {
      focus: 'g',
      tip: "Listen for the soft Brabant/Limburg/Flemish G: made further forward and smoother. You don't need to copy it — but you do need to recognise it.",
      items: [
        { nl: 'Goedemorgen, gaat het goed?', en: 'Good morning, are you well?' },
        { nl: 'Houdoe en bedankt!', en: 'Bye and thanks!' },
        { nl: "Da's mooi, hè?", en: "That's nice, isn't it?" },
      ],
    },
    listening: {
      intro: 'A fast, informal voice message from a friend in Amsterdam. What does she want?',
      lines: [
        line('Sanne', "Hé! Met mij. Zeg, 'k zit hier in de stad, maar m'n telefoon is bijna leeg.", "Hey! It's me. Listen, I'm in town, but my phone is almost dead."),
        line('Sanne', "Hebbie zin om zo ff wat te drinken bij dat café op 't plein? Ik ben d'r over tien minuten.", "Do you fancy a quick drink soon at that café on the square? I'll be there in ten minutes."),
        line('Sanne', 'Als-ie dicht is, gaan we gewoon naar de overkant. App maar, doei!', "If it's closed, we'll just go across the street. Text me, bye!"),
      ],
      questions: [
        { type: 'choice', prompt: 'What does Sanne want?', options: ['To meet for a drink soon', 'To borrow a phone charger', 'To cancel a plan'], answer: 0 },
        { type: 'choice', prompt: "What does 'als-ie dicht is' mean?", options: ['if it (the café) is closed', 'if he is quiet', 'if it is late'], answer: 0 },
        { type: 'text', prompt: 'In how many minutes will she be there?', accept: ['tien', '10', 'ten', 'tien minuten', '10 minuten'] },
      ],
    },
    speaking: {
      prompt: "Retell Sanne's fast voice message in clear, standard Dutch for a friend who didn't understand it.",
      mustInclude: [
        i('meet', 'Say she wants to meet', 'drinken|afspreken|café|koffie|borrel'),
        i('when', 'Say when', 'minuten|straks|zo|#num'),
        i('where', 'Say where', 'plein|café|overkant|stad'),
      ],
      modelAnswers: [
        'Sanne zit in de stad en wil over tien minuten iets drinken in het café op het plein.',
        'Ze vraagt of je zin hebt om zo iets te drinken bij het café op het plein. Als het dicht is, gaan jullie naar de overkant.',
      ],
      hints: ['Sanne zit in … en wil …', 'Als het café dicht is, …'],
    },
    grammar: {
      title: 'Reduced forms in fast speech',
      explanation:
        "At natural speed, unstressed words shrink: **ik → 'k**, **het → 't**, **een → 'n**, **dat is → da's**, **mijn/zijn/haar → m'n/z'n/d'r**, **hij → ie** after a verb (*komt-ie*), **heb je → hebbie** (regional). In the west the final **-n** of plurals and infinitives usually disappears (*lopen → lope*), and final **-t** after a consonant often drops (*niet → nie*). You don't have to speak like this — but you must recognise it.",
      examples: [
        { nl: "'t Is al laat.", en: "It's late already.", highlight: "'t" },
        { nl: "Da's een goed idee.", en: "That's a good idea.", highlight: "Da's" },
        { nl: 'Komt-ie morgen?', en: 'Is he coming tomorrow?', highlight: 'Komt-ie' },
      ],
      commonMistake: { wrong: "Writing 'hebbie' in a formal email", right: "'Heb je' (informal) / 'Heeft u' (formal)", why: 'Reduced forms belong in speech and casual texts only.' },
    },
    culture: {
      title: 'Accents of the Low Countries',
      body: "Dutch sounds very different across the region. The Randstad has a hard G and swallows the final -n; Brabant and Limburg have the soft G and a melodious rhythm (and say 'houdoe' and celebrate carnival); Groningen and Twente have Low Saxon influences; Friesland has its own official language, Frisian. In Flanders, 'tussentaal' (between dialect and standard) is everyday speech, with 'ge/gij' and many French loanwords. Standard Dutch on the radio is the anchor — everything else is flavour.",
    },
    review: [
      { type: 'choose', prompt: "'Da's mooi' means…", options: ["That's nice", 'Dad is nice', 'That was nice'], answer: 0 },
      { type: 'choose', prompt: "In 'Komt-ie ook?', who is 'ie'?", options: ['he (hij)', 'she (zij)', 'you (jij)'], answer: 0 },
      { type: 'dictation', nl: "'t Is al laat, ik ga naar huis.", en: "It's late, I'm going home." },
      { type: 'translate', prompt: "Write 'Hebbie zin?' in standard Dutch.", accept: ['Heb je zin', 'Heb jij zin', 'Heb je er zin in', 'Heb je zin in'] },
      { type: 'respond', situation: "A Brabander says goodbye: 'Houdoe en bedankt!' Reply warmly.", npc: { nl: 'Houdoe en bedankt!', en: 'Bye and thanks!' }, intents: [i('bye', 'Say goodbye', 'houdoe|doei|dag|tot ziens|tot de volgende keer|graag gedaan|tot kijk')], modelAnswers: ['Houdoe! Tot de volgende keer.', 'Graag gedaan, doei!'] },
    ],
  }),
];
