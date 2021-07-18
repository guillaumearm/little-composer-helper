import { dropRepeats, sort } from 'ramda';

/**
 * Internation notation for musical notes
 *
 * * This 12 notes represents the chromatic scale.
 */
export type Note =
  | 'A'
  | 'A#'
  | 'B'
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#';

export const CHROMATIC_SCALE: Note[] = [
  'A',
  'A#',
  'B',
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
];

const compareNotes = (noteA: Note, noteB: Note): number => {
  if (noteA === noteB) return 0;
  return CHROMATIC_SCALE.indexOf(noteA) < CHROMATIC_SCALE.indexOf(noteB)
    ? -1
    : 1;
};

const sortNotes = (notes: Note[]): Note[] =>
  dropRepeats(sort((a, b) => compareNotes(a, b), notes));

const getNoteIndex = (note: Note): number => {
  return CHROMATIC_SCALE.indexOf(note);
};

/**
 * Take any note and transpose it with the given interval
 * * negative internal means transpose down
 *
 * @example transposeNote('A', 1); // => 'A#'
 * @example transposeNote('A', 2); // => 'B'
 * @example transposeNote('A', -1); // => 'G#'
 * @example transposeNote('A', 12); // => 'A'
 * @example transposeNote('A', 13); // => 'A#'
 * @example transposeNote('C', 7); // => 'G'
 */
export const transposeNote = (note: Note, interval: number): Note => {
  const index = getNoteIndex(note);
  const newIndex = (index + interval) % CHROMATIC_SCALE.length;

  return CHROMATIC_SCALE[
    newIndex < 0 ? CHROMATIC_SCALE.length + newIndex : newIndex
  ];
};

/**
 * Apply a regular note transposition on several notes
 *
 * @example transposeNotes(['C', 'E', 'G'], 2); // => ['D', 'F#', 'A']
 */
export const transposeNotes = (notes: Note[], interval: number): Note[] =>
  notes.map((note) => transposeNote(note, interval));

/**
 * Take a set of notes (usually a musical scale) and change the base of the scale
 * * It will reorder the notes according to the base
 * ! If the base is not present in givenNotes, it will throw an error
 *
 * @example changeBase(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'C'); // => ['C', 'D', 'E', 'F', 'G', 'A', 'B']
 */
export const changeBase = (givenNotes: Note[], newBase: Note): Note[] => {
  const notes = sortNotes(givenNotes);

  const indexFound = notes.indexOf(newBase);
  if (indexFound === -1)
    throw new Error(
      `changeBase: invalid base note ${newBase} for given notes: ${givenNotes}`,
    );

  return [...notes.slice(indexFound), ...notes.slice(0, indexFound)];
};
