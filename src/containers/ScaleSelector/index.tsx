import { For, Accessor, Component, createMemo, createSignal, JSX, createEffect } from 'solid-js';
import { Note } from '../../domain/notes';

import { ALL_AVAILABLE_SCALES, Scale } from '../../domain/scales';

type ScaleLineProps = {
  children: string;
  onClick: () => void;
  disabled: Accessor<boolean>;
  selected: Accessor<boolean>;
};

function call<T>(fn: () => T) {
  return fn();
}

const ScaleLine: Component<ScaleLineProps> = props => {
  const lineStyle: Accessor<JSX.CSSProperties> = createMemo(() => ({
    display: 'inline-block',
    'font-weight': props.selected() ? 'bold' : 'normal',
    margin: '3px',
    padding: '3px',
    border: '1px solid black',
    color: call(() => {
      if (!props.disabled() && props.selected()) {
        return 'black';
      }
      return props.disabled() ? 'lightgray' : 'inherit';
    }),
    'background-color': call(() => {
      if (!props.disabled() && props.selected()) {
        return 'white';
      }
      return props.disabled() ? 'inherit' : 'lightgray';
    }),
    cursor: 'pointer',
  }));

  return (
    <div>
      <div onClick={props.onClick} style={lineStyle()}>
        {props.children}
      </div>
      {props.selected() && (
        <div
          style={{
            display: 'inline',
            color: 'white',
            'background-color': 'green',
            height: '10px',
          }}
        >
          o
        </div>
      )}
    </div>
  );
};

type ScaleSelectorProps = {
  scannedNotes: Accessor<Note[]>;
  onSelectedScale?: (scale: Scale | undefined) => void;
};

const isInScale =
  (scale: Scale) =>
  (note: Note): boolean =>
    Boolean(scale.notes.find(n => n === note));

const isNotInScale = (scale: Scale) => (note: Note) => !isInScale(scale)(note);

export const ScaleSelector: Component<ScaleSelectorProps> = props => {
  const [selectedScale, setSelectedScale] = createSignal<Scale>();

  createEffect(() => {
    if (props.onSelectedScale) {
      props.onSelectedScale(selectedScale());
    }
  });

  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-block',
        'margin-left': '42px',
        'background-color': 'gray',
        'min-width': '250px',
        padding: '3px',
        height: '425px',
        'overflow-y': 'scroll',
      }}
    >
      <For each={ALL_AVAILABLE_SCALES}>
        {scale => {
          const selected = () => selectedScale()?.name === scale.name;

          const disabled = createMemo(() => {
            const forbiddenNote = props.scannedNotes().find(isNotInScale(scale));
            return Boolean(forbiddenNote);
          });

          return (
            <ScaleLine
              onClick={() => setSelectedScale(scale)}
              disabled={disabled}
              selected={selected}
            >
              {scale.name}
            </ScaleLine>
          );
        }}
      </For>
    </div>
  );
};
