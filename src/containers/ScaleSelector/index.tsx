import type { Component, JSX } from 'solid-js';

type ScaleLineProps = {
  children: string;
  disabled?: boolean;
  selected?: boolean;
};

function call<T>(fn: () => T) {
  return fn();
}

const ScaleLine: Component<ScaleLineProps> = (props) => {
  const lineStyle: JSX.CSSProperties = {
    display: 'inline-block',
    'font-weight': props.selected ? 'bold' : 'normal',
    margin: '3px',
    padding: '3px',
    border: '1px solid black',
    color: call(() => {
      if (!props.disabled && props.selected) {
        return 'black';
      }
      return props.disabled ? 'lightgray' : 'inherit';
    }),
    'background-color': call(() => {
      if (!props.disabled && props.selected) {
        return 'white';
      }
      return props.disabled ? 'inherit' : 'lightgray';
    }),
  };

  return (
    <div>
      <div style={lineStyle}>{props.children}</div>
      {props.selected && (
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

export const ScaleSelector: Component = () => {
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
      <ScaleLine selected>Line 1</ScaleLine>
      <ScaleLine disabled>Line 2</ScaleLine>
      <ScaleLine>Line 3</ScaleLine>
      <ScaleLine disabled>Line 4</ScaleLine>
    </div>
  );
};
