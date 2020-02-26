import { saveAs } from 'file-saver';

import { PropRanges } from './types';
import { trimPrefix } from '~/purs/Strings';

const PREFIX = 'collector';
const LIST_KEY = `${PREFIX}:list`;
const PROPS_KEY = `${PREFIX}:props:`;
const SCORE_KEY = `${PREFIX}:score:`;
const propsKey = (name: string) => PROPS_KEY + name;
const scoreKey = (name: string) => SCORE_KEY + name;

const loadList = (): string[] => {
  const json = window.localStorage.getItem(LIST_KEY) || '[]';
  return JSON.parse(json);
};

const saveList = (items: string[]) => {
  const json = JSON.stringify(items);
  window.localStorage.setItem(LIST_KEY, json);
};

const indexItem = (name: string) => {
  const items = new Set(loadList());
  const i2 = items.add(name);
  saveList([...i2.values()]);
};

export const savePropRanges = (name: string, data: PropRanges) => {
  const blob = JSON.stringify(data);
  window.localStorage.setItem(propsKey(name), blob);
};

export const loadPropRanges = (name: string): PropRanges | null => {
  const blob = window.localStorage.getItem(propsKey(name));
  return blob ? JSON.parse(blob) : null;
};

export const saveUniqueScore = (name: string, score: number) => {
  window.localStorage.setItem(scoreKey(name), score.toString(10));
  indexItem(name);
};

export const loadUniqueScore = (name: string): number | null => {
  const val = window.localStorage.getItem(scoreKey(name));
  return val ? parseFloat(val) : null;
};

interface DBDump {
  scores: Record<string, number>;
  props: Record<string, object>;
}

const dumpDB = () => {
  const entries = Object.entries(window.localStorage);
  const result: DBDump = {
    scores: {},
    props: {},
  };
  entries.forEach(([k, v]) => {
    if (k.startsWith(PROPS_KEY)) {
      const name = trimPrefix(PROPS_KEY, k);
      result.props[name] = JSON.parse(v);
    } else if (k.startsWith(SCORE_KEY)) {
      const name = trimPrefix(SCORE_KEY, k);
      result.scores[name] = parseFloat(v);
    }
  });
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json;charset=utf-8' });
  saveAs(blob, 'database.json');
};

declare global {
  interface Window {
    saveCollectorDB: () => void;
  }
}

window.saveCollectorDB = dumpDB;
