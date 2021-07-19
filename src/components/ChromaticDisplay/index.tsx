import { Accessor, Component, createMemo, For } from 'solid-js';
import { PressedNotesMap } from '../../domain/midi-keyboard';
import { Note } from '../../domain/notes';
import { Scale } from '../../domain/scales';

type NoteDisplayProps = {
  note: Note;
  sharp: boolean;
  active: Accessor<boolean>;
  selected: Accessor<boolean>;
  pressed: Accessor<boolean>;
};

function call<T>(fn: () => T) {
  return fn();
}

export const createNoteDisplay = (
  note: Note,
  scannedNotes: Accessor<Note[]>,
  selectedScale: Accessor<Scale | undefined>,
  pressedNotes: Accessor<PressedNotesMap>,
): NoteDisplayProps => {
  const active = createMemo(() => {
    return Boolean(scannedNotes().find(scanned => scanned === note));
  });

  const selected = createMemo(() => {
    const selectedNotes = selectedScale()?.notes ?? [];
    return Boolean(selectedNotes.find(selected => selected === note));
  });

  const pressed = createMemo(() => {
    return Boolean(pressedNotes()[note]);
  });

  return {
    note,
    sharp: note.length > 1,
    active,
    selected,
    pressed,
  };
};

const NoteDisplay: Component<NoteDisplayProps> = props => {
  return (
    <div>
      <div
        style={{
          display: 'inline-block',
          'padding-top': '8px',
          'background-color': call(() => {
            const pressed = props.pressed();
            if (pressed && props.sharp) {
              return 'darkgreen';
            } else if (pressed && !props.sharp) {
              return 'green';
            }
            return props.sharp ? 'black' : 'white';
          }),
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
          'padding-left': '10px',
          'background-color': props.selected() ? 'green' : 'white',
        }}
      />
      <span
        style={{
          'background-color': 'gray',
          color: 'white',
          'padding-top': '8px',
          'padding-left': '10px',
          'padding-right': '10px',
        }}
      >
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

type ChromaticDisplayProps = {
  notes: NoteDisplayProps[];
};

const ChromaticLayout: Component<ChromaticDisplayProps> = props => {
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

export const ChromaticDisplay: Component<ChromaticDisplayProps> = props => {
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
      <ChromaticLayout notes={props.notes} />
    </div>
  );
};
