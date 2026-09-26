import { defineLesson, i, line } from '../helpers.js';

export const a0Lessons = [
  defineLesson({
    id: 'a0.greetings',
    level: 'A0',
    unit: 'Greetings',
    order: 1,
    title: 'Hallo! Greeting people',
    subtitle: 'Say hello and goodbye, and ask how someone is',
    canDo: 'I can greet people, ask how they are and say goodbye.',
    minutes: 8,
    situation: {
      setting: 'Your first morning in your new apartment building in Utrecht. Your neighbour Anouk is locking her bike in the hallway.',
      dialogue: [
        line('Anouk', 'Goedemorgen!', 'Good morning!'),
        line('You', 'Hoi! Ik woon hier sinds gisteren.', "Hi! I've lived here since yesterday."),
        line('Anouk', 'O, welkom! Ik ben Anouk. Hoe gaat het?', "Oh, welcome! I'm Anouk. How are you?"),
        line('You', 'Goed, dank je. En met jou?', 'Good, thanks. And you?'),
        line('Anouk', 'Prima! Ik moet naar mijn werk. Fijne dag!', 'Fine! I have to go to work. Have a nice day!'),
        line('You', 'Dank je, jij ook! Doei!', 'Thanks, you too! Bye!'),
      ],
    },
    vocabulary: [
      ['goedemorgen', 'Goedemorgen!', 'Good morning!', 'Goedemorgen, meneer De Vries!', 'Good morning, Mr De Vries!', { note: "Until about 12:00. Then 'goedemiddag' (afternoon) and 'goedenavond' (from about 18:00)." }],
      ['hoi', 'Hoi!', 'Hi!', 'Hoi Anouk, alles goed?', 'Hi Anouk, all good?', { register: 'informal', note: "The everyday informal greeting. 'Hallo' is neutral and works everywhere." }],
      ['hoe-gaat-het', 'Hoe gaat het?', 'How are you?', 'Hoi Tom, hoe gaat het met je?', 'Hi Tom, how are you doing?', { note: "Literally 'How goes it?'. With strangers and older people: 'Hoe gaat het met u?'" }],
      ['goed-en-met-jou', 'Goed, en met jou?', 'Good, and you?', 'Goed, dank je. En met jou?', 'Good, thanks. And you?', { note: "Not 'Ik ben goed' — the answer is about 'het': 'Het gaat goed.'" }],
      ['dank-je', 'Dank je (wel)', 'Thank you', 'Dank je wel voor de koffie!', 'Thank you for the coffee!', { register: 'informal', note: "Formal: 'Dank u (wel)'. Also very common: 'Bedankt!'" }],
      ['fijne-dag', 'Fijne dag!', 'Have a nice day!', 'Fijne dag nog!', 'Have a nice rest of the day!', { note: "Reply: 'Jij ook!' or 'U ook!'. Also: 'Fijn weekend!'" }],
      ['doei', 'Doei!', 'Bye!', 'Doei, tot morgen!', 'Bye, see you tomorrow!', { register: 'informal', note: "Neutral: 'Dag!' Polite: 'Tot ziens.' In Flanders you'll also hear 'Salut!' and 'Daag!'" }],
      ['tot-straks', 'Tot straks!', 'See you later (today)!', 'Ik ga even naar de winkel. Tot straks!', "I'm just going to the shop. See you later!", { note: "Tot straks = later today · tot morgen = tomorrow · tot ziens = goodbye (polite)." }],
    ],
    pronunciation: {
      focus: 'g',
      tip: "The Dutch G is a friction sound at the back of the throat, like gently clearing it — never the English 'g' in 'go'. In the south of the Netherlands and in Flanders it is softer.",
      items: [
        { nl: 'Goedemorgen!', en: 'Good morning!' },
        { nl: 'Goed, dank je.', en: 'Good, thanks.' },
        { nl: 'Hoe gaat het?', en: 'How are you?' },
        { nl: 'Fijne dag!', en: 'Have a nice day!', hint: "The final g sounds like the ch in Scottish 'loch'." },
      ],
    },
    listening: {
      intro: 'Two colleagues meet at the coffee machine. How is Mark doing?',
      lines: [
        line('Lisa', 'Hé Mark, goedemorgen!', 'Hey Mark, good morning!'),
        line('Mark', 'Hoi Lisa. Hoe gaat het?', 'Hi Lisa. How are you?'),
        line('Lisa', 'Goed hoor! En met jou?', 'Good! And you?'),
        line('Mark', 'Gaat wel. Ik ben een beetje moe.', "So-so. I'm a bit tired."),
        line('Lisa', 'Ah, koffie helpt! Tot straks!', 'Ah, coffee helps! See you later!'),
      ],
      questions: [
        { type: 'choice', prompt: 'How is Mark?', options: ['Great', 'So-so, a bit tired', 'Ill'], answer: 1 },
        { type: 'choice', prompt: "What does 'Tot straks' mean?", options: ['See you tomorrow', 'See you later today', 'Goodbye forever'], answer: 1 },
      ],
    },
    speaking: {
      prompt: 'You meet your neighbour in the morning. Greet her and ask how she is.',
      mustInclude: [
        i('greet', 'Greet her', 'goedemorgen|hoi|hallo|goedemiddag|dag'),
        i('ask', 'Ask how she is', 'hoe gaat|alles goed'),
      ],
      modelAnswers: ['Goedemorgen! Hoe gaat het?', 'Hoi! Alles goed?'],
      hints: ['Goedemorgen! …', 'Hoe gaat …?'],
    },
    grammar: {
      title: "je and u: two ways to say 'you'",
      explanation:
        "Dutch has an informal 'you' (**je/jij**) and a formal one (**u**). Use **je** with friends, colleagues, neighbours your age and in most shops. Use **u** with older people you don't know, officials, doctors and in formal letters. The Netherlands is quite informal; in Flanders **u** is used more. If someone says *'Zeg maar je'* ('just say je'), switch!",
      examples: [
        { nl: 'Hoe gaat het met je?', en: 'How are you? (informal)', highlight: 'je' },
        { nl: 'Hoe gaat het met u?', en: 'How are you? (formal)', highlight: 'u' },
        { nl: 'Dank u wel, mevrouw.', en: 'Thank you, madam.', highlight: 'u' },
      ],
      commonMistake: {
        wrong: 'Ik ben goed.',
        right: 'Het gaat goed. / Goed!',
        why: "Answer 'Hoe gaat het?' with 'het gaat…' — 'Ik ben goed' is translated from English.",
      },
    },
    culture: {
      title: 'Three kisses — or a handshake?',
      body: "Friends and family in the Netherlands often greet with three kisses on the cheek (right–left–right), especially at birthdays. With colleagues and people you have just met, a handshake is normal — and you say your own first name while shaking hands. In Flanders it's usually one kiss. When in doubt, offer your hand: nobody will find that strange.",
    },
    review: [
      { type: 'translate', prompt: 'Good morning!', accept: ['Goedemorgen'] },
      { type: 'fill', sentence: 'Hoe ___ het?', en: 'How are you?', accept: ['gaat'] },
      { type: 'choose', patternId: 'ik-ben-goed', prompt: "A new colleague asks 'Hoe gaat het?'. The most natural answer:", options: ['Ik ben goed.', 'Goed, en met jou?', 'Hallo.'], answer: 1 },
      { type: 'choose', patternId: 'register-formal', prompt: 'At the town hall, you greet the civil servant with:', options: ['Hoi! Alles goed?', 'Goedemorgen!'], answer: 1 },
      { type: 'respond', situation: "It's evening. Your neighbour says 'Fijne avond!' Reply.", npc: { nl: 'Fijne avond!', en: 'Have a nice evening!' }, intents: [i('reply', 'Wish them the same', 'jij ook|u ook|insgelijks|fijne avond')], modelAnswers: ['Jij ook!', 'Dank je, jij ook! Doei!'] },
      { type: 'dictation', nl: 'Tot straks!', en: 'See you later!' },
    ],
  }),

  defineLesson({
    id: 'a0.introductions',
    level: 'A0',
    unit: 'Introducing yourself',
    order: 2,
    title: 'Ik heet… Introducing yourself',
    subtitle: "Your name, where you're from and where you live",
    canDo: 'I can introduce myself and ask others about their name, origin and home.',
    minutes: 10,
    situation: {
      setting: 'A language café in the library in Amersfoort. Everyone introduces themselves. Mohammed sits next to you.',
      dialogue: [
        line('Mohammed', 'Hoi, ik ben Mohammed. Hoe heet jij?', "Hi, I'm Mohammed. What's your name?"),
        line('You', 'Hoi! Ik heet Sam. Leuk je te ontmoeten.', 'Hi! My name is Sam. Nice to meet you.'),
        line('Mohammed', 'Insgelijks! Waar kom je vandaan?', 'Likewise! Where are you from?'),
        line('You', 'Ik kom uit Canada. En jij?', "I'm from Canada. And you?"),
        line('Mohammed', 'Ik kom uit Marokko, maar ik woon al tien jaar in Nederland.', "I'm from Morocco, but I've lived in the Netherlands for ten years."),
        line('You', 'Wat leuk! Ik woon nu in Amersfoort.', 'How nice! I live in Amersfoort now.'),
        line('Mohammed', 'O, ik ook! Wat doe je voor werk?', 'Oh, me too! What do you do for work?'),
        line('You', 'Ik ben verpleegkundige. Ik werk in het ziekenhuis.', "I'm a nurse. I work at the hospital."),
      ],
    },
    vocabulary: [
      ['ik-heet', 'Ik heet …', 'My name is …', 'Ik heet Sam, en jij?', 'My name is Sam, and you?', { note: "From 'heten' (to be called). Also fine: 'Ik ben Sam.'" }],
      ['hoe-heet-je', 'Hoe heet je?', "What's your name?", 'Hoi, ik ben Mohammed. Hoe heet jij?', "Hi, I'm Mohammed. What's your name?", { note: "Formal: 'Hoe heet u?' or 'Wat is uw naam?'" }],
      ['ik-kom-uit', 'Ik kom uit …', "I'm from …", 'Ik kom uit Canada.', "I'm from Canada.", { note: "'Uit' for countries and cities: uit Brazilië, uit Gent." }],
      ['waar-woon-je', 'Waar woon je?', 'Where do you live?', 'Waar woon je? – In Amersfoort, bij het station.', 'Where do you live? – In Amersfoort, near the station.', { note: "'Woon je', not 'woont je': the -t drops when je/jij comes after the verb." }],
      ['leuk-je-te-ontmoeten', 'Leuk je te ontmoeten', 'Nice to meet you', 'Hoi Mohammed, leuk je te ontmoeten!', 'Hi Mohammed, nice to meet you!', { note: "Formal: 'Aangenaam.' Also common: 'Leuk je te leren kennen.'" }],
      ['wat-doe-je', 'Wat doe je voor werk?', 'What do you do for work?', 'Wat doe je voor werk? – Ik ben leraar.', "What do you do for work? – I'm a teacher.", { note: "No article before a job: 'Ik ben leraar', not 'Ik ben een leraar'." }],
      ['ik-woon-in', 'Ik woon in …', 'I live in …', 'Ik woon in Rotterdam, in een klein appartement.', 'I live in Rotterdam, in a small apartment.'],
      ['ik-ook', 'Ik ook!', 'Me too!', 'Ik woon in Utrecht. – O, ik ook!', 'I live in Utrecht. – Oh, me too!', { note: "Negative: 'Ik ook niet' (me neither)." }],
    ],
    pronunciation: {
      focus: 'ui',
      tip: "UI has no English equivalent. Start from the 'ow' in 'house', then round your lips and push your tongue forward — somewhere between 'ow' and 'oy'. Never say 'oo-ee'.",
      items: [
        { nl: 'Ik kom uit Canada.', en: "I'm from Canada." },
        { nl: 'Ik woon in een huis.', en: 'I live in a house.' },
        { nl: 'Ik kom uit Duitsland.', en: "I'm from Germany." },
      ],
    },
    listening: {
      intro: "At a parents' evening, two parents introduce themselves. Where does Els live?",
      lines: [
        line('Els', 'Hallo, ik ben Els, de moeder van Noor.', "Hello, I'm Els, Noor's mother."),
        line('Karim', 'Hoi Els, ik ben Karim. Ik ben de vader van Adam.', "Hi Els, I'm Karim. I'm Adam's father."),
        line('Els', 'Leuk! Woon je hier in de buurt?', 'Nice! Do you live around here?'),
        line('Karim', 'Ja, in de Kerkstraat. En jij?', 'Yes, in the Kerkstraat. And you?'),
        line('Els', 'Wij wonen in Hoogland, tien minuten fietsen.', 'We live in Hoogland, ten minutes by bike.'),
      ],
      questions: [
        { type: 'choice', prompt: 'Who is Karim?', options: ["Noor's father", "Adam's father", 'A teacher'], answer: 1 },
        { type: 'text', prompt: 'Where does Els live? (one word)', accept: ['Hoogland', 'in Hoogland'] },
      ],
    },
    speaking: {
      prompt: "Introduce yourself to the group: your name, where you're from and where you live.",
      mustInclude: [
        i('name', 'Say your name', 'heet|naam is', 'ik ben'),
        i('origin', "Say where you're from", 'uit|vandaan|afkomstig'),
        i('home', 'Say where you live', 'woon'),
      ],
      modelAnswers: [
        'Hallo, ik heet Sam. Ik kom uit Canada en ik woon in Amersfoort.',
        'Hoi allemaal! Ik ben Sam, ik kom uit Canada en ik woon nu in Amersfoort.',
      ],
      hints: ['Ik heet …', 'Ik kom uit …', 'Ik woon in …'],
    },
    grammar: {
      title: 'Verbs: ik woon, jij woont, woon jij?',
      explanation:
        "The present tense is simple: **ik** = the stem (*woon*); **jij/je, u, hij, zij** = stem + **t** (*woont*); **wij, jullie, zij** (they) = the infinitive (*wonen*). One twist: when **jij/je** comes *after* the verb, the **-t** drops: *Woon jij hier?* · *Waar woon je?*",
      examples: [
        { nl: 'Ik woon in Utrecht.', en: 'I live in Utrecht.', highlight: 'woon' },
        { nl: 'Hij woont in Gent.', en: 'He lives in Ghent.', highlight: 'woont' },
        { nl: 'Waar woon je?', en: 'Where do you live?', highlight: 'woon je' },
        { nl: 'Wij wonen in Leuven.', en: 'We live in Leuven.', highlight: 'wonen' },
      ],
      commonMistake: {
        wrong: 'Ik ben heet Sam.',
        right: 'Ik heet Sam.',
        why: "'Heet' as an adjective means 'hot'. Use the verb heten: 'Ik heet…', or just 'Ik ben Sam.'",
      },
    },
    culture: {
      title: 'First names, fast',
      body: "Dutch people switch to first names quickly — with colleagues, managers and even teachers. Don't be surprised by direct questions like 'Wat doe je voor werk?' or 'Hoe oud ben je?': it's curiosity, not rudeness. And if you want to practise, language cafés (taalcafés) in libraries are free and very welcoming.",
    },
    review: [
      { type: 'translate', patternId: 'heten', prompt: 'My name is Sam.', accept: ['Ik heet Sam', 'Ik ben Sam', 'Mijn naam is Sam'] },
      { type: 'fill', patternId: 'jij-inversion-t', sentence: 'Waar ___ je? (wonen)', en: 'Where do you live?', accept: ['woon'] },
      { type: 'order', en: "I'm from Brazil.", words: ['Ik', 'kom', 'uit', 'Brazilië'] },
      { type: 'choose', prompt: "'Ik ben een leraar' or 'Ik ben leraar'?", options: ['Ik ben een leraar.', 'Ik ben leraar.'], answer: 1, explanation: 'No article before a profession.' },
      { type: 'respond', situation: "Someone at the language café asks: 'Waar kom je vandaan?' Answer and ask back.", npc: { nl: 'Waar kom je vandaan?', en: 'Where are you from?' }, intents: [i('origin', "Say where you're from", 'uit|vandaan'), i('ask', 'Ask back', 'en jij|en u|waar kom jij')], modelAnswers: ['Ik kom uit Canada. En jij?', 'Uit Canada! En jij, waar kom jij vandaan?'] },
      { type: 'dictation', nl: 'Leuk je te ontmoeten.', en: 'Nice to meet you.' },
    ],
  }),

  defineLesson({
    id: 'a0.numbers',
    level: 'A0',
    unit: 'Numbers',
    order: 3,
    title: 'Numbers and prices',
    subtitle: "Count, pay and ask 'How much is it?'",
    canDo: 'I can understand prices, ask what something costs and give my phone number.',
    minutes: 10,
    situation: {
      setting: 'The Saturday market in Leiden. You want to buy apples and flowers.',
      dialogue: [
        line('Seller', 'Goedemorgen! Zeg het maar.', 'Good morning! What can I get you?'),
        line('You', 'Goedemorgen. Hoeveel kosten de appels?', 'Good morning. How much are the apples?'),
        line('Seller', 'Twee euro vijftig per kilo.', 'Two euros fifty per kilo.'),
        line('You', 'Doe maar één kilo, alstublieft.', "I'll have one kilo, please."),
        line('Seller', 'Anders nog iets?', 'Anything else?'),
        line('You', 'Ja, een bos tulpen. Wat kosten die?', 'Yes, a bunch of tulips. What do they cost?'),
        line('Seller', 'Vijf euro. Dat is dan zeven euro vijftig bij elkaar.', 'Five euros. That makes seven euros fifty altogether.'),
        line('You', 'Kan ik pinnen?', 'Can I pay by card?'),
        line('Seller', 'Natuurlijk!', 'Of course!'),
      ],
    },
    vocabulary: [
      ['hoeveel-kost', 'Hoeveel kost …?', 'How much is …?', 'Hoeveel kost een kilo tomaten?', 'How much is a kilo of tomatoes?', { note: "Plural: 'Hoeveel kosten de appels?' Or simply: 'Wat kost dat?'" }],
      ['dat-is-dan', 'Dat is dan … euro', "That'll be … euros", 'Dat is dan vier euro twintig.', "That'll be four euros twenty.", { note: "Prices: 'vier euro twintig' (€4.20). 'Euro' stays singular after a number." }],
      ['zeg-het-maar', 'Zeg het maar', 'What can I get you?', 'Goedemiddag, zeg het maar!', 'Good afternoon, what can I get you?', { note: "Literally 'Say it'. Shopkeepers and waiters use it all the time." }],
      ['anders-nog-iets', 'Anders nog iets?', 'Anything else?', 'Anders nog iets? – Nee, dat was het.', 'Anything else? – No, that was it.', { note: "Answer: 'Nee, dat was het' or 'Nee, dank u.'" }],
      ['kan-ik-pinnen', 'Kan ik pinnen?', 'Can I pay by card?', 'Kan ik hier pinnen, of alleen contant?', 'Can I pay by card here, or only cash?', { note: "'Pinnen' (from PIN) = pay by debit card — the default. Contant = cash." }],
      ['eenentwintig', 'eenentwintig', 'twenty-one', 'Ik ben eenentwintig jaar.', "I'm twenty-one.", { note: "Dutch says 'one-and-twenty': eenentwintig, tweeëntwintig, drieëntwintig…" }],
      ['mijn-nummer', 'Mijn nummer is …', 'My number is …', 'Mijn nummer is 06 12 34 56 78.', 'My number is 06 12 34 56 78.', { note: "Dutch mobile numbers start with 06 ('nul zes'). People often read them in pairs." }],
      ['de-appel', 'de appel', 'the apple', 'Ik neem een kilo appels.', "I'll take a kilo of apples.", { article: 'de', emoji: '🍎' }],
    ],
    pronunciation: {
      focus: 'vowel-length',
      tip: "Short and long vowels change meaning: 'man' (man) vs 'maan' (moon). A double vowel (aa, ee, oo, uu) is long: hold it. In numbers: 'twee' (long ee), 'acht' (short a), 'negen' (long ee — a single vowel at the end of a syllable is long too).",
      items: [
        { nl: 'één, twee, drie, vier', en: 'one, two, three, four' },
        { nl: 'acht, negen, tien', en: 'eight, nine, ten' },
        { nl: 'Dat is dan twee euro.', en: "That'll be two euros." },
      ],
    },
    listening: {
      intro: 'At the bakery. How much does Sara pay?',
      lines: [
        line('Baker', 'Wie is er aan de beurt?', "Who's next?"),
        line('Sara', 'Ik! Mag ik een bruin brood en vier krentenbollen?', 'Me! Can I have a brown loaf and four currant buns?'),
        line('Baker', 'Gesneden?', 'Sliced?'),
        line('Sara', 'Ja, graag.', 'Yes, please.'),
        line('Baker', 'Dat is dan zes euro tachtig.', "That's six euros eighty."),
      ],
      questions: [
        { type: 'choice', prompt: 'How much does Sara pay?', options: ['€6.18', '€6.80', '€8.60'], answer: 1 },
        { type: 'choice', prompt: "What does 'Wie is er aan de beurt?' mean?", options: ["Who's next?", 'Is it your birthday?', 'Where is the bread?'], answer: 0 },
      ],
    },
    speaking: {
      prompt: 'At the market, ask how much the tomatoes cost, and ask if you can pay by card.',
      mustInclude: [
        i('price', 'Ask the price', 'hoeveel kost*|wat kost*'),
        i('card', 'Ask to pay by card', 'pinnen|pin|kaart|pinpas'),
      ],
      modelAnswers: ['Hoeveel kosten de tomaten? Kan ik pinnen?', 'Wat kosten de tomaten? En kan ik hier pinnen?'],
      hints: ['Hoeveel kosten …?', 'Kan ik …?'],
    },
    grammar: {
      title: "Numbers: the 'one-and-twenty' order",
      explanation:
        "From 21 to 99 Dutch says the units first: **eenentwintig** (one-and-twenty), **vijfendertig** (five-and-thirty). When the first part ends in a vowel, you write a trema: **tweeëntwintig**, **drieënveertig**. Prices: **drie euro vijftig** (€3.50). Units like **euro, jaar, kilo** stay singular after a number: *twee kilo appels*.",
      examples: [
        { nl: 'eenentwintig', en: '21' },
        { nl: 'vijfenveertig', en: '45' },
        { nl: 'honderdtwintig', en: '120' },
        { nl: 'Het kost negen euro vijfennegentig.', en: 'It costs €9.95.' },
      ],
      commonMistake: { wrong: 'Het kost tien euros.', right: 'Het kost tien euro.', why: "After a number, 'euro' stays singular." },
    },
    culture: {
      title: 'Pinnen, please',
      body: "The Netherlands is almost cashless: people pay by debit card ('pinnen') or phone, even for one coffee. Some shops don't accept cash at all. Credit cards are less common than in the UK or US, so a debit card is handy. In Belgium the everyday card system is Bancontact. Splitting the bill with friends? One person pays and sends everyone a payment request by app.",
    },
    review: [
      { type: 'translate', prompt: 'How much is the bread?', accept: ['Hoeveel kost het brood', 'Wat kost het brood'] },
      { type: 'choose', prompt: 'Which number is 47?', options: ['vierenzeventig', 'zevenenveertig', 'veertigzeven'], answer: 1 },
      { type: 'fill', patternId: 'units-after-numbers', sentence: 'Het kost twee ___. (€2)', en: 'It costs two euros.', accept: ['euro'] },
      { type: 'dictation', nl: 'Dat is dan vijf euro vijftig.', en: "That'll be five euros fifty." },
      { type: 'respond', situation: "The market seller asks 'Anders nog iets?' Say no, that was it.", npc: { nl: 'Anders nog iets?', en: 'Anything else?' }, intents: [i('no', 'Say that was all', 'nee|dat was het|dat is alles|niks|niets')], modelAnswers: ['Nee, dat was het.', 'Nee, dank u, dat was het.'] },
    ],
  }),

  defineLesson({
    id: 'a0.survival',
    level: 'A0',
    unit: 'Everyday phrases',
    order: 4,
    title: 'Survival phrases',
    subtitle: "When you don't understand — and how to keep the conversation in Dutch",
    canDo: 'I can ask people to repeat, speak slowly or explain a word — without switching to English.',
    minutes: 8,
    situation: {
      setting: 'The reception desk of the library. The librarian speaks quite fast.',
      dialogue: [
        line('Librarian', 'Goedemiddag! Kan ik u helpen?', 'Good afternoon! Can I help you?'),
        line('You', 'Ja, graag. Ik wil graag een bibliotheekpas.', "Yes, please. I'd like a library card."),
        line('Librarian', 'Prima. Dan heb ik uw legitimatiebewijs en een bewijs van inschrijving nodig.', 'Fine. Then I need your ID and proof of registration.'),
        line('You', 'Sorry, ik spreek nog niet zo goed Nederlands. Kunt u dat wat langzamer herhalen?', "Sorry, my Dutch isn't very good yet. Could you repeat that a bit more slowly?"),
        line('Librarian', 'Natuurlijk. Uw paspoort, en een papier van de gemeente met uw adres.', 'Of course. Your passport, and a paper from the municipality with your address.'),
        line('You', "Wat betekent 'legitimatiebewijs'?", "What does 'legitimatiebewijs' mean?"),
        line('Librarian', 'Dat is een paspoort of een ID-kaart.', "That's a passport or an ID card."),
        line('You', 'Ah, ik begrijp het. Dank u wel!', 'Ah, I understand. Thank you!'),
      ],
    },
    vocabulary: [
      ['kunt-u-herhalen', 'Kunt u dat herhalen?', 'Could you repeat that?', 'Sorry, kunt u dat nog een keer herhalen?', 'Sorry, could you repeat that once more?', { note: "Informal: 'Kun je dat herhalen?' Shorter: 'Sorry?' or 'Wat zei je?'" }],
      ['langzamer', 'Wat langzamer, alstublieft', 'A bit slower, please', 'Kunt u wat langzamer praten, alstublieft?', 'Could you speak a bit slower, please?'],
      ['wat-betekent', 'Wat betekent …?', 'What does … mean?', "Wat betekent 'gezellig'?", "What does 'gezellig' mean?"],
      ['ik-begrijp-het-niet', 'Ik begrijp het niet', "I don't understand", 'Sorry, ik begrijp het niet helemaal.', "Sorry, I don't quite understand.", { note: "Informal and very common: 'Ik snap het niet.'" }],
      ['nog-niet-zo-goed', 'Ik spreek nog niet zo goed Nederlands', "My Dutch isn't very good yet", 'Ik spreek nog niet zo goed Nederlands, maar ik wil graag oefenen.', "My Dutch isn't very good yet, but I'd like to practise.", { note: "With 'maar ik wil graag oefenen', this is your best tool against people switching to English!" }],
      ['mag-ik-even', 'Mag ik even …?', 'May I just …?', 'Mag ik even langs?', 'May I just get past?', { note: "'Even' makes a request light and polite." }],
      ['alstublieft', 'alstublieft / alsjeblieft', 'please; here you are', 'Een koffie, alstublieft. – Alsjeblieft!', 'A coffee, please. – Here you are!', { note: 'Formal/informal pair. Also used when handing something over.' }],
      ['geen-probleem', 'Geen probleem', 'No problem', 'Sorry! – Geen probleem hoor.', 'Sorry! – No problem at all.'],
    ],
    pronunciation: {
      focus: 'ij',
      tip: "IJ and EI sound the same: roughly like 'ay' in 'day', but with the mouth more open and a shorter glide. Think of the vowel in 'bike' said with a Dutch-flat mouth.",
      items: [
        { nl: 'Ik begrijp het niet.', en: "I don't understand." },
        { nl: 'Mijn Nederlands is nog niet zo goed.', en: "My Dutch isn't very good yet." },
        { nl: 'Ik blijf Nederlands spreken.', en: 'I keep speaking Dutch.' },
      ],
    },
    listening: {
      intro: "A tourist asks for directions but doesn't understand at first. What does the tourist ask?",
      lines: [
        line('Tourist', 'Pardon, waar is het museum?', 'Excuse me, where is the museum?'),
        line('Man', 'Het museum? Hier rechtdoor, bij de brug linksaf en dan zie je het al.', "The museum? Straight on here, turn left at the bridge and then you'll see it."),
        line('Tourist', 'Sorry, kunt u dat langzamer zeggen?', 'Sorry, could you say that more slowly?'),
        line('Man', 'Ja hoor. Rechtdoor. Bij de brug: links.', 'Sure. Straight on. At the bridge: left.'),
        line('Tourist', 'Dank u wel!', 'Thank you!'),
      ],
      questions: [
        { type: 'choice', prompt: 'What does the tourist ask the man to do?', options: ['Speak English', 'Speak more slowly', 'Draw a map'], answer: 1 },
        { type: 'choice', prompt: 'Where should the tourist turn left?', options: ['At the traffic lights', 'At the bridge', 'At the church'], answer: 1 },
      ],
    },
    speaking: {
      prompt: "Someone speaks too fast. Say that your Dutch isn't very good yet and ask them to repeat it slowly.",
      mustInclude: [
        i('explain', 'Say your Dutch is still limited', 'nog niet|niet zo goed|beetje|ik leer'),
        i('repeat', 'Ask to repeat or slow down', 'herhalen|langza*|nog een keer|nog eens'),
      ],
      modelAnswers: [
        'Sorry, ik spreek nog niet zo goed Nederlands. Kunt u dat herhalen?',
        'Sorry, mijn Nederlands is nog niet zo goed. Kunt u het wat langzamer zeggen?',
      ],
      hints: ['Sorry, ik spreek nog niet …', 'Kunt u dat …?'],
    },
    grammar: {
      title: 'Questions: the verb comes first',
      explanation:
        "Yes/no questions start with the verb: **Spreekt u Engels?** · **Kun je dat herhalen?** With a question word, the question word comes first and the verb second: **Wat betekent dat?** · **Waar is het station?** In both cases the subject follows the verb.",
      examples: [
        { nl: 'Spreek je Engels?', en: 'Do you speak English?', highlight: 'Spreek je' },
        { nl: 'Kunt u dat herhalen?', en: 'Can you repeat that?', highlight: 'Kunt u' },
        { nl: 'Wat betekent dat woord?', en: 'What does that word mean?', highlight: 'Wat betekent' },
      ],
      commonMistake: { wrong: 'Spreekt je Engels?', right: 'Spreek je Engels?', why: 'With je/jij after the verb, the -t drops.' },
    },
    culture: {
      title: '“Can we speak Dutch?”',
      body: "Many Dutch people switch to English as soon as they hear an accent — out of politeness and efficiency, not to exclude you. Say kindly: 'Ik wil graag Nederlands oefenen. Mogen we Nederlands praten?' Most people are happy to help. In Flanders people switch a little less quickly, but the same sentence works wonders there too.",
    },
    review: [
      { type: 'translate', prompt: "I don't understand.", accept: ['Ik begrijp het niet', 'Ik snap het niet'] },
      { type: 'fill', sentence: "Wat ___ 'gezellig'?", en: "What does 'gezellig' mean?", accept: ['betekent'] },
      { type: 'choose', prompt: 'The most polite way to ask a stranger to repeat:', options: ['Wat?', 'Kunt u dat herhalen, alstublieft?', 'Herhaal!'], answer: 1 },
      { type: 'order', en: 'Could you speak a bit slower?', words: ['Kunt', 'u', 'wat', 'langzamer', 'praten'] },
      { type: 'respond', situation: 'A colleague switches to English. Kindly ask to keep speaking Dutch.', intents: [i('dutch', 'Ask to speak Dutch', 'nederlands')], modelAnswers: ['Mogen we Nederlands praten? Ik wil graag oefenen.', 'Ik wil graag Nederlands oefenen. Kunnen we Nederlands spreken?'] },
      { type: 'dictation', nl: 'Ik spreek nog niet zo goed Nederlands.', en: "My Dutch isn't very good yet." },
    ],
  }),
];
