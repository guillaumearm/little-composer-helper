import type { Component } from 'solid-js';
import { Note } from '../../domain/notes';

type KeyProps = { note: Note; text?: string; extended?: boolean };

const WhiteKey: Component<KeyProps> = (props) => {
  return (
    <div
      style={{
        'border-top': '1px solid black',
        'padding-top': props.extended ? '18px' : '10px',
        'padding-left': '10px',
        'padding-bottom': props.extended ? '18px' : '0px',
        'background-color': 'white',
      }}
    >
      <span style={{ position: 'absolute', 'margin-left': '220px' }}>
        <button style={{ 'margin-left': '10px', 'border-radius': '0px' }}>
          +
        </button>
        <button style={{ 'margin-left': '10px', 'border-radius': '0px' }}>
          -
        </button>
      </span>
      <span
        style={{
          'border-radius': '10px',
          padding: '4px',
          'background-color': 'lightgray',
        }}
      >
        {props.note}
      </span>
      <span>{props.text ? ` - ${props.text}` : ''}</span>
    </div>
  );
};

const BlackKey: Component<KeyProps> = (props) => {
  return (
    <div style={{ 'background-color': 'white' }}>
      <div
        style={{
          'padding-top': '5px',
          'padding-bottom': '5px',
          'padding-left': '10px',
          'margin-left': '80px',
          'background-color': 'black',
          color: 'white',
        }}
      >
        <span
          style={{
            'border-radius': '10px',
            padding: '4px',
            'background-color': 'gray',
          }}
        >
          {props.note}
        </span>
        <span
          style={{
            position: 'absolute',
            'margin-left': '110px',
          }}
        >
          <button style={{ 'border-radius': '0px', 'margin-left': '10px' }}>
            +
          </button>
          <button style={{ 'border-radius': '0px', 'margin-left': '10px' }}>
            -
          </button>
        </span>
        <span>{props.text ? ` - ${props.text}` : ''}</span>
      </div>
    </div>
  );
};

const ChromaticLayout: Component = () => {
  return (
    <>
      <WhiteKey note={'C'} />
      <BlackKey note={'C#'} />
      <WhiteKey note={'D'} />
      <BlackKey note={'D#'} />
      <WhiteKey note={'E'} extended />
      <WhiteKey note={'F'} />
      <BlackKey note={'F#'} />
      <WhiteKey note={'G'} />
      <BlackKey note={'G#'} />
      <WhiteKey note={'A'} />
      <BlackKey note={'A#'} />
      <WhiteKey note={'B'} extended />
    </>
  );
};

export const ChromaticCounter: Component = () => {
  return (
    <div
      style={{
        margin: 'auto',
        'background-color': 'lightgray',
        width: '300px',
        padding: '10px',
      }}
    >
      <ChromaticLayout />
    </div>
  );
};
