import { indexBy, mapObjIndexed } from 'ramda';
import { For, JSX, Component, createMemo } from 'solid-js';

import { ChromaticCounter, createNoteCounter } from './containers/ChromaticCounter';
import { ScaleSelector } from './containers/ScaleSelector';
import { CHROMATIC_SCALE_BASE_C, Note } from './domain/notes';
import { MAJOR_SCALES, Scale } from './domain/scales';

import './domain/midi-keyboard';
import './domain/note-scanner';

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

type NoteCountersMap = Record<Note, number>;

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

const ScaleDisplay: Component<{ scale: Scale }> = ({ scale }) => {
  return (
    <>
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
        <For each={scale.notes}>
          {note => {
            return <ScaleDisplayNote note={note} />;
          }}
        </For>
      </div>
    </>
  );
};

const App: Component = () => {
  const noteCounters = CHROMATIC_SCALE_BASE_C.map(note => createNoteCounter(note));

  const noteCountersMap = createMemo((): NoteCountersMap => {
    const indexedNoteCounters = indexBy(v => v.note, noteCounters);
    return mapObjIndexed(v => v.count(), indexedNoteCounters);
  });

  // TODO: pass to ScaleSelector
  void noteCountersMap;

  return (
    <>
      <AppTitle>Little Composer Helper</AppTitle>
      <ChromaticCounter noteCounters={noteCounters} />
      <ScaleSelector />
      <ScaleDisplay scale={MAJOR_SCALES.A} />
    </>
  );
};

export default App;
