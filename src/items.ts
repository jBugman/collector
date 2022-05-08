import type { RawItem } from './types';
import { SpecialType } from './types';
import { trimPrefix } from './Utils.res';
import { blocks, getLines, rarity, parseImplicits, ItemClass, shouldStripInstructions } from './Item.res';

const isSpecialType = (s: string) => s === SpecialType.Corrupted || s === SpecialType.Shaper || s === SpecialType.Elder || s === SpecialType.Synthesized;

const REQUIREMENTS_LINE = 'Requirements:';
const SOCKETS_PREFIX = 'Sockets:';
const ILVL_PREFIX = 'Item Level:';

const ATTACK_SPEED_PREFIX = 'Attacks per Second:';

const parseCopypasta = (text: string): RawItem => {
  const bs = blocks(text);

  const item = {} as RawItem;

  const varBlocks = [] as string[][];

  bs.forEach((block, idx) => {
    const lines = getLines(block);
    const header = lines[0];
    if (idx === 0) {
      // Name
      item.rarity = rarity(header);
      if (item.rarity !== 'Unique') {
        throw new Error(`must be unique item: ${item.rarity}`);
      }
      item.name = lines[1];
      item.typeLine = lines[2] || '';
      item.itemClass = ItemClass.fromTypeLine(item.typeLine);
      return;
    }
    if (idx === 1) {
      // Base props
      if (ItemClass.isArmour(header)) {
        item.itemClass = ItemClass.armour;
        return;
      }
      if (lines.some(line => line.startsWith(ATTACK_SPEED_PREFIX))) {
        item.itemClass = ItemClass.weapon;
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
  if (shouldStripInstructions(item)) {
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

export const parseCopypastaNullable = (text: string): RawItem | null => {
  try {
    return parseCopypasta(text);
  } catch (err) {
    console.log(err);
    return null;
  }
};
