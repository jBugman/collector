import { createState, createEffect } from 'solid-js';
import { css } from 'emotion';

import Input from './Input';
import Button from './Button';
import { parseCopypasta } from '../item';
import { getUniqueInfo } from '../poedb';
import { PropRanges, RawItem } from '../types';
import { savePropRanges, loadPropRanges } from '../db';

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

interface State {
  stats: RawItem | null;
  propRanges: PropRanges | null;
}

const ItemStats = () => {
  const [state, setState] = createState<State>({
    stats: null,
    propRanges: null
  });

  createEffect(async () => {
    if (!state.stats) return;
    const propRanges = await loadPropRanges(state.stats.name);
    setState({ propRanges });
  });

  const handlePaste = (text: string) => {
    if (!text) return;
    const stats = parseCopypasta(text);
    setState({ stats, propRanges: null });
  };

  const handleLoad = () => {
    if (!state.stats) return;
    const name = state.stats.name;
    getUniqueInfo(name)
      .then(propRanges => {
        savePropRanges(name, propRanges);
        setState({ propRanges });
      });
  };

  return (
    <div className={groupStyles}>
      <Input className={statsStyles} onTextChange={handlePaste} />
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
