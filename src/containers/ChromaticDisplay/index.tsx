import { Accessor, Component, createMemo, For } from 'solid-js';
import { Note } from '../../domain/notes';

type NoteDisplayProps = {
  note: Note;
  sharp: boolean;
  active: Accessor<boolean>;
};

export const createNoteDisplay = (note: Note, scannedNotes: Accessor<Note[]>): NoteDisplayProps => {
  const active = createMemo(() => {
    return Boolean(scannedNotes().find(scanned => scanned === note));
  });

  return {
    note,
    sharp: note.length > 1,
    active,
  };
};

const NoteDisplay: Component<NoteDisplayProps> = props => {
  // const buttonStyle = {
  //   padding: '2px',
  //   margin: '2px',
  //   // width: '20px',
  // };

  return (
    <div>
      <div
        style={{
          display: 'inline-block',
          'padding-top': '8px',
          'background-color': props.sharp ? 'black' : 'white',
          color: props.sharp ? 'white' : 'black',
          width: props.sharp ? '35px' : '60px',
          'text-align': props.sharp ? 'inherit' : 'center',
          'padding-left': props.sharp ? '5px' : '0px',
          'margin-left': props.sharp ? '20px' : '0px',
        }}
      >
        {props.note}
      </div>
      <span
        style={{
          'background-color': 'gray',
          color: 'white',
          'padding-top': '8px',
          'padding-left': '10px',
          'padding-right': '10px',
        }}
      >
        {/* <button onClick={props.plus} style={buttonStyle}>
          +
        </button>
        <button onClick={props.minus} style={buttonStyle}>
          -
        </button>
        <button onClick={props.reset} style={buttonStyle}>
          Reset
        </button> */}
        <span
          style={{
            'padding-left': '10px',
            'background-color': props.active() ? 'orange' : 'lightgray',
          }}
        ></span>
      </span>
    </div>
  );
};

type CromaticDisplayProps = {
  notes: NoteDisplayProps[];
};

const ChromaticLayout: Component<CromaticDisplayProps> = props => {
  return (
    <div
      style={{
        'background-color': 'lightgray',
        padding: '10px',
      }}
    >
      <For each={props.notes}>
        {noteProps => {
          return <NoteDisplay {...noteProps} />;
        }}
      </For>
    </div>
  );
};

export const ChromaticDisplay: Component<CromaticDisplayProps> = props => {
  // const onResetAll = () => {
  //   batch(() => {
  //     props.noteCounters.forEach(noteCounter => {
  //       noteCounter.reset();
  //     });
  //   });
  // };

  return (
    <div
      style={{
        display: 'inline-block',
        'margin-left': '42px',
        'background-color': 'gray',
        width: '220px',
        padding: '2px',
        height: '425px',
      }}
    >
      {/* <button onClick={onResetAll}>RESET ALL</button> */}
      <ChromaticLayout notes={props.notes} />
    </div>
  );
};
