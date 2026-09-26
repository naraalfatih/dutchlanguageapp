import type { SoundModule } from '@praat/core';

/**
 * Pronunciation Coach modules. Priority reflects impact on intelligibility
 * (1 = most important), following the "intelligibility over accent" principle.
 */
export const sounds: SoundModule[] = [
  {
    id: 'g',
    title: 'The G (and CH)',
    spelling: ['g', 'ch'],
    ipa: '/ɣ/ ~ /x/',
    howTo:
      "Raise the back of your tongue towards the soft palate — where you say 'k' — but don't close it. Push air through the narrow gap: a gentle rasp. For most speakers in the north, G and CH sound the same.",
    englishHint:
      "Like the 'ch' in Scottish 'loch' or German 'Bach'. Never the 'g' in English 'go' (Dutch only uses that in loanwords like 'goal').",
    commonMistakes: [
      "Using the English 'g' of 'go': 'goed' then sounds like English 'good'.",
      "Saying 'h': 'goed' (good) becomes 'hoed' (hat)!",
      "Saying 'k': 'goud' (gold) becomes 'koud' (cold).",
    ],
    minimalPairs: [
      { a: { nl: 'goed', en: 'good' }, b: { nl: 'hoed', en: 'hat' }, contrast: 'G vs H' },
      { a: { nl: 'goud', en: 'gold' }, b: { nl: 'koud', en: 'cold' }, contrast: 'G vs K' },
      { a: { nl: 'graag', en: 'gladly' }, b: { nl: 'kraag', en: 'collar' }, contrast: 'G vs K' },
      { a: { nl: 'gaat', en: 'goes' }, b: { nl: 'haat', en: 'hate' }, contrast: 'G vs H' },
    ],
    practice: [
      { nl: 'Goedemorgen!', en: 'Good morning!' },
      { nl: 'Graag gedaan.', en: "You're welcome." },
      { nl: 'Ik ga morgen naar Groningen.', en: "I'm going to Groningen tomorrow." },
      { nl: 'Lachen is gezond.', en: 'Laughing is healthy.' },
    ],
    regionalNote:
      "In Brabant, Limburg and Flanders the 'soft g' is made further forward and sounds smoother, almost like a voiced hiss. Both are correct; northern speakers have the harder, scrapier G.",
    priority: 1,
  },
  {
    id: 'ui',
    title: 'UI',
    spelling: ['ui'],
    ipa: '/œy/',
    howTo:
      "Start from the vowel in English 'bird' with rounded lips, then glide towards a rounded 'uu'. Keep your lips rounded the whole time.",
    englishHint:
      "Somewhere between the 'ow' in 'house' and the 'oy' in 'boy' — but with rounded, pouted lips. It's the most famous Dutch sound for a reason.",
    commonMistakes: [
      "Saying 'ow' as in 'house': 'huis' then sounds like English 'house'.",
      "Saying 'oo-ee': 'uit' like 'oo-it'.",
      "Mixing it up with IJ/EI: 'ruim' (spacious) vs 'rijm' (rhyme).",
    ],
    minimalPairs: [
      { a: { nl: 'huis', en: 'house' }, b: { nl: 'hoes', en: 'cover' }, contrast: 'UI vs OE' },
      { a: { nl: 'ruim', en: 'spacious' }, b: { nl: 'rijm', en: 'rhyme' }, contrast: 'UI vs IJ' },
      { a: { nl: 'buit', en: 'loot' }, b: { nl: 'bijt', en: 'bites' }, contrast: 'UI vs IJ' },
      { a: { nl: 'muis', en: 'mouse' }, b: { nl: 'mus', en: 'sparrow' }, contrast: 'UI vs U' },
      { a: { nl: 'kuil', en: 'pit' }, b: { nl: 'koel', en: 'cool' }, contrast: 'UI vs OE' },
    ],
    practice: [
      { nl: 'Ik ga naar huis.', en: "I'm going home." },
      { nl: 'Ik kom uit Duitsland.', en: "I'm from Germany." },
      { nl: 'Het huis is ruim en licht.', en: 'The house is spacious and light.' },
      { nl: 'Buiten is het koud.', en: "It's cold outside." },
    ],
    priority: 1,
  },
  {
    id: 'vowel-length',
    title: 'Short vs long vowels',
    spelling: ['a / aa', 'e / ee', 'o / oo', 'i / ie'],
    ipa: '/ɑ/–/aː/, /ɛ/–/eː/, /ɔ/–/oː/, /ɪ/–/i/',
    howTo:
      "Long vowels are held and pure: 'aa' as in 'father', 'ee' close to 'hay' without the y-glide, 'oo' close to 'go' without the w-glide. Short vowels are quick and relaxed. Spelling: a double vowel (maan) or a single vowel at the end of a syllable (ma-nen) is long.",
    englishHint: "English speakers tend to add a glide to ee and oo ('tway', 'go-w'). Keep Dutch long vowels steady.",
    commonMistakes: [
      "Making short vowels long: 'man' sounds like 'maan' (moon).",
      "Gliding long vowels: 'twee' sounds like 'tway'.",
    ],
    minimalPairs: [
      { a: { nl: 'man', en: 'man' }, b: { nl: 'maan', en: 'moon' }, contrast: 'A vs AA' },
      { a: { nl: 'zon', en: 'sun' }, b: { nl: 'zoon', en: 'son' }, contrast: 'O vs OO' },
      { a: { nl: 'pen', en: 'pen' }, b: { nl: 'peen', en: 'carrot' }, contrast: 'E vs EE' },
      { a: { nl: 'bom', en: 'bomb' }, b: { nl: 'boom', en: 'tree' }, contrast: 'O vs OO' },
      { a: { nl: 'vis', en: 'fish' }, b: { nl: 'vies', en: 'dirty' }, contrast: 'I vs IE' },
    ],
    practice: [
      { nl: 'Mijn zoon speelt in de zon.', en: 'My son is playing in the sun.' },
      { nl: 'Ik heb twee katten.', en: 'I have two cats.' },
      { nl: 'De maan is mooi vanavond.', en: 'The moon is beautiful tonight.' },
    ],
    priority: 1,
  },
  {
    id: 'eu',
    title: 'EU',
    spelling: ['eu'],
    ipa: '/øː/',
    howTo:
      "Say 'ee' (like 'hay' without the glide), keep your tongue exactly there, and round your lips as if to whistle. Hold it steady — it's a long vowel.",
    englishHint: "Like French 'deux' or German 'schön'. Not like the 'you' in English 'Europe'.",
    commonMistakes: [
      "Saying 'oo': 'deur' (door) becomes 'door' (through)!",
      "Saying 'yoo' as in English 'Europe'.",
    ],
    minimalPairs: [
      { a: { nl: 'deur', en: 'door' }, b: { nl: 'door', en: 'through' }, contrast: 'EU vs OO' },
      { a: { nl: 'beuk', en: 'beech tree' }, b: { nl: 'boek', en: 'book' }, contrast: 'EU vs OE' },
      { a: { nl: 'reus', en: 'giant' }, b: { nl: 'Rus', en: 'Russian' }, contrast: 'EU vs U' },
      { a: { nl: 'keus', en: 'choice' }, b: { nl: 'koos', en: 'chose' }, contrast: 'EU vs OO' },
    ],
    practice: [
      { nl: 'Doe de deur dicht.', en: 'Close the door.' },
      { nl: 'Wat een leuke keuken!', en: 'What a nice kitchen!' },
      { nl: 'Mijn neus loopt.', en: 'My nose is running.' },
    ],
    priority: 2,
  },
  {
    id: 'ij',
    title: 'IJ / EI',
    spelling: ['ij', 'ei'],
    ipa: '/ɛi/',
    howTo: "Start with the 'e' of 'bed', mouth fairly open, and glide briefly towards 'ee'. IJ and EI are exactly the same sound.",
    englishHint:
      "Close to 'ay' in 'day' but more open — a cross between 'day' and 'die'. Not the 'eye' sound of English 'my'.",
    commonMistakes: [
      "Saying English 'eye': 'mijn' sounds like English 'mine'.",
      "Saying a long 'ee': 'wijs' (wise) becomes 'wees' (orphan).",
    ],
    minimalPairs: [
      { a: { nl: 'mijn', en: 'my' }, b: { nl: 'meen', en: '(I) mean' }, contrast: 'IJ vs EE' },
      { a: { nl: 'wijs', en: 'wise' }, b: { nl: 'wees', en: 'orphan' }, contrast: 'IJ vs EE' },
      { a: { nl: 'rijm', en: 'rhyme' }, b: { nl: 'ruim', en: 'spacious' }, contrast: 'IJ vs UI' },
    ],
    practice: [
      { nl: 'Mijn fiets is kapot.', en: 'My bike is broken.' },
      { nl: 'Ik blijf thuis.', en: "I'm staying home." },
      { nl: 'Het is tijd voor een kopje thee.', en: "It's time for a cup of tea." },
    ],
    regionalNote: "In The Hague and parts of Flanders IJ can sound like a long, flat 'è'.",
    priority: 2,
  },
  {
    id: 'oe',
    title: 'OE',
    spelling: ['oe'],
    ipa: '/u/',
    howTo: "Round your lips tightly and say a short 'oo' as in 'food' — shorter, and without gliding.",
    englishHint: "Like 'oo' in 'food'. OE is one sound, never 'o' + 'e'.",
    commonMistakes: [
      "Reading it as two vowels: 'boek' as 'bo-ek'.",
      "Mixing it up with UU: 'boer' (farmer) vs 'buur' (neighbour).",
    ],
    minimalPairs: [
      { a: { nl: 'boer', en: 'farmer' }, b: { nl: 'buur', en: 'neighbour' }, contrast: 'OE vs UU' },
      { a: { nl: 'voer', en: '(animal) feed' }, b: { nl: 'vuur', en: 'fire' }, contrast: 'OE vs UU' },
      { a: { nl: 'koek', en: 'biscuit, cake' }, b: { nl: 'kook', en: '(I) cook' }, contrast: 'OE vs OO' },
    ],
    practice: [
      { nl: 'Goedemorgen!', en: 'Good morning!' },
      { nl: 'Ik lees een boek.', en: "I'm reading a book." },
      { nl: 'Hoe gaat het met je moeder?', en: "How's your mother?" },
    ],
    priority: 2,
  },
  {
    id: 'uu',
    title: 'U / UU',
    spelling: ['u', 'uu'],
    ipa: '/y/, /ʏ/',
    howTo:
      "Say 'ee' as in 'see', then round your lips tightly without moving your tongue — that's UU. The short U (in 'bus') is more relaxed.",
    englishHint: "Like French 'tu' or German 'ü'. There is no English equivalent.",
    commonMistakes: [
      "Saying 'oo': 'buur' (neighbour) becomes 'boer' (farmer).",
      "Saying 'yoo' as in English 'use'.",
    ],
    minimalPairs: [
      { a: { nl: 'vuur', en: 'fire' }, b: { nl: 'voer', en: '(animal) feed' }, contrast: 'UU vs OE' },
      { a: { nl: 'muur', en: 'wall' }, b: { nl: 'moer', en: 'nut (for a bolt)' }, contrast: 'UU vs OE' },
      { a: { nl: 'duur', en: 'expensive' }, b: { nl: 'door', en: 'through' }, contrast: 'UU vs OO' },
    ],
    practice: [
      { nl: 'Het is drie uur.', en: "It's three o'clock." },
      { nl: 'Mijn buurman is heel aardig.', en: 'My neighbour is very nice.' },
      { nl: 'Dat is te duur.', en: "That's too expensive." },
    ],
    priority: 2,
  },
  {
    id: 'sch',
    title: 'SCH',
    spelling: ['sch'],
    ipa: '/sx/',
    howTo:
      "Say 's', then immediately the Dutch G/CH sound: s + ch. At the end of a word ('-isch') it's just 's': 'praktisch' sounds like 'praktis'.",
    englishHint: "There is no 'sk' like English 'school': Dutch 'school' = s + ch + ool.",
    commonMistakes: ["Saying 'sk': 'school' like English 'school'.", "Saying 'sh': 'schoen' like 'shoon'."],
    minimalPairs: [
      { a: { nl: 'schoen', en: 'shoe' }, b: { nl: 'zoen', en: 'kiss' }, contrast: 'SCH vs Z' },
      { a: { nl: 'schaal', en: 'bowl; scale' }, b: { nl: 'staal', en: 'steel' }, contrast: 'SCH vs ST' },
    ],
    practice: [
      { nl: 'Ik ga naar school.', en: "I'm going to school." },
      { nl: 'Waar zijn mijn schoenen?', en: 'Where are my shoes?' },
      { nl: 'Scheveningen ligt aan zee.', en: 'Scheveningen is by the sea.' },
      { nl: 'Dat is heel praktisch.', en: "That's very practical." },
    ],
    regionalNote: "Place names like Scheveningen are a classic test: native speakers say the 'sch' effortlessly.",
    priority: 2,
  },
  {
    id: 'ou',
    title: 'OU / AU',
    spelling: ['ou', 'au'],
    ipa: '/ʌu/',
    howTo: "Start with a short, open vowel (like the 'o' in British 'hot', but more open), then glide towards 'oe' with rounded lips. OU and AU are the same sound.",
    englishHint: "Similar to 'ow' in 'how', starting from a more rounded position.",
    commonMistakes: [
      "Mixing it up with UI: 'zout' (salt) and 'zuid' (south) are different words.",
      "Saying 'oh': 'koud' like English 'code'.",
    ],
    minimalPairs: [
      { a: { nl: 'zout', en: 'salt' }, b: { nl: 'zuid', en: 'south' }, contrast: 'OU vs UI' },
      { a: { nl: 'hout', en: 'wood' }, b: { nl: 'huid', en: 'skin' }, contrast: 'OU vs UI' },
    ],
    practice: [
      { nl: 'Het is koud buiten.', en: "It's cold outside." },
      { nl: 'Ik hou van kaas.', en: 'I love cheese.' },
      { nl: 'Dat is fout, sorry!', en: "That's wrong, sorry!" },
    ],
    priority: 3,
  },
  {
    id: 'r',
    title: 'R',
    spelling: ['r'],
    ipa: '/r/ ~ /ʀ/ ~ /ɹ/',
    howTo:
      "Dutch has several R's and all are correct: a rolled tongue-tip R, a uvular R in the throat (as in French), and — at the end of a syllable in much of the Netherlands — a soft, English-like R. Choose one that feels comfortable, and make sure it's clearly audible at the start of words.",
    englishHint: "At the start of a word, avoid the English R: try a quick tap of the tongue tip (like the 'tt' in American 'butter') or a French throat R.",
    commonMistakes: [
      "Using the English R at the start of words — Dutch ears may hear a W: 'rood' (red) sounds like 'wood'.",
      "Swallowing the R between vowels: 'waarom' becomes 'waa-om'.",
    ],
    minimalPairs: [
      { a: { nl: 'rood', en: 'red' }, b: { nl: 'lood', en: 'lead (metal)' }, contrast: 'R vs L' },
      { a: { nl: 'rijk', en: 'rich' }, b: { nl: 'lijk', en: 'corpse' }, contrast: 'R vs L' },
      { a: { nl: 'rat', en: 'rat' }, b: { nl: 'wat', en: 'what' }, contrast: 'R vs W' },
    ],
    practice: [
      { nl: 'Ik rijd naar Rotterdam.', en: "I'm driving to Rotterdam." },
      { nl: 'Waarom regent het altijd?', en: 'Why does it always rain?' },
      { nl: 'De trein vertrekt om drie uur.', en: 'The train leaves at three.' },
    ],
    regionalNote:
      "The throaty (uvular) R is typical of the Randstad; the rolled R is common in the east, the north and Flanders; the soft English-like R at the end of syllables is spreading among younger speakers.",
    priority: 3,
  },
  {
    id: 'w',
    title: 'W',
    spelling: ['w'],
    ipa: '/ʋ/',
    howTo:
      "Touch your upper teeth lightly to your lower lip — as for 'v' — but let the air flow without friction or buzzing. It sits between English 'v' and 'w'.",
    englishHint: "Not the rounded English 'w' of 'water', and not a full 'v'. In Flanders and the south it is closer to the English 'w'.",
    commonMistakes: ["Using a rounded English 'w': 'wat' sounds English.", "Making it a hard 'v': 'wie' becomes 'vie'."],
    minimalPairs: [
      { a: { nl: 'wee', en: 'pain, woe' }, b: { nl: 'vee', en: 'cattle' }, contrast: 'W vs V' },
      { a: { nl: 'wel', en: 'well; indeed' }, b: { nl: 'vel', en: 'sheet; skin' }, contrast: 'W vs V' },
    ],
    practice: [
      { nl: 'Wat wil je drinken?', en: 'What would you like to drink?' },
      { nl: 'Waar woon je?', en: 'Where do you live?' },
      { nl: 'Het water is warm.', en: 'The water is warm.' },
    ],
    priority: 3,
  },
];

export function getSound(id: string): SoundModule | undefined {
  return sounds.find((s) => s.id === id);
}
