import { JSX, For, Component } from 'solid-js';
import { Note } from '../../domain/notes';
import { Scale } from '../../domain/scales';

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

export const ScaleDisplay: Component<{ scale?: Scale }> = props => {
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
