import { createState, createDependentEffect } from 'solid-js';
import { css } from 'emotion';

import Input from './Input';
import Button from './Button';
import { parseCopypasta, compareStats } from '../item';
import { getUniqueInfo } from '../poedb';
import { PropRanges, RawItem } from '../types';
import { savePropRanges, loadPropRanges, saveUniqueScore } from '../db';

const groupStyles = css`
  align-self: center;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 10px;
  min-width: 700px;
  width: 100%;
  height: 475px;
  padding: 0 40px;
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

const StatsWindow = (props: {stats: object | null}) => (
  <div className={statsStyles}>
    {props.stats && JSON.stringify(props.stats, undefined, 2)}
  </div>
);

interface State {
  stats: RawItem | null;
  propRanges: PropRanges | null;
  comparison: ReturnType<typeof compareStats> | null;
}

const initialState: State = {
  stats: null,
  propRanges: null,
  comparison: null
};

const ItemStats = () => {
  const [state, setState] = createState(initialState);

  createDependentEffect(async () => {
    if (state.stats) {
      const propRanges = await loadPropRanges(state.stats.name) || null;
      setState({ propRanges });
    }
    if (state.stats && state.propRanges) {
      const comparison = compareStats(state.stats.explicitMods, state.propRanges.explicitMods);
      setState({ comparison });
    }
  }, [() => state.stats, () => state.propRanges]);

  const handlePaste = (text: string) => setState({
    ...initialState,
    stats: text ? parseCopypasta(text) : null,
    comparison: null
  });

  const onLoadClick = async () => {
    if (state.stats) {
      const name = state.stats.name;
      const propRanges = await getUniqueInfo(name);
      savePropRanges(name, propRanges);
      setState({ propRanges });
    }
  };

  const onSaveClick = () => {
    if (state.stats && state.comparison) {
      const { name } = state.stats;
      const { score } = state.comparison;
      saveUniqueScore(name, score);
    }
  };

  return (
    <div className={groupStyles}>
      <Input className={statsStyles} onTextChange={handlePaste} />
      <StatsWindow stats={state.stats}/>
      <div className={rangesContainerStyled}>
        <StatsWindow stats={state.propRanges}/>
        <Button onClick={onLoadClick} disabled={!state.stats}>Load from PoeDB</Button>
      </div>
      <div className={rangesContainerStyled}>
        <StatsWindow stats={state.comparison}/>
        <Button onClick={onSaveClick} disabled={!state.comparison}>Save as collected</Button>
      </div>
    </div>
  );
};

export default ItemStats;
