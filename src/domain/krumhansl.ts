import { zip } from 'ramda';
import { computeCorrelationCoef } from '../utils/pearson-correlation';
import { rotateLeft } from '../utils/rotate-array';
import { CHROMATIC_SCALE, CHROMATIC_SCALE_BASE_A, Note } from './notes';
import { TimeTrackedNotesMap } from './notes-tracker';

type KeyProfileBase = {
  note: Note;
  mode: 'minor' | 'major';
};

type KeyProfile = KeyProfileBase & {
  structure: number[]; // with 12 values
};

type KeyProfileResult = KeyProfileBase & {
  result: number; // computed pearson coef
};

/**
 * All major key profiles (starting to C)
 */
const C_MAJOR_PROFILE_STRUCTURE = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
];

const MAJOR_KEY_PROFILES: KeyProfile[] = CHROMATIC_SCALE.map((note, i) => ({
  note,
  mode: 'major',
  structure: rotateLeft(C_MAJOR_PROFILE_STRUCTURE, i),
}));

/**
 * All minor key profiles (starting to A)
 */
const A_MINOR_PROFILE_STRUCTURE = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
];

const MINOR_KEY_PROFILES: KeyProfile[] = CHROMATIC_SCALE_BASE_A.map((note, i) => ({
  note,
  mode: 'minor',
  structure: rotateLeft(A_MINOR_PROFILE_STRUCTURE, i),
}));

/**
 * All key profiles (minor and major)
 */
const ALL_KEY_PROFILES: KeyProfile[] = [...MAJOR_KEY_PROFILES, ...MINOR_KEY_PROFILES];

/**
 * 12 chromatic notes starting to C
 * * values represents the duration and order represents the notes
 */
type NoteDurations = number[];

const getNotesDurations = (notesMap: TimeTrackedNotesMap): NoteDurations => {
  return [
    notesMap['C'],
    notesMap['C#'],
    notesMap['D'],
    notesMap['D#'],
    notesMap['E'],
    notesMap['F'],
    notesMap['F#'],
    notesMap['G'],
    notesMap['G#'],
    notesMap['A'],
    notesMap['A#'],
    notesMap['B'],
  ];
};

/**
 * Apply a Krumhansl-Schmuckler key-finding algorithm on a given TimeTrackedNotesMap
 *
 * * more details on http://rnhart.net/articles/key-finding/
 */
export const krumhansl = (notesMap: TimeTrackedNotesMap): KeyProfileResult | null => {
  const notesDurations = getNotesDurations(notesMap);

  return ALL_KEY_PROFILES.reduce((keyProfileResult: KeyProfileResult | null, keyProfile) => {
    const coords = zip(keyProfile.structure, notesDurations);
    const result = computeCorrelationCoef(coords);

    if (result === 0) {
      console.warn('=> zero found !');
      return keyProfileResult;
    }

    if (!keyProfileResult || (keyProfileResult && keyProfileResult.result < result)) {
      return { note: keyProfile.note, mode: keyProfile.mode, result };
    }

    return keyProfileResult;
  }, null);
};

export const getKeyProfileDisplayName = (keyProfile: KeyProfileBase | null): string => {
  if (keyProfile === null) {
    return '?';
  }

  return `${keyProfile.note} ${keyProfile.mode}`;
};
