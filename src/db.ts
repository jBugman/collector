import { PropRanges } from './types';

const PREFIX = 'collector';
const LIST_KEY = `${PREFIX}:list`;
const propsKey = (name: string) => `${PREFIX}:props:${name}`;
const scoreKey = (name: string) => `${PREFIX}:score:${name}`;

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
