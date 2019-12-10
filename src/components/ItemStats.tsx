import { createState } from 'solid-js';
import { css } from 'emotion';

import Input from './Input';
import { parseCopypasta } from '../item';

const groupStyles = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 10px;
  width: 700px;
  height: 475px;
`;

const statsStyles = css`
  background: #0c0b0b; 
  border-color: #141414;
  padding: 6px;
  color: inherit;
  outline: none;
  border: 1px solid #141414;
  white-space: pre-wrap;
`;

const ItemStats = () => {
  const [state, setState] = createState({ stats: {} });
  return (
    <div className={groupStyles}>
      <Input
        className={statsStyles}
        onTextChange={text => text && setState({ stats: parseCopypasta(text) })}
      />
      <div className={statsStyles}>
        {JSON.stringify(state.stats, undefined, 2)}
      </div>
    </div>
  );
};

export default ItemStats;
