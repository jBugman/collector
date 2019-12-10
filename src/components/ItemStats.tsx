import { createState } from 'solid-js';
import { css } from 'emotion';

import Form from './Form';

const statsStyles = css`
  min-width: 300px;
  min-height: 400px;
  background: #0c0b0b; 
  border-color: #141414;
  padding: 6px;
  color: inherit;
  outline: none;
  border: 1px solid #141414;
`;

const parseStats = (text: string) => ({ dummy: true, name: text.slice(0, 10) });

const ItemStats = () => {
  const [state, setState] = createState({ stats: {} });
  return (
    <div className={css`
      display: grid;
      grid-auto-flow: column;
      column-gap: 10px;
    `}
    >
      <Form onTextChange={text => setState({ stats: parseStats(text) })}/>
      <div className={statsStyles}>{JSON.stringify(state.stats, null, 2)}</div>
    </div>
  );
};

export default ItemStats;
