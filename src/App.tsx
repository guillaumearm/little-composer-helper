import { Component, createSignal } from 'solid-js';

import { ScaleSelector } from './components/ScaleSelector';
import { CHROMATIC_SCALE } from './domain/notes';
import { Scale } from './domain/scales';

import './domain/midi-keyboard';
import './domain/note-scanner';
import { ChromaticDisplay, createNoteDisplay } from './components/ChromaticDisplay';
import { MidiKeyboardStatus } from './components/MidiKeyboardStatus';
import { ScaleDisplay } from './components/ScaleDisplay';
import { AppTitle } from './components/AppTitle';
import {
  DEFAULT_PRESSED_NOTES_MAP,
  isKeyboardConnectionEvent,
  isNoteEvent,
  isNoteReleaseEvent,
  observeMidiKeyboardEvent,
  observePressedNotes,
} from './domain/midi-keyboard';
import { observeScannedNotes } from './domain/note-scanner';
import { distinctUntilChanged, filter, interval, map, NEVER, of, share } from 'rxjs';
import { observableToAccessor } from './utils/solid-rxjs-tools';
import { getTimeTrackedNotesMap } from './domain/notes-tracker';
import { krumhansl } from './domain/krumhansl';

const App: Component = () => {
  const [selectedScale, setSelectedScale] = createSignal<Scale>();

  const midiKeyboardEvent$ = observeMidiKeyboardEvent().pipe(share());
  const noteEvent$ = midiKeyboardEvent$.pipe(filter(isNoteEvent));
  const noteReleaseEvent$ = midiKeyboardEvent$.pipe(filter(isNoteReleaseEvent));

  // ! temporary
  const timeTrackedNotesMap$ = getTimeTrackedNotesMap(
    noteEvent$,
    noteReleaseEvent$,
    interval(1000),
    NEVER,
  );

  // ! temporary
  timeTrackedNotesMap$
    .pipe(map(krumhansl), distinctUntilChanged())
    // .pipe(map(krumhansl), map(getKeyProfileDisplayName), distinctUntilChanged())
    .subscribe({
      error: console.error,
      complete: () => console.warn('=> completed'),
      next: console.log,
    });

  const pressedNotes$ = observePressedNotes(noteEvent$, noteReleaseEvent$);
  const pressedNotes = observableToAccessor(pressedNotes$, DEFAULT_PRESSED_NOTES_MAP);

  const keyboardStatus$ = midiKeyboardEvent$.pipe(filter(isKeyboardConnectionEvent));

  const keyboardStatus = observableToAccessor(keyboardStatus$, {
    type: 'disconnected' as const,
    payload: '',
  });

  const scannedNotes$ = observeScannedNotes({
    maximumNotes$: of(7),
    playedNote$: noteEvent$.pipe(map(({ payload }) => payload.note)),
  });

  const scannedNotes = observableToAccessor(scannedNotes$, []);

  const noteDisplay = CHROMATIC_SCALE.map(note =>
    createNoteDisplay(note, scannedNotes, selectedScale, pressedNotes),
  );

  return (
    <>
      <AppTitle>Little Composer Helper</AppTitle>
      <MidiKeyboardStatus deviceStatus={keyboardStatus} />
      <ChromaticDisplay notes={noteDisplay} />
      <ScaleSelector scannedNotes={scannedNotes} onSelectedScale={setSelectedScale} />
      <ScaleDisplay scale={selectedScale()} />
    </>
  );
};

export default App;
