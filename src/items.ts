import { ItemClass, RawItem, SpecialType } from './types';
import { trimPrefix } from './Utils.re';
import { scale, fixed, blocks, getLines, rarity, parseImplicits } from './Item.re';

const isSpecialType = (s: string) => s === SpecialType.Corrupted || s === SpecialType.Shaper || s === SpecialType.Elder || s === SpecialType.Synthesized;

const TYPE_JEWEL = 'Jewel';
const TYPE_AMULET = 'Amulet';

const REQUIREMENTS_LINE = 'Requirements:';
const SOCKETS_PREFIX = 'Sockets:';
const ILVL_PREFIX = 'Item Level:';

const ATTACK_SPEED_PREFIX = 'Attacks per Second:';

const ARMOR_PREFIX = 'Armour:';
const EVASION_PREFIX = 'Evasion Rating:';
const ES_PREFIX = 'Energy Shield:';

const parseCopypastaUnsafe = (text: string): RawItem => {
  const bs = blocks(text);

  const item = {} as RawItem;

  const varBlocks = [] as string[][];

  bs.forEach((block, idx) => {
    const lines = getLines(block);
    const header = lines[0];
    if (idx === 0) {
      // Name
      item.rarity = rarity(header);
      item.name = lines[1];
      item.typeLine = lines[2] || '';
      const typeWords = item.typeLine.split(' ');
      if (typeWords.some(w => w === TYPE_JEWEL)) {
        item.itemClass = ItemClass.Jewel;
      }
      if (typeWords.some(w => w === TYPE_AMULET)) {
        item.itemClass = ItemClass.Jewelry;
      }
      return;
    }
    if (idx === 1) {
      // Base props
      if (header.startsWith(ARMOR_PREFIX) || header.startsWith(EVASION_PREFIX) || header.startsWith(ES_PREFIX)) {
        // Defensive stats
        item.itemClass = ItemClass.Armour;
        return;
      }
      if (lines.some(line => line.startsWith(ATTACK_SPEED_PREFIX))) {
        item.itemClass = ItemClass.Weapon;
        return;
      }
      return;
    }
    if (header === REQUIREMENTS_LINE) {
      // Requirements
      // skip for now
      return;
    }
    if (header.startsWith(SOCKETS_PREFIX)) {
      // Sockets
      // skip for now
      // TODO: mark 5+ links?
      return;
    }
    if (header.startsWith(ILVL_PREFIX)) {
      item.ilvl = parseInt(trimPrefix(ILVL_PREFIX, header), 10);
      return;
    }
    varBlocks.push(lines);
  });

  // variableBlocks:
  // implicit mods
  // explicit mods
  // lore
  // instruction
  // special

  if (varBlocks.length > 5) {
    throw new Error('There should not be more than 5 variable groups');
  }
  if (varBlocks.length < 2) {
    throw new Error('There should be more at least 2 variable groups');
  }

  // Get special type if it exists
  const spec = varBlocks[varBlocks.length - 1].join('');
  if (isSpecialType(spec)) {
    item.specialType = spec as SpecialType;
    varBlocks.pop();
  }

  // Skip instruction fluff
  if (item.itemClass === ItemClass.Jewel || item.itemClass === ItemClass.Map) {
    // FIXME: other types with instructions?
    varBlocks.pop();
  }

  // Skip flavour lore text // TODO: only on uniques?
  if (item.rarity === 'Unique') {
    varBlocks.pop();
  }

  item.implicitMods = [];
  // Real stat blocks are static
  if (varBlocks.length > 0) {
    item.explicitMods = varBlocks.pop() as string[];
  }
  if (varBlocks.length > 0) {
    item.implicitMods = parseImplicits(varBlocks.pop() as string[]);
  }

  return item;
};

export const parseCopypasta = (text: string): RawItem | null => {
  try {
    return parseCopypastaUnsafe(text);
  } catch (err) {
    console.log(err);
    return null;
  }
};

const intersect = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set([...a].filter(x => b.has(x)));

const diff = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set([...a].filter(x => !b.has(x)));

const valueRegex = /([+-]?[0-9.]+)/giu;
const generalizeMod = (mod: string): Record<string, number> => {
  let x = 0;
  const key = mod.replace(valueRegex, m => {
    x = parseFloat(m);
    return 'X';
  });
  return { [key]: x };
};

const getRealMatches = (xs: string[]) =>
  [...xs.slice(2, 4), ...xs.slice(0, 4)].slice(0, 2);

const rangeRegex = new RegExp(`([+-]?\\(${valueRegex.source}[-–]${valueRegex.source}\\)|${valueRegex.source})`, 'giu');
const generalizeModRange = (mod: string): Record<string, [number, number]> => {
  let x = 0;
  let y = 0;
  const key = mod.replace(rangeRegex, (...args) => {
    const [x_, y_] = getRealMatches(args);
    x = parseFloat(x_);
    y = parseFloat(y_);
    return 'X';
  });
  return { [key]: [x, y] };
};

const compareStatsUnsafe = (mods: string[], ranges: string[]) => {
  const modSet = new Set(mods);
  const rangeSet = new Set(ranges);
  const similar = intersect(modSet, rangeSet);
  const modValues = [...diff(modSet, similar).values()]
    .map(generalizeMod)
    .reduce((acc, x) => ({ ...acc, ...x }), {});
  const rangeValues = [...diff(rangeSet, similar).values()]
    .map(generalizeModRange)
    .reduce((acc, x) => ({ ...acc, ...x }), {});
  const combinedValues = Object.keys(modValues)
    .reduce((acc, k) => {
      const score = fixed(scale(modValues[k], ...rangeValues[k]));
      return ({ ...acc, [k]: score });
    }, {});
  const scores = Object.values(combinedValues) as number[];
  const avg = scores.reduce((acc, x) => acc + x, 0) / scores.length;
  const score = fixed(avg);
  return {
    mods: combinedValues,
    score: isNaN(score) ? 1 : score,
  };
};

export const compareStats = (mods: string[], ranges: string[]) => {
  try {
    return compareStatsUnsafe(mods, ranges);
  } catch (err) {
    return null;
  }
};
