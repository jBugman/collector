import { injectGlobal } from 'emotion';
import ItemStats from './components/ItemStats';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
injectGlobal`
  * {
    box-sizing: border-box;
  }
  html, body, #root {
    height: 100%;
    margin: 0;
  }
  body {
    font-family: Verdana, Arial, sans-serif;
    font-size: 13px;
    color: #A38D6D;
    background: #000;
  }
  #root {
    display: grid;
  }
`;

const App = () => (
  <ItemStats/>
);

export default App;
