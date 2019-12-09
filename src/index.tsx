import { render } from 'solid-js/dom';

import App from './App';

render(
  () => <App text='This works' />,
  document.getElementById('root') as HTMLElement,
);
