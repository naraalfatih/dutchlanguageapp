import type { ListeningItem } from '@praat/core';
import { line } from './helpers.js';

/**
 * Listening Trainer: realistic audio texts from everyday life, the street, the workplace,
 * the news and podcasts. Played at normal speed by default, with slow speed, transcript,
 * vocabulary and slang notes after a first "gist" listen.
 */
export const listeningItems: ListeningItem[] = [
  {
    id: 'listen.a1.bakery',
    level: 'A1',
    kind: 'conversation',
    title: 'At the bakery',
    description: 'A short everyday exchange at the bakery.',
    speakers: [
      { id: 'baker', name: 'Baker', voice: 'm' },
      { id: 'customer', name: 'Customer', voice: 'f' },
    ],
    lines: [
      line('Baker', 'Goedemorgen! Zegt u het maar.', 'Good morning! What can I get you?'),
      line('Customer', 'Goedemorgen. Mag ik een volkorenbrood en zes krentenbollen?', 'Good morning. May I have a wholemeal loaf and six currant buns?'),
      line('Baker', 'Gesneden of ongesneden?', 'Sliced or unsliced?'),
      line('Customer', 'Gesneden, graag.', 'Sliced, please.'),
      line('Baker', 'Dat is dan zeven euro tien. Wilt u pinnen?', "That'll be seven euros ten. Would you like to pay by card?"),
      line('Customer', 'Ja, graag. Dank u wel!', 'Yes, please. Thank you!'),
    ],
    questions: [
      { type: 'choice', prompt: 'How many currant buns does she buy?', options: ['4', '6', '10'], answer: 1 },
      { type: 'choice', prompt: 'How much does she pay?', options: ['€7.10', '€10.70', '€7.00'], answer: 0 },
    ],
    vocab: [
      { term: 'volkorenbrood', meaning: 'wholemeal bread' },
      { term: 'gesneden', meaning: 'sliced' },
      { term: 'krentenbollen', meaning: 'currant buns' },
    ],
    slang: [],
  },
  {
    id: 'listen.a1.announcement',
    level: 'A1',
    kind: 'announcement',
    title: 'Supermarket announcement',
    description: 'The shop is about to close. When can you come back?',
    speakers: [{ id: 'voice', name: 'Announcement', voice: 'f' }],
    lines: [
      line('Announcement', 'Beste klanten, onze winkel sluit over tien minuten.', 'Dear customers, our shop closes in ten minutes.'),
      line('Announcement', 'Wilt u uw boodschappen naar de kassa brengen?', 'Would you please bring your shopping to the checkout?'),
      line('Announcement', 'Morgen, op zondag, zijn wij open van twaalf tot zes uur.', 'Tomorrow, Sunday, we are open from twelve to six.'),
      line('Announcement', 'Dank u wel en tot ziens!', 'Thank you and goodbye!'),
    ],
    questions: [
      { type: 'choice', prompt: 'When does the shop close?', options: ['In 10 minutes', 'In an hour', 'At six'], answer: 0 },
      { type: 'choice', prompt: 'Opening hours on Sunday?', options: ['12:00–18:00', '10:00–18:00', 'Closed'], answer: 0 },
    ],
    vocab: [
      { term: 'sluit', meaning: 'closes' },
      { term: 'de boodschappen', meaning: 'the groceries' },
    ],
    slang: [],
  },
  {
    id: 'listen.a2.voicemail',
    level: 'A2',
    kind: 'voicemail',
    title: "A friend's voicemail",
    description: 'Noor changes the plan for Saturday.',
    speakers: [{ id: 'noor', name: 'Noor', voice: 'f' }],
    lines: [
      line('Noor', 'Hoi, met Noor! Ik bel even over zaterdag.', "Hi, it's Noor! I'm calling about Saturday."),
      line('Noor', 'We gaan niet naar het strand, want het gaat regenen. Balen!', "We're not going to the beach, because it's going to rain. Bummer!"),
      line('Noor', 'Zullen we naar de bioscoop gaan? De film begint om kwart over acht.', 'Shall we go to the cinema? The film starts at a quarter past eight.'),
      line('Noor', 'Bel of app me even terug, oké? Doei!', 'Call or text me back, okay? Bye!'),
    ],
    questions: [
      { type: 'choice', prompt: 'Why is the beach plan cancelled?', options: ["It's going to rain", 'Noor is ill', 'The car is broken'], answer: 0 },
      { type: 'choice', prompt: 'What time does the film start?', options: ['8:15', '8:45', '7:45'], answer: 0 },
      { type: 'choice', prompt: "What does 'Balen!' express?", options: ['Disappointment', 'Joy', 'Surprise'], answer: 0 },
    ],
    vocab: [
      { term: 'de bioscoop', meaning: 'the cinema' },
      { term: 'terugbellen', meaning: 'to call back' },
    ],
    slang: [
      { term: 'Balen!', meaning: 'Bummer!', note: 'A very common reaction to bad luck.' },
      { term: 'app me', meaning: 'text me', note: "From 'appen': sending a message through a chat app." },
    ],
  },
  {
    id: 'listen.a2.directions',
    level: 'A2',
    kind: 'street',
    title: 'Asking the way',
    description: 'A tourist asks a passer-by for the market in Utrecht.',
    speakers: [
      { id: 'tourist', name: 'Tourist', voice: 'm' },
      { id: 'woman', name: 'Woman', voice: 'f' },
    ],
    lines: [
      line('Tourist', 'Sorry, mag ik iets vragen? Waar is de markt?', 'Sorry, may I ask something? Where is the market?'),
      line('Woman', 'De markt? Die is vandaag op het Vredenburgplein. Loop hier rechtdoor, tweede straat links.', "The market? Today it's on the Vredenburgplein. Walk straight ahead, second street on the left."),
      line('Tourist', 'Tweede links. Is het ver?', 'Second left. Is it far?'),
      line('Woman', 'Nee hoor, vijf minuutjes lopen. Je ziet de kraampjes vanzelf.', "No, five minutes' walk. You'll see the stalls straight away."),
    ],
    questions: [
      { type: 'choice', prompt: 'Where does the tourist have to turn?', options: ['Second street on the left', 'First street on the right', 'At the church'], answer: 0 },
      { type: 'choice', prompt: 'How far is it?', options: ["About five minutes' walk", 'Half an hour', 'Ten minutes by bike'], answer: 0 },
    ],
    vocab: [
      { term: 'de markt', meaning: 'the market' },
      { term: 'de kraampjes', meaning: 'the (market) stalls' },
    ],
    slang: [{ term: 'vijf minuutjes', meaning: 'five minutes', note: 'Diminutives make a distance sound short and friendly.' }],
  },
  {
    id: 'listen.b1.standup',
    level: 'B1',
    kind: 'workplace',
    title: 'Monday stand-up',
    description: 'A quick team round at the start of the week.',
    speakers: [
      { id: 'linda', name: 'Linda', voice: 'f' },
      { id: 'sander', name: 'Sander', voice: 'm' },
      { id: 'priya', name: 'Priya', voice: 'f' },
    ],
    lines: [
      line('Linda', 'Goedemorgen allemaal. Even snel het rondje: wat doen jullie deze week?', 'Good morning everyone. Quick round: what are you working on this week?'),
      line('Sander', 'Ik maak de presentatie voor de klant af. Die moet woensdag klaar zijn.', "I'm finishing the presentation for the client. It has to be ready on Wednesday."),
      line('Priya', 'Ik zit nog vast met de cijfers. Ik heb de data van de afdeling financiën nodig.', "I'm still stuck with the figures. I need the data from the finance department."),
      line('Linda', 'Oké, ik bel ze vandaag even. Verder nog iets? Nee? Dan gaan we aan de slag!', "Okay, I'll call them today. Anything else? No? Then let's get to work!"),
    ],
    questions: [
      { type: 'choice', prompt: 'When must the presentation be ready?', options: ['Monday', 'Wednesday', 'Friday'], answer: 1 },
      { type: 'choice', prompt: "What is Priya's problem?", options: ['She needs data from finance', "She's ill", 'The client cancelled'], answer: 0 },
      { type: 'choice', prompt: 'What will Linda do?', options: ['Call the finance department', 'Finish the presentation', 'Cancel the meeting'], answer: 0 },
    ],
    vocab: [
      { term: 'het rondje', meaning: 'the round (everyone speaks briefly)' },
      { term: 'vastzitten', meaning: 'to be stuck' },
      { term: 'aan de slag gaan', meaning: 'to get to work' },
    ],
    slang: [],
  },
  {
    id: 'listen.b1.weather',
    level: 'B1',
    kind: 'news',
    title: 'Weather forecast',
    description: 'The evening weather report.',
    speakers: [{ id: 'weather', name: 'Weather presenter', voice: 'm' }],
    lines: [
      line('Presenter', 'En dan het weer. Vannacht trekt er een regenzone over het land.', 'And now the weather. Tonight a band of rain will cross the country.'),
      line('Presenter', 'Morgenochtend is het nog nat, maar in de loop van de middag wordt het droog vanuit het westen.', 'Tomorrow morning it will still be wet, but during the afternoon it will become dry from the west.'),
      line('Presenter', 'Het wordt maximaal twaalf graden, en er staat een stevige zuidwestenwind.', "Maximum temperature twelve degrees, with a strong south-westerly wind."),
      line('Presenter', 'Het weekend ziet er beter uit: zonnig en rond de vijftien graden.', 'The weekend looks better: sunny and around fifteen degrees.'),
    ],
    questions: [
      { type: 'choice', prompt: 'When does it get dry tomorrow?', options: ['In the morning', 'During the afternoon', 'Not at all'], answer: 1 },
      { type: 'text', prompt: "Tomorrow's maximum temperature (a number)?", accept: ['12', 'twaalf'] },
      { type: 'choice', prompt: 'The weekend will be…', options: ['rainy', 'sunny, around 15°', 'stormy'], answer: 1 },
    ],
    vocab: [
      { term: 'de regenzone', meaning: 'band of rain' },
      { term: 'in de loop van', meaning: 'during, over the course of' },
      { term: 'een stevige wind', meaning: 'a strong wind' },
    ],
    slang: [],
  },
  {
    id: 'listen.b1.podcast-cycling',
    level: 'B1',
    kind: 'podcast',
    title: 'Podcast: learning to cycle at thirty',
    description: 'Ahmed learned to cycle as an adult in the Netherlands.',
    speakers: [
      { id: 'iris', name: 'Iris', voice: 'f' },
      { id: 'ahmed', name: 'Ahmed', voice: 'm' },
    ],
    lines: [
      line('Iris', 'Welkom bij Nieuw in Nederland. Vandaag praat ik met Ahmed. Ahmed, jij leerde pas fietsen toen je dertig was?', "Welcome to New in the Netherlands. Today I'm talking to Ahmed. Ahmed, you only learned to cycle when you were thirty?"),
      line('Ahmed', 'Ja, echt waar. In mijn land fietste bijna niemand. Hier voelde ik me soms echt een buitenstaander.', 'Yes, really. In my country almost nobody cycled. Here I sometimes felt like a real outsider.'),
      line('Iris', 'Hoe heb je het geleerd?', 'How did you learn?'),
      line('Ahmed', 'Bij een fietsles van de gemeente. Na vijf lessen durfde ik de straat op. Nu fiets ik elke dag naar mijn werk.', 'At a cycling class run by the municipality. After five lessons I dared to go on the road. Now I cycle to work every day.'),
      line('Iris', 'Geweldig! Wat is je tip voor luisteraars?', "Great! What's your tip for listeners?"),
      line('Ahmed', 'Schaam je niet. Iedereen begint ergens.', "Don't be ashamed. Everyone starts somewhere."),
    ],
    questions: [
      { type: 'choice', prompt: 'When did Ahmed learn to cycle?', options: ['As a child', 'At thirty', 'Last year'], answer: 1 },
      { type: 'choice', prompt: 'After how many lessons did he dare to go on the road?', options: ['Two', 'Five', 'Ten'], answer: 1 },
      { type: 'choice', prompt: 'What is his tip?', options: ["Don't be ashamed; everyone starts somewhere", 'Buy an expensive bike', 'Only cycle in summer'], answer: 0 },
    ],
    vocab: [
      { term: 'de buitenstaander', meaning: 'the outsider' },
      { term: 'durven', meaning: 'to dare' },
      { term: 'zich schamen', meaning: 'to be ashamed' },
    ],
    slang: [],
  },
  {
    id: 'listen.b2.vox-pop',
    level: 'B2',
    kind: 'street',
    title: 'Street interviews: the housing shortage',
    description: 'A reporter asks passers-by about the housing crisis.',
    speakers: [
      { id: 'reporter', name: 'Reporter', voice: 'f' },
      { id: 'man', name: 'Man', voice: 'm' },
      { id: 'woman', name: 'Woman', voice: 'f' },
      { id: 'student', name: 'Student', voice: 'm' },
    ],
    lines: [
      line('Reporter', 'Wat vindt u van de woningnood in de stad?', 'What do you think of the housing shortage in the city?'),
      line('Man', 'Nou, dramatisch. Mijn zoon is dertig en woont nog steeds thuis. Dat is toch niet normaal?', "Well, dramatic. My son is thirty and still lives at home. That's not normal, is it?"),
      line('Woman', 'Ik snap het probleem, maar ik wil niet dat ze overal gaan bouwen. Het groen moet blijven.', "I understand the problem, but I don't want them to build everywhere. The green spaces must stay."),
      line('Student', 'Ik betaal achthonderd euro voor een kamer van twaalf vierkante meter. Echt belachelijk.', 'I pay eight hundred euros for a room of twelve square metres. Really ridiculous.'),
    ],
    questions: [
      { type: 'choice', prompt: "The man's son…", options: ['is thirty and still lives at home', 'bought a house', 'lives abroad'], answer: 0 },
      { type: 'choice', prompt: "What is the woman's concern?", options: ['Building on green spaces', 'High rents', 'Noise'], answer: 0 },
      { type: 'text', prompt: 'How much rent does the student pay (in euros)?', accept: ['800', 'achthonderd'] },
    ],
    vocab: [
      { term: 'de woningnood', meaning: 'the housing shortage' },
      { term: 'vierkante meter', meaning: 'square metre' },
      { term: 'belachelijk', meaning: 'ridiculous' },
    ],
    slang: [{ term: 'Dat is toch niet normaal?', meaning: "That's not normal, is it?", note: "'Niet normaal' is a very common way to express outrage — or amazement." }],
  },
  {
    id: 'listen.b2.podcast-directness',
    level: 'B2',
    kind: 'podcast',
    title: 'Podcast: are the Dutch rude?',
    description: 'An expat coach explains Dutch directness.',
    speakers: [
      { id: 'bas', name: 'Bas', voice: 'm' },
      { id: 'mei', name: 'Mei', voice: 'f' },
    ],
    lines: [
      line('Bas', 'Mei, jij coacht expats. Vinden zij Nederlanders onbeleefd?', 'Mei, you coach expats. Do they find Dutch people rude?'),
      line('Mei', "In het begin wel. Mijn klanten schrikken als een collega zegt: 'Dit is geen goed plan.'", "At first, yes. My clients are shocked when a colleague says: 'This is not a good plan.'"),
      line('Mei', 'Maar na een tijdje merken ze dat het niet persoonlijk is. Het gaat om de zaak, niet om jou.', "But after a while they notice it isn't personal. It's about the matter, not about you."),
      line('Bas', 'Dus directheid is eigenlijk een vorm van respect?', 'So directness is actually a form of respect?'),
      line('Mei', 'Precies. Je neemt de ander serieus genoeg om eerlijk te zijn. Al mag het soms best wat vriendelijker, hoor.', 'Exactly. You take the other person seriously enough to be honest. Although it could sometimes be a bit friendlier, mind you.'),
    ],
    questions: [
      { type: 'choice', prompt: 'How do expats react at first?', options: ['They are shocked', 'They love it', 'They ignore it'], answer: 0 },
      { type: 'choice', prompt: 'According to Mei, directness is…', options: ['a form of respect', 'always rude', 'only for managers'], answer: 0 },
      { type: 'choice', prompt: "What does 'Al mag het soms best wat vriendelijker' add?", options: ['A nuance: it could sometimes be friendlier', 'A complaint about expats', 'Agreement that it is rude'], answer: 0 },
    ],
    vocab: [
      { term: 'schrikken', meaning: 'to be startled, shocked' },
      { term: 'het gaat om de zaak', meaning: "it's about the matter (not the person)" },
      { term: 'al (+ verb)', meaning: 'although' },
    ],
    slang: [],
  },
  {
    id: 'listen.c1.flemish',
    level: 'C1',
    kind: 'conversation',
    title: 'Flemish friends at a café',
    description: 'Two friends in Ghent speak everyday Flemish.',
    speakers: [
      { id: 'jens', name: 'Jens', voice: 'm' },
      { id: 'ellen', name: 'Ellen', voice: 'f' },
    ],
    lines: [
      line('Jens', 'Amai, gij zijt laat! Wat scheelde er?', "Wow, you're late! What was the matter?"),
      line('Ellen', 'Allee, de tram stond weer stil. Ik heb een halfuur staan wachten in de regen.', 'Well, the tram was stuck again. I stood waiting in the rain for half an hour.'),
      line('Jens', 'Zot, hè. Wilt ge iets drinken? Ik trakteer.', 'Crazy, right. Do you want something to drink? My treat.'),
      line('Ellen', 'Een warme chocomelk, graag. Ik heb daar echt goesting in.', 'A hot chocolate, please. I really fancy one.'),
      line('Jens', 'Komt in orde. En daarna een pintje?', "It'll be done. And a beer afterwards?"),
      line('Ellen', 'Ge kent mij!', 'You know me!'),
    ],
    questions: [
      { type: 'choice', prompt: 'Why was Ellen late?', options: ['The tram was stuck', 'She overslept', 'Her bike broke'], answer: 0 },
      { type: 'choice', prompt: "What is 'een pintje'?", options: ['A glass of beer', 'A small bottle of milk', 'A snack'], answer: 0 },
      { type: 'choice', prompt: "'Ik heb daar goesting in' means…", options: ['I fancy that', "I'm tired of that", "I'm cold"], answer: 0 },
    ],
    vocab: [
      { term: 'gij / ge', meaning: 'you (Flemish speech)' },
      { term: 'chocomelk', meaning: 'chocolate milk (Flemish)' },
      { term: 'Komt in orde', meaning: "It'll be taken care of" },
    ],
    slang: [
      { term: 'amai', meaning: 'wow', note: 'Flemish exclamation.' },
      { term: 'zot', meaning: 'crazy', note: "Flemish for 'gek'." },
      { term: 'goesting', meaning: 'desire, appetite', note: "Flemish; 'zin' in the Netherlands." },
      { term: 'pintje', meaning: 'glass of beer', note: "Flemish; 'biertje' in the Netherlands." },
    ],
  },
  {
    id: 'listen.c1.radio-debate',
    level: 'C1',
    kind: 'news',
    title: 'Radio debate: English at university',
    description: 'Should Dutch universities teach in Dutch or English?',
    speakers: [
      { id: 'presenter', name: 'Presenter', voice: 'f' },
      { id: 'professor', name: 'Professor Van Leeuwen', voice: 'm' },
      { id: 'sara', name: 'Sara', voice: 'f' },
    ],
    lines: [
      line('Presenter', 'Steeds meer opleidingen zijn volledig Engelstalig. Is dat een probleem, professor Van Leeuwen?', 'More and more degree programmes are entirely in English. Is that a problem, Professor Van Leeuwen?'),
      line('Professor', 'Het is een risico. Als we alles in het Engels doen, verarmt het Nederlands als wetenschapstaal. Bovendien integreren internationale studenten minder.', "It's a risk. If we do everything in English, Dutch loses ground as a language of science. Moreover, international students integrate less."),
      line('Sara', 'Dat snap ik, maar zonder Engels trekken we geen internationaal talent aan. Het is niet óf-óf; laat studenten gewoon ook Nederlands leren.', "I understand that, but without English we won't attract international talent. It isn't either-or; just let students learn Dutch as well."),
      line('Presenter', 'Een pleidooi voor tweetaligheid dus. Daar laten we het vandaag bij.', "So, a plea for bilingualism. We'll leave it there for today."),
    ],
    questions: [
      { type: 'choice', prompt: "What is the professor's concern?", options: ['Dutch weakens as an academic language', 'Tuition is too expensive', 'Students are lazy'], answer: 0 },
      { type: 'choice', prompt: "What is Sara's position?", options: ["It's not either-or: offer Dutch too", 'Only Dutch should be used', 'Only English should be used'], answer: 0 },
      { type: 'choice', prompt: "'Daar laten we het bij' means…", options: ["We'll leave it there", "We'll continue", 'We disagree'], answer: 0 },
    ],
    vocab: [
      { term: 'verarmen', meaning: 'to become impoverished' },
      { term: 'bovendien', meaning: 'moreover' },
      { term: 'een pleidooi voor', meaning: 'a plea for' },
      { term: 'de tweetaligheid', meaning: 'bilingualism' },
    ],
    slang: [],
  },
];

export function getListeningItem(id: string): ListeningItem | undefined {
  return listeningItems.find((item) => item.id === id);
}
