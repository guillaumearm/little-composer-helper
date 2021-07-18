import { Accessor, Component, createSignal, For } from 'solid-js';
import { changeBase, CHROMATIC_SCALE, Note } from '../../domain/notes';

const CHROMATIC_SCALE_BASE_C = changeBase(CHROMATIC_SCALE, 'C');

type Callback = () => void;

type NoteCounterProps = {
  note: Note;
  sharp: boolean;
  count: Accessor<number>;
  plus: Callback;
  minus: Callback;
  reset: Callback;
};

const createNoteCounter = (note: Note): NoteCounterProps => {
  const [getCount, setCount] = createSignal(0);

  const plus = () => {
    setCount((x) => x + 1);
  };
  const minus = () => setCount((x) => Math.max(0, x - 1));
  const reset = () => setCount(0);

  return {
    note,
    sharp: note.length > 1,
    count: getCount,
    plus,
    minus,
    reset,
  };
};

const NoteCounter: Component<NoteCounterProps> = (props) => {
  const buttonStyle = {
    padding: '2px',
    margin: '2px',
    // width: '20px',
  };

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
        <button onClick={props.plus} style={buttonStyle}>
          +
        </button>
        <button onClick={props.minus} style={buttonStyle}>
          -
        </button>
        <button onClick={props.reset} style={buttonStyle}>
          Reset
        </button>
        <span
          style={{
            'margin-left': '10px',
            'background-color': 'lightgray',
            color: 'black',
          }}
        >
          {props.count()}
        </span>
      </span>
    </div>
  );
};

const ChromaticLayout: Component<{ noteCounters: NoteCounterProps[] }> = (
  props,
) => {
  return (
    <div
      style={{
        'background-color': 'lightgray',
        padding: '10px',
      }}
    >
      <For each={props.noteCounters}>
        {(noteCounterProps) => {
          return <NoteCounter {...noteCounterProps} />;
        }}
      </For>
    </div>
  );
};

export const ChromaticCounter: Component = () => {
  const noteCounters = CHROMATIC_SCALE_BASE_C.map((note) =>
    createNoteCounter(note),
  );

  const onResetAll = () => {
    noteCounters.forEach((noteCounter) => {
      noteCounter.reset();
    });
  };

  return (
    <div
      style={{
        // margin: 'auto',
        'margin-left': '42px',
        'background-color': 'gray',
        width: '300px',
        padding: '2px',
      }}
    >
      <button onClick={onResetAll}>RESET ALL</button>
      <ChromaticLayout noteCounters={noteCounters} />
    </div>
  );
};
