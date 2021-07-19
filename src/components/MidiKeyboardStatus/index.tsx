import { Accessor, Component, createMemo } from 'solid-js';
import { KeyboardConnectionEvent } from '../../domain/midi-keyboard';

export type MidiKeyboardStatusProp = {
  deviceStatus: Accessor<KeyboardConnectionEvent>;
};

export const MidiKeyboardStatus: Component<MidiKeyboardStatusProp> = props => {
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
