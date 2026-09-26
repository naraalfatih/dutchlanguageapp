import { describe, expect, it } from 'vitest';
import { detectMistakes } from '../src/language/detector.js';

function fix(text: string, options = {}) {
  return detectMistakes(text, options);
}

function patterns(text: string, options = {}) {
  return fix(text, options).corrections.map((c) => c.patternId);
}

function corrected(text: string, options = {}) {
  return fix(text, options).correctedText;
}

describe('detectMistakes: meaning and vocabulary', () => {
  it("explains 'Ik ben heet' as in the product brief", () => {
    const result = fix('Ik ben heet Amira.');
    expect(result.corrections).toHaveLength(1);
    const [c] = result.corrections;
    expect(c!.patternId).toBe('heten');
    expect(c!.severity).toBe('meaning');
    expect(c!.explanation).toContain("People understand you");
    expect(c!.explanation).toContain("I am hot (temperature)");
    expect(c!.corrected).toBe('Ik heet Amira.');
  });

  it("treats a bare 'Ik ben heet' as feeling hot", () => {
    expect(corrected('Ik ben heet.')).toBe('Ik heb het warm.');
  });

  it("fixes 'Mijn naam heet'", () => {
    expect(corrected('Mijn naam heet Tom.')).toBe('Mijn naam is Tom.');
  });

  it('fixes age with hebben', () => {
    expect(corrected('Ik heb 20 jaar.')).toBe('Ik ben 20 jaar.');
    expect(corrected('Hij heeft vijfentwintig jaar.')).toBe('Hij is vijfentwintig jaar.');
    expect(corrected('Hoeveel jaar heb je?')).toBe('Hoe oud ben je?');
    expect(patterns('Ik ben 20 jaar oud.')).toEqual([]);
  });

  it('fixes feeling cold and warm', () => {
    expect(corrected('Ik ben koud.')).toBe('Ik heb het koud.');
    expect(corrected('Ik heb warm.')).toBe('Ik heb het warm.');
    expect(corrected('Ben je koud?')).toBe('Heb je het koud?');
    expect(patterns('Het eten is koud.')).toEqual([]);
    expect(patterns('Ik heb het koud.')).toEqual([]);
  });

  it('fixes hunger and thirst', () => {
    expect(corrected('Ik ben honger.')).toBe('Ik heb honger.');
    expect(corrected('Ik ben erg dorstig.')).toBe('Ik heb erg dorst.');
    expect(patterns('Zijn honger was groot.')).toEqual([]);
  });
});

describe('detectMistakes: word order', () => {
  it('fixes V2 after a fronted time expression', () => {
    expect(corrected('Morgen ik ga naar Amsterdam.')).toBe('Morgen ga ik naar Amsterdam.');
    expect(corrected('In het weekend wij spelen voetbal.')).toBe('In het weekend spelen wij voetbal.');
    expect(corrected('Deze week ik werk thuis.')).toBe('Deze week werk ik thuis.');
  });

  it('drops the -t when jij follows after inversion', () => {
    expect(corrected('Morgen jij werkt thuis.')).toBe('Morgen werk jij thuis.');
  });

  it('does not flag correct V2 or unrelated sentences', () => {
    expect(patterns('Morgen ga ik naar Amsterdam.')).toEqual([]);
    expect(patterns('Dit is wat ik wil.')).toEqual([]);
    expect(patterns('Maar ik ga morgen.')).toEqual([]);
    expect(patterns('Morgen ik niet.')).toEqual([]);
  });

  it('sends the verb to the end after omdat/dat', () => {
    expect(corrected('Ik blijf thuis omdat ik ben moe.')).toBe('Ik blijf thuis omdat ik moe ben.');
    expect(corrected('Ik denk dat hij is ziek.')).toBe('Ik denk dat hij ziek is.');
    expect(corrected('Ik weet niet of ik heb tijd.')).toBe('Ik weet niet of ik tijd heb.');
    expect(corrected('Ik vind dat het is een goed idee.')).toBe('Ik vind dat het een goed idee is.');
  });

  it("keeps normal order after 'want' and flags verb-final after want", () => {
    expect(patterns('Ik blijf thuis, want ik ben moe.')).toEqual([]);
    expect(corrected('Ik blijf thuis, want ik moe ben.')).toBe('Ik blijf thuis, want ik ben moe.');
  });

  it('does not touch complex or already correct subordinate clauses', () => {
    expect(patterns('Ik blijf thuis omdat ik moe ben.')).toEqual([]);
    expect(patterns('Als je wil kan je komen.')).toEqual([]);
    expect(patterns('Het boek dat ik lees is mooi.')).toEqual([]);
  });

  it('moves the infinitive to the end', () => {
    expect(corrected('Mag ik hebben een koffie?')).toBe('Mag ik een koffie hebben?');
    expect(corrected('Ik wil kopen een fiets.')).toBe('Ik wil een fiets kopen.');
    expect(corrected('Ik heb honger, ik wil eten een broodje.')).toBe('Ik heb honger, ik wil een broodje eten.');
    expect(patterns('Ik wil een fiets kopen.')).toEqual([]);
    expect(patterns('Ik ga slapen.')).toEqual([]);
  });

  it("wraps 'nodig' around the object", () => {
    expect(corrected('Ik heb nodig een pen.')).toBe('Ik heb een pen nodig.');
    expect(patterns('Ik heb het niet nodig.')).toEqual([]);
  });

  it('splits separable verbs in main clauses only', () => {
    expect(corrected('Ik opsta om zeven uur.')).toBe('Ik sta om zeven uur op.');
    expect(corrected('Ik opbel je morgen.')).toBe('Ik bel je morgen op.');
    expect(patterns('Ik weet dat hij vroeg opstaat.')).toEqual([]);
  });
});

