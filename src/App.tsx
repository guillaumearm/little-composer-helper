import type { Component, JSX } from 'solid-js';

type MandatoryChildrenProps = { children: JSX.Element };

const AppTitle: Component<MandatoryChildrenProps> = (props) => {
  return <h1>{props.children}</h1>;
};

const App: Component = () => {
  return (
    <>
      <AppTitle>Compositor</AppTitle>
      <p>Hello World</p>
    </>
  );
};

export default App;
