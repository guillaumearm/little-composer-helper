import { mapObjIndexed } from 'ramda';
import { INDEXED_CHROMATIC_SCALE, Note, orderNotes, transposeNote } from './notes';

/**
 * Represent a musical scale structure (e.g. `major` scale)
 * * `structure` property is an array of intervals in semitone
 */
export type ScaleDefinition = {
  name: string;
  structure: number[];
};

/**
 * Represent a concrete musical scale with the ordered notes (e.g. `C major` scale)
 * * the first note is considered as the base note of the scale
 */
export type Scale = {
  name: string;
  notes: Note[];
};

/**
 * *************************************************************
 * * ******************** UTILITIES ****************************
 ***************************************************************
 */
const getScale = (baseNote: Note, definition: ScaleDefinition): Scale => {
  const notes = definition.structure.reduce(
    (acc, interval) => {
      const lastNote = acc[acc.length - 1];
      acc.push(transposeNote(lastNote, interval));
      return acc;
    },
    [baseNote],
  );

  return {
    name: `${baseNote} ${definition.name}`,
    notes: orderNotes(notes),
  };
};

const getAllScales = (definition: ScaleDefinition): Record<Note, Scale> => {
  return mapObjIndexed(note => getScale(note, definition), INDEXED_CHROMATIC_SCALE);
};

/**
 * *************************************************************
 * * ******************** TONAL HARMONY ************************
 ***************************************************************
 */

// Definitions

export const MAJOR_SCALE: ScaleDefinition = {
  name: 'major',
  structure: [2, 2, 1, 2, 2, 2, 1],
};

// * considered as `natural minor` scale
export const MINOR_SCALE: ScaleDefinition = {
  name: 'minor',
  structure: [2, 1, 2, 2, 1, 2, 2],
};

export const MELODIC_MINOR_SCALE: ScaleDefinition = {
  name: 'melodic minor',
  structure: [2, 1, 2, 2, 2, 2, 1],
};

export const HARMONIC_MINOR_SCALE: ScaleDefinition = {
  name: 'harmonic minor',
  structure: [2, 1, 2, 2, 1, 3, 1],
};

// Musical Scales for tonal system

export const MAJOR_SCALES = getAllScales(MAJOR_SCALE);
export const MINOR_SCALES = getAllScales(MINOR_SCALE);
export const MELODIC_MINOR_SCALES = getAllScales(MELODIC_MINOR_SCALE);
export const HARMONIC_MINOR_SCALES = getAllScales(HARMONIC_MINOR_SCALE);

/**
 * *************************************************************
 * * ******************** MODAL HARMONY ************************
 ***************************************************************
 */
// TODO

/**
 * *************************************************************
 * * ******************** ALL SCALES ***************************
 ***************************************************************
 */
export const ALL_AVAILABLE_SCALES = [
  ...Object.values(MAJOR_SCALES),
  ...Object.values(MINOR_SCALES),
  ...Object.values(MELODIC_MINOR_SCALES),
  ...Object.values(HARMONIC_MINOR_SCALES),
];