describe('detectMistakes: verbs', () => {
  it('uses zijn with movement verbs', () => {
    expect(corrected('Ik heb naar huis gegaan.')).toBe('Ik ben naar huis gegaan.');
    expect(corrected('Wij hebben in Parijs geweest.')).toBe('Wij zijn in Parijs geweest.');
    expect(patterns('Ik heb mijn vriend gevraagd waar hij is geweest.')).toEqual([]);
  });

  it('uses hebben with activity verbs', () => {
    expect(corrected('Ik ben gisteren lang gewerkt.')).toBe('Ik heb gisteren lang gewerkt.');
    expect(patterns('Hij is gebeld door de dokter.')).toEqual([]);
    expect(patterns('Zijn vader heeft gewerkt.')).toEqual([]);
  });

  it('fixes agreement of zijn and hebben', () => {
    expect(corrected('Ik heeft een broer.')).toBe('Ik heb een broer.');
    expect(corrected('Jij ben erg aardig.')).toBe('Jij bent erg aardig.');
    expect(corrected('We is blij.')).toBe('We zijn blij.');
    expect(corrected('Hij heb een hond.')).toBe('Hij heeft een hond.');
    expect(patterns('Ben jij moe?')).toEqual([]);
  });

  it('drops -t before jij/je in questions', () => {
    expect(corrected('Waar woont jij?')).toBe('Waar woon jij?');
    expect(corrected('Werkt je hier?')).toBe('Werk je hier?');
    expect(patterns('Werkt u hier?')).toEqual([]);
    expect(patterns('Hoe gaat je werk?')).toEqual([]);
    expect(patterns('Wat vindt je moeder?')).toEqual([]);
  });
});

describe('detectMistakes: noun phrases', () => {
  it('fixes de/het', () => {
    expect(corrected('De huis is groot.')).toBe('Het huis is groot.');
    expect(corrected('Ik heb het fiets.')).toBe('Ik heb de fiets.');
    expect(fix('De meisje speelt.').corrections[0]!.explanation).toContain('-je');
    expect(patterns('Het huis is groot.')).toEqual([]);
    expect(patterns('De huizen zijn groot.')).toEqual([]);
  });

  it('fixes demonstratives and ons/onze', () => {
    expect(corrected('Deze huis is mooi.')).toBe('Dit huis is mooi.');
    expect(corrected('Ik vind dit fiets mooi.')).toBe('Ik vind deze fiets mooi.');
    expect(corrected('Onze huis is klein.')).toBe('Ons huis is klein.');
    expect(corrected('Ik fiets elk dag.')).toBe('Ik fiets elke dag.');
  });

  it('fixes adjective endings', () => {
    expect(corrected('Ze woont in een grote huis.')).toBe('Ze woont in een groot huis.');
    expect(corrected('Ik heb een nieuw fiets.')).toBe('Ik heb een nieuwe fiets.');
    expect(corrected('De mooi fiets is weg.')).toBe('De mooie fiets is weg.');
    expect(patterns('Het is een groot huis.')).toEqual([]);
    expect(patterns('Ik heb een nieuwe fiets.')).toEqual([]);
  });

  it('reports both article and adjective when both are wrong', () => {
    const result = fix('Ik zie de groot huis.');
    expect(result.corrections.map((c) => c.patternId).sort()).toEqual(['adjective-e', 'de-het']);
    expect(result.correctedText).toBe('Ik zie het grote huis.');
  });

  it("does not treat object pronoun 'het' as an article", () => {
    expect(patterns('Ik vind het mooi weer.')).toEqual([]);
    expect(patterns('Ik vind het tijd om te gaan.')).toEqual([]);
  });
});

