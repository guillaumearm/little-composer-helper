import WebMidi, {
  IEventNote,
  Input,
  InputEventNoteoff,
  InputEventNoteon,
  WebMidiEventConnected,
  WebMidiEventDisconnected,
} from 'webmidi';
import {
  Observable,
  of,
  merge,
  concat,
  NEVER,
  ignoreElements,
  switchMap,
  map,
  finalize,
  filter,
  distinctUntilChanged,
  startWith,
  pairwise,
  scan,
} from 'rxjs';

import { CHROMATIC_SCALE_BASE_C, INDEXED_CHROMATIC_SCALE, isValidNote, Note } from './notes';
import { times, mapObjIndexed, indexBy } from 'ramda';

export type MidiNote = {
  /** The usual note name (C, C#, D, D#, etc.). */
  note: Note;

  /** The MIDI note number. */
  number: number;

  /** The octave (between -2 and 8). */
  octave: number;

  /** timestamp in ms to indicate when the event occurs */
  time: number;
};

// ! side effect (usage of Date.now)
const createMidiNote = ({ name, number, octave }: IEventNote): MidiNote => {
  const note = name;
  const time = Date.now(); // ! side effect here

  if (!isValidNote(note)) {
    throw new Error('toMidiNote: invalidNote provided');
  }

  return {
    note,
    number,
    octave,
    time,
  };
};

const enableWebMidi = (): Promise<true> =>
  new Promise((res, rej) => {
    WebMidi.enable(function (err) {
      if (err) {
        rej(err);
        return;
      }
      res(true);
    });
  });

const observeConnected = () =>
  new Observable<WebMidiEventConnected>(obs => {
    const listener = function (e: WebMidiEventConnected) {
      obs.next(e);
    };

    WebMidi.addListener('connected', listener);

    return () => {
      WebMidi.removeListener('connected', listener);
    };
  });

const observeDisconnected = () =>
  new Observable<WebMidiEventDisconnected>(obs => {
    const listener = function (e: WebMidiEventDisconnected) {
      obs.next(e);
    };

    WebMidi.addListener('disconnected', listener);

    return () => {
      WebMidi.removeListener('disconnected', listener);
    };
  });

const observeMidiKeyboardInput = (): Observable<Input | undefined> => {
  const webMidiEnabled$ = of(true).pipe(
    switchMap(() => enableWebMidi()),
    ignoreElements(),
  );

  const initialMidiInput$ = of(true).pipe(map((): Input | undefined => WebMidi.inputs[0]));

  const activity$ = merge(observeConnected(), observeDisconnected()).pipe(
    filter(e => e.port.type === 'input'),
    map(e => {
      if (e.type === 'disconnected') {
        return undefined;
      }
      return WebMidi.inputs.find(i => i.id === e.port.id);
    }),
    distinctUntilChanged(),
  );

  return concat(webMidiEnabled$, initialMidiInput$, activity$).pipe(
    finalize(() => {
      setTimeout(() => {
        WebMidi.disable();
      }, 0);
    }),
  );
};

const observeMidiNotesOn = (input: Input) =>
  new Observable<MidiNote>(obs => {
    function listener(noteEvent: InputEventNoteon) {
      const note = noteEvent.note;
      obs.next(createMidiNote(note));
    }

    input.addListener('noteon', 'all', listener);

    return () => {
      input.removeListener('noteon', 'all', listener);
      obs.complete(); // TODO: check if useful
    };
  });

const observeMidiNotesOff = (input: Input) =>
  new Observable<MidiNote>(obs => {
    function listener(noteEvent: InputEventNoteoff) {
      const note = noteEvent.note;
      obs.next(createMidiNote(note));
    }

    input.addListener('noteoff', 'all', listener);

    return () => {
      input.removeListener('noteoff', 'all', listener);
      obs.complete(); // TODO: check if useful
    };
  });

export type KeyboardConnectionEvent = {
  type: 'connected' | 'disconnected';
  payload: string; // name of the device
};

export type KeyboardNoteEvent = {
  type: 'note';
  payload: MidiNote;
};

// TODO: implement full octave range to know what notes is pressed/released
export type KeyboardNoteReleaseEvent = {
  type: 'note_release';
  payload: MidiNote;
};

export type KeyboardEvent = KeyboardConnectionEvent | KeyboardNoteEvent | KeyboardNoteReleaseEvent;

export const isNoteEvent = (event: KeyboardEvent): event is KeyboardNoteEvent => {
  return event.type === 'note';
};

export const isNoteReleaseEvent = (event: KeyboardEvent): event is KeyboardNoteReleaseEvent => {
  return event.type === 'note_release';
};

export const isKeyboardConnectionEvent = (
  event: KeyboardEvent,
): event is KeyboardConnectionEvent => {
  return event.type === 'connected' || event.type === 'disconnected';
};

export const observeMidiKeyboardEvent = (): Observable<KeyboardEvent> => {
  const midiNotes$ = observeMidiKeyboardInput().pipe(
    startWith(undefined),
    pairwise(),
    switchMap(([prevInput, input]) => {
      if (!input) {
        if (!prevInput) {
          return NEVER;
        }
        return of({ type: 'disconnected' as const, payload: prevInput.name });
      }

      const notes$ = observeMidiNotesOn(input).pipe(
        map((payload): KeyboardNoteEvent => ({ type: 'note', payload })),
      );

      const notesRelease$ = observeMidiNotesOff(input).pipe(
        map((payload): KeyboardNoteReleaseEvent => ({ type: 'note_release', payload })),
      );

      return merge(notes$, notesRelease$).pipe(
        startWith({ type: 'connected' as const, payload: input.name }),
      );
    }),
  );
  return midiNotes$;
};

export type PressedNotesMap = Record<Note, boolean>;

export const DEFAULT_PRESSED_NOTES_MAP: PressedNotesMap = mapObjIndexed(
  () => false,
  INDEXED_CHROMATIC_SCALE,
);

export const observePressedNotes = (
  noteOn$: Observable<KeyboardNoteEvent>,
  noteRelease$: Observable<KeyboardNoteReleaseEvent>,
): Observable<PressedNotesMap> => {
  return merge(noteOn$, noteRelease$).pipe(
    scan((pressedNotes, event) => {
      if (event.type === 'note') {
        return { ...pressedNotes, [event.payload.note]: true };
      } else if (event.type === 'note_release') {
        return { ...pressedNotes, [event.payload.note]: false };
      }
      return pressedNotes;
    }, DEFAULT_PRESSED_NOTES_MAP),
  );
};

const MIDI_NOTES_NUMBER_MAP: Record<string, Note> = mapObjIndexed(
  (x: number) => CHROMATIC_SCALE_BASE_C[x % CHROMATIC_SCALE_BASE_C.length],
  indexBy(
    (x: number) => String(x),
    times(x => x, 127),
  ),
);

/**
 * * Utils
 */
export const getNoteFromNumber = (noteNumber: number): Note => {
  const result = MIDI_NOTES_NUMBER_MAP[String(noteNumber)];

  if (!result) {
    throw new Error(
      `getNoteFromNumber: unable to transform note number '${noteNumber}' to a valid Note`,
    );
  }

  return result;
};
