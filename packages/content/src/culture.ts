import type { CultureArticle } from '@praat/core';

/** Culture module: the context that explains why Dutch is spoken the way it is. */
export const cultureArticles: CultureArticle[] = [
  {
    id: 'culture.directness',
    topic: 'communication',
    title: 'Direct communication',
    summary: 'Why Dutch people say exactly what they think — and how to handle it.',
    minutes: 4,
    sections: [
      {
        heading: 'Honesty as respect',
        body: "In the Netherlands, saying what you think is a sign of respect: it assumes the other person can handle the truth. 'Dat vind ik geen goed idee' is information, not an insult. People rarely hint — if they don't like something, they'll tell you, and if they don't mention a problem, there probably isn't one.",
      },
      {
        heading: 'Feedback culture',
        body: "At work and in education, feedback is given openly and often, also upwards to managers. A presentation may be met with 'Goed verhaal, maar de cijfers kloppen niet.' The criticism is about the work (de zaak), not about you. Flemish communication tends to be more indirect and diplomatic.",
      },
      {
        heading: 'How to respond',
        body: "Don't take it personally, and be direct back — politely. Useful softeners: 'eigenlijk', 'misschien', 'volgens mij'. Disagreeing is fine if you give a reason: 'Ik ben het er niet mee eens, want…'. And when you ask 'Wat vind je ervan?', expect an honest answer.",
      },
    ],
    keyPhrases: [
      { nl: 'Wat vind je ervan?', en: 'What do you think of it?' },
      { nl: 'Eerlijk gezegd…', en: 'To be honest…' },
      { nl: 'Daar ben ik het niet mee eens.', en: "I don't agree with that." },
    ],
    tryScenarioId: 'social.borrel',
  },
  {
    id: 'culture.cycling',
    topic: 'cycling',
    title: 'Cycling culture',
    summary: 'More bikes than people: the rules, the habits and the unwritten laws of the bike lane.',
    minutes: 4,
    sections: [
      {
        heading: 'A nation on two wheels',
        body: "The Netherlands has more bicycles than inhabitants, and people of all ages cycle to work, school and the shops — in suits, with children on the back, in the rain. Flanders is catching up fast. Cycling isn't a sport here; it's simply how you get around.",
      },
      {
        heading: 'Rules of the road',
        body: "Use the red bike lane (fietspad) and ride on the right. Lights are required after dark, holding a phone while cycling is forbidden, and you signal turns with your arm. Cyclists often have priority, but trams don't stop for anyone. Pedestrians on the bike lane will hear a bell.",
      },
      {
        heading: 'Locks and theft',
        body: "Bike theft is common: use two locks, and lock your bike to something fixed. Never buy a suspiciously cheap second-hand bike — it's probably stolen. Many people ride a deliberately ugly old bike ('omafiets' or 'barrel') for exactly this reason.",
      },
    ],
    keyPhrases: [
      { nl: 'Ik kom met de fiets.', en: "I'm coming by bike." },
      { nl: 'Mijn fiets is gestolen.', en: 'My bike has been stolen.' },
      { nl: 'Mag ik even langs?', en: 'Can I just get past?' },
    ],
  },
  {
    id: 'culture.agenda',
    topic: 'social',
    title: 'The agenda, birthdays and gezelligheid',
    summary: 'How social life is planned, celebrated and enjoyed.',
    minutes: 5,
    sections: [
      {
        heading: 'Plan everything',
        body: "Social life runs on the agenda. Friends schedule dinners weeks ahead, and 'Ik kijk even in mijn agenda' is a normal reply to an invitation. Dropping by unannounced is unusual. Being late? Send a message — even for ten minutes.",
      },
      {
        heading: 'The birthday circle',
        body: "Birthdays are celebrated at home with guests in a circle: coffee and cake first, drinks and snacks later. You shake hands (or kiss friends three times) and congratulate everyone, including the family: 'Gefeliciteerd met je vriendin!'. At work, the birthday person often brings the cake (trakteren).",
      },
      {
        heading: 'Gezelligheid',
        body: "'Gezellig' describes a warm, relaxed, together feeling — a café with candles, a long dinner, a chat with a neighbour. It's a core value. Calling an evening 'heel gezellig' is the highest praise, and 'ongezellig' is a real criticism.",
      },
    ],
    keyPhrases: [
      { nl: 'Ik kijk even in mijn agenda.', en: 'Let me check my calendar.' },
      { nl: 'Gefeliciteerd met je moeder!', en: "Congratulations on your mother's birthday!" },
      { nl: 'Wat gezellig!', en: 'How lovely!' },
    ],
    tryScenarioId: 'social.birthday',
  },
  {
    id: 'culture.humour',
    topic: 'humor',
    title: 'Dutch humour',
    summary: 'Dry, direct, self-mocking — and full of irony.',
    minutes: 4,
    sections: [
      {
        heading: 'Dry and understated',
        body: "Dutch humour is dry and relies on understatement and irony: 'Lekker weertje, hè?' in a storm, 'Niet helemaal handig' for a disaster. A straight face is part of the joke — if you're unsure, look for a small smile.",
      },
      {
        heading: 'Teasing means you belong',
        body: "Friends and colleagues tease each other ('plagen'). If someone jokes about your accent or your bike skills, it usually means you're accepted. The best reply is a joke back — self-mockery is highly valued.",
      },
      {
        heading: 'Neighbours joking about neighbours',
        body: "The Dutch and the Flemish joke about each other: Belgians are teased for being slow, the Dutch for being stingy and loud. Within the Netherlands, regions joke about each other too. It's affectionate — mostly.",
      },
    ],
    keyPhrases: [
      { nl: 'Grapje!', en: 'Just kidding!' },
      { nl: 'Lekker weertje, hè?', en: 'Lovely weather, huh? (ironic)' },
      { nl: 'Het had erger gekund.', en: 'It could have been worse.' },
    ],
  },
  {
    id: 'culture.regions',
    topic: 'regions',
    title: 'Regional differences',
    summary: 'From the Randstad to Limburg, from Groningen to Flanders.',
    minutes: 5,
    sections: [
      {
        heading: 'The Randstad and the rest',
        body: "The Randstad (Amsterdam, Rotterdam, The Hague, Utrecht) is busy, international and fast-talking, with a hard G. Outside it, life is often slower and people switch to English less. Every region is proud of its own identity.",
      },
      {
        heading: 'South and north',
        body: "Brabant and Limburg are known for the soft G, carnival and a 'Burgundian' love of good food and company; people say 'houdoe' for goodbye. In the north, Groningers greet with 'Moi!', and Friesland has its own official language, Frisian (Frysk), taught in schools.",
      },
      {
        heading: 'Flanders',
        body: "In Flanders (northern Belgium) Dutch is the official language too, but it sounds softer and uses different everyday words: 'plezant' (fun), 'goesting' (desire), 'amai' (wow), 'ge/gij' (you). Standard Dutch is understood everywhere, and both varieties are fully correct.",
      },
    ],
    keyPhrases: [
      { nl: 'Moi!', en: 'Hi! (Groningen)' },
      { nl: 'Houdoe!', en: 'Bye! (Brabant)' },
      { nl: 'Amai!', en: 'Wow! (Flanders)' },
    ],
  },
  {
    id: 'culture.traditions',
    topic: 'traditions',
    title: 'Traditions through the year',
    summary: "King's Day, Remembrance, Sinterklaas and New Year's Eve.",
    minutes: 5,
    sections: [
      {
        heading: "Koningsdag (27 April)",
        body: "The king's birthday is a national street party: everyone wears orange, and whole cities become flea markets (vrijmarkt) where children sell old toys. If 27 April is a Sunday, it's celebrated a day earlier.",
      },
      {
        heading: 'Remembrance and Liberation (4 and 5 May)',
        body: 'On 4 May at 20:00 the Netherlands falls silent for two minutes to remember the victims of war. On 5 May, Liberation Day celebrates freedom with festivals across the country.',
      },
      {
        heading: 'Sinterklaas, Christmas and New Year',
        body: "Sinterklaas arrives in mid-November; on 5 December (pakjesavond) families exchange presents and funny poems. Christmas has two days (Eerste and Tweede Kerstdag). On New Year's Eve people eat oliebollen, toast at midnight and wish each other 'Gelukkig nieuwjaar!'. In the south, carnival in February is huge.",
      },
    ],
    keyPhrases: [
      { nl: 'Fijne Koningsdag!', en: "Happy King's Day!" },
      { nl: 'Fijne feestdagen!', en: 'Happy holidays!' },
      { nl: 'Gelukkig nieuwjaar!', en: 'Happy New Year!' },
    ],
  },
  {
    id: 'culture.food',
    topic: 'food',
    title: 'Food: from boterham to borrel',
    summary: 'What, when and how the Dutch and Flemish eat.',
    minutes: 4,
    sections: [
      {
        heading: 'Daily rhythm',
        body: "Breakfast and lunch are often bread: a 'boterham' with cheese, ham or chocolate sprinkles (hagelslag). Lunch at work is quick and simple. Dinner is early — around 18:00 — and the warm meal of the day.",
      },
      {
        heading: 'Classics',
        body: "Stamppot (mashed potatoes with vegetables) and pea soup (erwtensoep) in winter; raw herring in early summer; stroopwafels, liquorice (drop) and poffertjes all year. In Flanders: fries from a frituur, stoofvlees (beef stew) and waffles.",
      },
      {
        heading: 'The borrel',
        body: "A 'borrel' is drinks with snacks — cheese cubes, sausage and bitterballen (crispy fried ragout balls, dipped in mustard). After work on Friday, at birthdays, after a meeting: the borrel is where people relax and connect.",
      },
    ],
    keyPhrases: [
      { nl: 'Eet smakelijk!', en: 'Enjoy your meal!' },
      { nl: 'Proost!', en: 'Cheers!' },
      { nl: 'Een broodje kaas, graag.', en: 'A cheese roll, please.' },
    ],
    tryScenarioId: 'daily.cafe',
  },
  {
    id: 'culture.history',
    topic: 'history',
    title: 'A short history for everyday life',
    summary: 'Water, trade, colonial history and the war — the past that still shapes conversation.',
    minutes: 6,
    sections: [
      {
        heading: 'Living with water',
        body: "About a quarter of the Netherlands lies below sea level. Cooperation to keep the water out shaped the country — some say that's where the 'polder model' of consensus comes from. After the disastrous flood of 1953, the Delta Works were built to protect the south-west.",
      },
      {
        heading: 'The Golden Age — and its dark side',
        body: "In the 17th century the Dutch Republic became a world power through trade, art and science. That wealth was also built on colonialism and the slave trade. On 1 July, Keti Koti commemorates the abolition of slavery in Suriname and the Caribbean in 1863; the Dutch government and the King have formally apologised for the Dutch role in slavery.",
      },
      {
        heading: 'War and remembrance',
        body: 'The German occupation (1940–1945) and the persecution of Jewish citizens, remembered through the story of Anne Frank, remain central to national memory. Belgium, independent since 1830, went through both world wars as a battlefield — and later became a federal state with Dutch-, French- and German-speaking communities.',
      },
    ],
    keyPhrases: [
      { nl: 'Een groot deel van Nederland ligt onder de zeespiegel.', en: 'A large part of the Netherlands lies below sea level.' },
      { nl: 'Op 4 mei herdenken we de oorlogsslachtoffers.', en: 'On 4 May we commemorate the victims of war.' },
    ],
  },
  {
    id: 'culture.work',
    topic: 'work',
    title: 'Work culture',
    summary: 'Flat hierarchies, part-time work and clear boundaries.',
    minutes: 4,
    sections: [
      {
        heading: 'Flat and direct',
        body: "Managers are called by their first name, and everyone is expected to speak up in meetings. Decisions are often made by consensus (polderen), which takes time — but once something is agreed ('afgesproken'), people stick to it.",
      },
      {
        heading: 'Work–life balance',
        body: "Part-time work is more common in the Netherlands than anywhere else in the EU, for men and women. Leaving at 17:00 to pick up children is normal, and evenings and holidays are protected. In Flanders, working hours and hierarchy tend to be a bit more traditional.",
      },
      {
        heading: 'Practical habits',
        body: "Lunch is short, often with your own sandwiches. Birthdays mean you bring cake. 'Daar ga ik niet over' (that's not my call) reflects clear responsibilities. And the Friday borrel is where you build relationships — and practise your Dutch.",
      },
    ],
    keyPhrases: [
      { nl: 'Zeg maar je.', en: "Just call me 'je'." },
      { nl: 'Daar ga ik niet over.', en: "That's not my call." },
      { nl: 'Afgesproken!', en: 'Agreed!' },
    ],
    tryScenarioId: 'work.meeting',
  },
  {
    id: 'culture.housing',
    topic: 'housing',
    title: 'Housing and paperwork',
    summary: 'Finding a home, registering and dealing with official letters.',
    minutes: 5,
    sections: [
      {
        heading: 'A tight housing market',
        body: "There is a serious housing shortage (woningnood), especially in the big cities. Rental viewings attract many candidates, so respond quickly and have your documents ready: ID, employment contract, payslips. Always check what's included in the rent, and never pay anything before seeing the home and signing a contract.",
      },
      {
        heading: 'Registering',
        body: "In the Netherlands you register your address with the municipality (gemeente) and receive a citizen service number (BSN) — needed for work, a bank account, healthcare and a GP. In Belgium you register at the town hall and a local police officer usually checks that you really live at the address.",
      },
      {
        heading: 'Letters and DigiD',
        body: "Much official communication comes by letter or through online accounts (in the Netherlands via DigiD). Official language can be very formal: 'u dient' means 'you must', 'indien' means 'if'. When in doubt, call the number on the letter — or ask a neighbour. Deadlines matter.",
      },
    ],
    keyPhrases: [
      { nl: 'Ik wil me inschrijven op dit adres.', en: 'I want to register at this address.' },
      { nl: 'Is de huur inclusief gas, water en licht?', en: 'Does the rent include gas, water and electricity?' },
    ],
    tryScenarioId: 'living.viewing',
  },
  {
    id: 'culture.switching',
    topic: 'communication',
    title: 'Why people switch to English — and how to keep it Dutch',
    summary: 'Practical ways to get the Dutch practice you need.',
    minutes: 3,
    sections: [
      {
        heading: 'Why it happens',
        body: "Most Dutch people speak excellent English and switch to be helpful and efficient — not to exclude you. In busy places (shops, cafés in Amsterdam) the pressure to be quick makes it even more likely.",
      },
      {
        heading: 'What works',
        body: "Say it upfront and kindly: 'Ik wil graag Nederlands oefenen — mag het in het Nederlands?'. Use Dutch fillers ('even denken…', 'hoe zeg je dat…') instead of stopping. Practise in patient places: the library, the market, your neighbours, language cafés — and here, with your AI partner, before the real thing.",
      },
    ],
    keyPhrases: [
      { nl: 'Ik wil graag Nederlands oefenen.', en: "I'd like to practise my Dutch." },
      { nl: 'Mag het in het Nederlands?', en: 'Can we do it in Dutch?' },
      { nl: 'Hoe zeg je dat in het Nederlands?', en: 'How do you say that in Dutch?' },
    ],
    tryScenarioId: 'social.first-meeting',
  },
  {
    id: 'culture.money',
    topic: 'social',
    title: 'Money: going Dutch',
    summary: 'Splitting bills, bargains and why nobody finds it rude.',
    minutes: 3,
    sections: [
      {
        heading: 'Splitting is normal',
        body: "Paying for your own drink or splitting the bill is completely normal among friends and colleagues. Often one person pays and sends a payment request by app afterwards. Offering to pay for everyone is generous — say 'Ik trakteer!' — but not expected.",
      },
      {
        heading: 'Thrift as a virtue',
        body: "Being 'zuinig' (thrifty) is traditionally seen as sensible, not stingy. People love a bargain ('aanbieding') and aren't embarrassed to mention it. The stereotype of the stingy Dutch is a favourite joke — the Dutch tell it themselves.",
      },
    ],
    keyPhrases: [
      { nl: 'Zullen we het delen?', en: 'Shall we split it?' },
      { nl: 'Ik trakteer!', en: "It's on me!" },
    ],
  },
];

export function getCultureArticle(id: string): CultureArticle | undefined {
  return cultureArticles.find((article) => article.id === id);
}
