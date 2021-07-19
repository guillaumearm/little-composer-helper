import WebMidi, {
  Input,
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
} from 'rxjs';

import { isValidNote, Note } from './notes';

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
  new Observable<Note>(obs => {
    function listener(noteEvent: InputEventNoteon) {
      const note = noteEvent.note.name;
      if (isValidNote(note)) {
        obs.next(note);
      } else {
        obs.error(new Error('observeMidiNotesOn: Invalid not provided!'));
      }
    }

    input.addListener('noteon', 'all', listener);

    return () => {
      input.removeListener('noteon', 'all', listener);
      obs.complete();
    };
  });

export type KeyboardConnectionEvent = {
  type: 'connected' | 'disconnected';
  payload: string; // name of the device
};

export type KeyboardNoteEvent = {
  type: 'note';
  payload: Note;
};

export type KeyboardEvent = KeyboardConnectionEvent | KeyboardNoteEvent;

export const isNoteEvent = (event: KeyboardEvent): event is KeyboardNoteEvent => {
  return event.type === 'note';
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

      return notes$.pipe(startWith({ type: 'connected' as const, payload: input.name }));
    }),
  );
  return midiNotes$;
};