describe('detectMistakes: other patterns', () => {
  it('uses geen instead of niet een', () => {
    expect(corrected('Ik heb niet een auto.')).toBe('Ik heb geen auto.');
    expect(corrected('Ik heb niet tijd.')).toBe('Ik heb geen tijd.');
    expect(patterns('Ik heb het niet gedaan.')).toEqual([]);
  });

  it('uses object pronouns after prepositions', () => {
    expect(corrected('Hoe gaat het met jij?')).toBe('Hoe gaat het met jou?');
    expect(corrected('Dit is voor hij.')).toBe('Dit is voor hem.');
    expect(patterns('Ik bel je voor ik ga.')).toEqual([]);
  });

  it('keeps units singular after numbers', () => {
    expect(corrected('Ik ben twintig jaren oud.')).toBe('Ik ben twintig jaar oud.');
    expect(corrected('Het kost tien euros.')).toBe('Het kost tien euro.');
  });

  it("uses 'al' for ongoing duration", () => {
    expect(corrected('Ik woon in Utrecht sinds twee jaar.')).toBe('Ik woon al twee jaar in Utrecht.');
    expect(corrected('Ik leer Nederlands voor drie maanden.')).toBe('Ik leer al drie maanden Nederlands.');
    expect(patterns('Ik ben hier voor twee weken.')).toEqual([]);
    expect(patterns('Ik woon hier sinds 2022.')).toEqual([]);
  });

  it("flags 'Ik ben goed' as an answer but not 'goed in'", () => {
    expect(corrected('Ik ben goed, en jij?')).toBe('Het gaat goed, en jij?');
    expect(patterns('Ik ben goed in voetbal.')).toEqual([]);
  });

  it('flags common anglicisms', () => {
    expect(patterns('Dat maakt zin.')).toEqual(['anglicism']);
    expect(corrected('Dat maakt geen zin.')).toBe('Dat slaat nergens op.');
    expect(patterns('Het maakt niet uit.')).toEqual([]);
  });
});

describe('detectMistakes: register', () => {
  it('suggests u in formal situations', () => {
    const result = fix('Kun je mij helpen?', { register: 'formal' });
    expect(result.corrections[0]!.patternId).toBe('register-formal');
    expect(result.corrections[0]!.corrected).toBe('Kunt u mij helpen?');
    expect(fix('Wat is je naam?', { register: 'formal' }).corrections[0]!.corrected).toBe('Wat is uw naam?');
  });

  it('notes u among friends', () => {
    expect(patterns('Hoe gaat het met u?', { register: 'informal' })).toEqual(['register-formal']);
    expect(patterns('Hoe gaat het met je?', { register: 'informal' })).toEqual([]);
  });
});

describe('detectMistakes: correct Dutch stays untouched', () => {
  const correctSentences = [
    'Hallo, ik heet Sanne en ik woon in Utrecht.',
    'Ik ga elke dag met de fiets naar mijn werk.',
    'Heb je zin om vanavond iets te drinken?',
    'Het was heel gezellig gisteren!',
    'Mag ik een koffie, alsjeblieft?',
    'Kan ik met de pinpas betalen?',
    'Ik ben gisteren naar de markt gegaan.',
    'We hebben lekker gegeten.',
    'Ik woon al drie jaar in Nederland.',
    'Ik denk dat het een goed idee is.',
    'Zullen we morgen afspreken?',
    'Dat klopt, ik heb geen tijd.',
    'Hoe gaat het met jou?',
    'Ik vind het leuk dat je er bent.',
    'Kunt u mij helpen, alstublieft?',
    'Toen ik jong was, woonde ik in Gent.',
    'Mijn zus is dertig jaar.',
    'Het kleine meisje heeft een rode fiets.',
    'Ik moet om acht uur op mijn werk zijn.',
    'Nee hoor, dat is geen probleem.',
  ];
  it.each(correctSentences)('%s', (sentence) => {
    expect(fix(sentence).corrections).toEqual([]);
  });
});
