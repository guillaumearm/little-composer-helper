import { indexBy, mapObjIndexed } from 'ramda';
import { Component, createMemo } from 'solid-js';

import {
  ChromaticCounter,
  createNoteCounter,
} from './containers/ChromaticCounter';
import { ScaleSelector } from './containers/ScaleSelector';
import { CHROMATIC_SCALE_BASE_C, Note } from './domain/notes';

type AppTitleProps = { children: string };

const AppTitle: Component<AppTitleProps> = (props) => {
  return (
    <h1
      style={{
        'text-align': 'center',
      }}
    >
      {props.children.toUpperCase()}
    </h1>
  );
};

type NoteCountersMap = Record<Note, number>;

const App: Component = () => {
  const noteCounters = CHROMATIC_SCALE_BASE_C.map((note) =>
    createNoteCounter(note),
  );

  const noteCountersMap = createMemo((): NoteCountersMap => {
    const indexedNoteCounters = indexBy((v) => v.note, noteCounters);
    return mapObjIndexed((v) => v.count(), indexedNoteCounters);
  });

  // TODO: pass to ScaleSelector
  void noteCountersMap;

  return (
    <>
      <AppTitle>Compositor</AppTitle>
      <ChromaticCounter noteCounters={noteCounters} />
      <ScaleSelector />
    </>
  );
};

export default App;
