import type { Component } from 'solid-js';
import { ChromaticCounter } from './containers/ChromaticCounter';

type MandatoryChildrenProps = { children: string };

const AppTitle: Component<MandatoryChildrenProps> = (props) => {
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

const App: Component = () => {
  return (
    <>
      <AppTitle>Compositor</AppTitle>
      <ChromaticCounter />
    </>
  );
};

export default App;
