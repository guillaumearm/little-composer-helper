import { For, JSX, Component, createSignal, Accessor, createMemo } from 'solid-js';

import { ScaleSelector } from './containers/ScaleSelector';
import { CHROMATIC_SCALE_BASE_C, Note } from './domain/notes';
import { Scale } from './domain/scales';

import './domain/midi-keyboard';
import './domain/note-scanner';
import { ChromaticDisplay, createNoteDisplay } from './containers/ChromaticDisplay';
import {
  DEFAULT_PRESSED_NOTES_MAP,
  isKeyboardConnectionEvent,
  isNoteEvent,
  isNoteReleaseEvent,
  KeyboardConnectionEvent,
  observeMidiKeyboardEvent,
  observePressedNotes,
} from './domain/midi-keyboard';
import { observeScannedNotes } from './domain/note-scanner';
import { filter, map, of, share } from 'rxjs';
import { observableToAccessor } from './utils/solid-rxjs-tools';

type AppTitleProps = { children: string };

const AppTitle: Component<AppTitleProps> = props => {
  return (
    <h2
      style={{
        'text-align': 'center',
      }}
    >
      {props.children.toUpperCase()}
    </h2>
  );
};

const ScaleDisplayNote: Component<{ note: Note }> = ({ note }) => {
  const sharp = note.length > 1;

  const lineStyle: JSX.CSSProperties = {
    color: sharp ? 'white' : 'black',
    'background-color': sharp ? 'black' : 'white',
    width: '40px',
    margin: '10px',
    'text-align': 'center',
  };

  return <div style={lineStyle}>{note}</div>;
};

const ScaleDisplay: Component<{ scale?: Scale }> = props => {
  return (
    <>
      {props.scale && (
        <div
          style={{
            position: 'absolute',
            margin: '42px',
            'background-color': 'gray',
            'min-width': '60px',
            padding: '20px',
            height: '200px',
          }}
        >
          <For each={props.scale?.notes ?? []}>
            {note => {
              return <ScaleDisplayNote note={note} />;
            }}
          </For>
        </div>
      )}
    </>
  );
};

type MidiKeyboardStatusProp = {
  deviceStatus: Accessor<KeyboardConnectionEvent>;
};

const MidiKeyboardStatus: Component<MidiKeyboardStatusProp> = props => {
  const status = createMemo(() => props.deviceStatus());

  return (
    <div
      style={{
        'background-color': status().type === 'connected' ? 'green' : 'red',
      }}
    >
      {status().type === 'connected' ? status().payload : 'MIDI Keyboard unavailable'}
    </div>
  );
};

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
    playedNote$: noteEvent$.pipe(map(({ payload }) => payload)),
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
