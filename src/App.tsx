import { Component, createSignal } from 'solid-js';

import { ScaleSelector } from './components/ScaleSelector';
import { CHROMATIC_SCALE_BASE_C } from './domain/notes';
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
import { filter, map, of, share } from 'rxjs';
import { observableToAccessor } from './utils/solid-rxjs-tools';

const App: Component = () => {
  const [selectedScale, setSelectedScale] = createSignal<Scale>();

  const midiKeyboardEvent$ = observeMidiKeyboardEvent().pipe(share());
  const noteEvent$ = midiKeyboardEvent$.pipe(filter(isNoteEvent));
  const noteReleaseEvent$ = midiKeyboardEvent$.pipe(filter(isNoteReleaseEvent));

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

  const noteDisplay = CHROMATIC_SCALE_BASE_C.map(note =>
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
