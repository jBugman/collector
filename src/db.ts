import { openDB } from 'idb';

import { PropRanges } from './types';

const DB_NAME = 'poedb';
const TABLE_PROP_RANGES = 'prop_ranges';
const TABLE_COLLECTION = 'collected_uniques';

const dbPromise = openDB(DB_NAME, 3, {
  upgrade: (db, v1, v2) => {
    if (v2 === 1) {
      db.createObjectStore(TABLE_PROP_RANGES);
    }
    if (v2 === 3) {
      db.createObjectStore(TABLE_COLLECTION);
    }
  }
});

export const savePropRanges = async (name: string, data: PropRanges) => {
  const db = await dbPromise;
  db.put(TABLE_PROP_RANGES, data, name);
};

export const loadPropRanges = async (name: string): Promise<PropRanges | undefined> => {
  const db = await dbPromise;
  return db.get(TABLE_PROP_RANGES, name);
};

export const saveUniqueScore = async (name: string, score: number) => {
  const db = await dbPromise;
  db.put(TABLE_COLLECTION, score, name);
};

export const loadUniqueScore = async (name: string): Promise<number | undefined> => {
  const db = await dbPromise;
  return db.get(TABLE_COLLECTION, name);
};
