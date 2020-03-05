import { ItemClass, RawItem, SpecialType } from './types';
import { trimPrefix } from './Utils.re';
import { blocks, getLines, rarity, parseImplicits } from './Item.re';

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

export const parseCopypastaNullable = (text: string): RawItem | null => {
  try {
    return parseCopypasta(text);
  } catch (err) {
    console.log(err);
    return null;
  }
};
