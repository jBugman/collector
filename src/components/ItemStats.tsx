import { createState } from 'solid-js';
import { css } from 'emotion';

import Input from './Input';
import Button from './Button';
import { parseCopypasta, RawItem } from '../item';
import { getUniqueInfo, PropRanges } from '../poedb';

const groupStyles = css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

const rangesContainerStyled = css`
  display: grid;
  row-gap: 5px;
  grid-template-rows: 1fr auto;
`;

const ItemStats = () => {
  const [state, setState] = createState({
    stats: null as RawItem | null,
    propRanges: null as PropRanges | null
  });

  const handleLoad = () => {
    if (!state.stats) return;
    getUniqueInfo(state.stats.name)
      .then(propRanges => setState({ propRanges }));
  };

  return (
    <div className={groupStyles}>
      <Input
        className={statsStyles}
        onTextChange={text => text && setState({ stats: parseCopypasta(text) })}
      />
      <div className={statsStyles}>
        {state.stats && JSON.stringify(state.stats, undefined, 2)}
      </div>
      <div className={rangesContainerStyled}>
        <div className={statsStyles}>
          {state.propRanges && JSON.stringify(state.propRanges, undefined, 2)}
        </div>
        <Button onClick={handleLoad} disabled={!state.stats}>Load from PoeDB</Button>
      </div>
    </div>
  );
};

export default ItemStats;
