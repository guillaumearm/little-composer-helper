import { mapObjIndexed } from 'ramda';
import { debounceTime, distinctUntilChanged, map, merge, Observable, scan, startWith } from 'rxjs';
import { getNoteFromNumber, KeyboardNoteEvent, KeyboardNoteReleaseEvent } from './midi-keyboard';
import { INDEXED_CHROMATIC_SCALE, Note } from './notes';

export const DEFAULT_TIME_TRACKED_NOTES_MAP: TimeTrackedNotesMap = mapObjIndexed(
  () => 0,
  INDEXED_CHROMATIC_SCALE,
);

/**
 * * Tracked Notes
 */
export type TimeTrackedNotesMap = Record<Note, number>;

// * key => note number
// * value => timestamp pressed note (undefined when note is not pressed)
type PressedNotes = Record<number, number | undefined>;

/**
 * Internal notes tracker state
 */
type TrackerState = {
  pressedNotes: PressedNotes; // private
  trackedNotes: TimeTrackedNotesMap; // public
};

const DEFAULT_TRACKER_STATE: TrackerState = {
  pressedNotes: {},
  trackedNotes: DEFAULT_TIME_TRACKED_NOTES_MAP,
};

// payolad = current timestamp
type TickAction = { type: 'tick'; payload: number };
type ResetAction = { type: 'reset' };

type TrackerAction = TickAction | ResetAction | KeyboardNoteEvent | KeyboardNoteReleaseEvent;

// ! side effect here => Date.now
const createTick = (): TickAction => ({
  type: 'tick' as const,
  payload: Date.now(),
});

const createReset = (): ResetAction => ({
  type: 'reset' as const,
});

const trackerReducer = (state: TrackerState, action: TrackerAction): TrackerState => {
  if (action.type === 'note') {
    if (state.pressedNotes[action.payload.number]) {
      // note is already pressed
      return state;
    }

    const pressedNotes = {
      ...state.pressedNotes,
      [action.payload.number]: action.payload.time,
    };

    return { ...state, pressedNotes };
  } else if (action.type === 'note_release') {
    const pressedNotes = {
      ...state.pressedNotes,
      [action.payload.number]: undefined,
    };

    const pressed = state.pressedNotes[action.payload.number];

    if (pressed) {
      const trackedNote = getNoteFromNumber(action.payload.number);
      const addedTime = Math.max(0, action.payload.time - pressed);

      const trackedNotes = {
        ...state.trackedNotes,
        [trackedNote]: state.trackedNotes[trackedNote] + addedTime,
      };

      return { trackedNotes, pressedNotes };
    }

    return { ...state, pressedNotes };
  } else if (action.type === 'tick') {
    const pressedNotes: PressedNotes = mapObjIndexed(time => {
      if (time === undefined) {
        return undefined;
      }
      return action.payload;
    }, state.pressedNotes);

    const trackedNotes: TimeTrackedNotesMap = Object.entries(state.pressedNotes).reduce(
      (trackedNotes, [noteNumber, time]) => {
        if (time === undefined) {
          return trackedNotes;
        }
        const trackedNote = getNoteFromNumber(Number(noteNumber));
        const addedTime = Math.max(0, action.payload - Number(time ?? action.payload));
        return {
          ...trackedNotes,
          [trackedNote]: trackedNotes[trackedNote] + addedTime,
        };
      },
      state.trackedNotes,
    );
    return { pressedNotes, trackedNotes };
  } else if (action.type === 'reset') {
    return DEFAULT_TRACKER_STATE;
  }
  return state;
};

export const getTimeTrackedNotesMap = (
  note$: Observable<KeyboardNoteEvent>,
  noteRelease$: Observable<KeyboardNoteReleaseEvent>,
  tick$: Observable<unknown>, // when tracked times should be refresh (used for long pressed notes)
  reset$: Observable<unknown>, // when time tracked notes map should be reset
): Observable<TimeTrackedNotesMap> => {
  const action$: Observable<TrackerAction> = merge(
    note$,
    noteRelease$,
    tick$.pipe(map(createTick)), // ! side effect here (Date.now)
    reset$.pipe(map(createReset)),
  );

  return action$.pipe(
    scan(trackerReducer, DEFAULT_TRACKER_STATE),
    debounceTime(20),
    map(state => state.trackedNotes),
    startWith(DEFAULT_TRACKER_STATE.trackedNotes),
    distinctUntilChanged(),
  );
};
