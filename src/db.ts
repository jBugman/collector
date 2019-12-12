import { Store, set, get } from '@isomorphic-git/idb-keyval';

import { PropRanges } from './types';

const DB_NAME = 'poedb';
const TABLE_PROP_RANGES = 'prop_ranges';

const store = new Store(DB_NAME, TABLE_PROP_RANGES);

export const savePropRanges = (name: string, data: PropRanges) => set(name, data, store);

export const loadPropRanges = (name: string): Promise<PropRanges> => get(name, store);
