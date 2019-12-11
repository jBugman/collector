enum SpecialType {
  Corrupted = 'Corrupted',
  Shaper = 'Shaper Item',
  Elder = 'Elder Item',
  Synthesized = 'Synthesised Item',
}

const isSpecialType = (s: string) => s === SpecialType.Corrupted || s === SpecialType.Shaper || s === SpecialType.Elder || s === SpecialType.Synthesized;

export enum ItemClass {
  Weapon = 'Weapon',
  Armour = 'Armour',
  Jewelry = 'Jewelry',
  Jewel = 'Jewel',
  Map = 'Map',
  Flask = 'Flask'
}

export interface RawItem {
  rarity?: string; // TODO
  ilvl: number;
  name: string;
  typeLine: string;
  class: ItemClass;
  specialType?: SpecialType;
  implicitMods: string[];
  explicitMods: string[];
  craftedMods?: string[];
}

const SEPARATOR = '--------';
const TYPE_JEWEL = 'Jewel';
const TYPE_AMULET = 'Amulet';

const RARITY_PREFIX = 'Rarity:';
const REQUIREMENTS_LINE = 'Requirements:';
const SOCKETS_PREFIX = 'Sockets:';
const ILVL_PREFIX = 'Item Level:';

const ATTACK_SPEED_PREFIX = 'Attacks per Second:';

const ARMOR_PREFIX = 'Armour:';
const EVASION_PREFIX = 'Evasion Rating:';
const ES_PREFIX = 'Energy Shield:';

const trimPrefix = (p: string, s: string): string => s.substr(p.length).trimLeft();

export const parseCopypasta = (text: string): RawItem => {
  const blocks = text.replace('\r\n', '\n').split(SEPARATOR);

  const item = {} as RawItem;

  const varBlocks = [] as string[][];

  blocks.forEach((block, idx) => {
    const lines = block.trim().split('\n');
    const header = lines[0];
    if (idx === 0) {
      // Name
      item.rarity = trimPrefix(RARITY_PREFIX, header);
      item.name = lines[1];
      item.typeLine = lines[2];
      const typeWords = item.typeLine.split(' ');
      if (typeWords.some(w => w === TYPE_JEWEL)) {
        item.class = ItemClass.Jewel;
      }
      if (typeWords.some(w => w === TYPE_AMULET)) {
        item.class = ItemClass.Jewelry;
      }
      return;
    }
    if (idx === 1) {
      // Base props
      if (header.startsWith(ARMOR_PREFIX) || header.startsWith(EVASION_PREFIX) || header.startsWith(ES_PREFIX)) {
        // Defensive stats
        item.class = ItemClass.Armour;
        return;
      }
      if (lines.some(line => line.startsWith(ATTACK_SPEED_PREFIX))) {
        item.class = ItemClass.Weapon;
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
  if (item.class === ItemClass.Jewel || item.class === ItemClass.Map) {
    // FIXME: other types with instructions?
    varBlocks.pop();
  }

  // Skip flavour lore text // TODO: only on uniques?
  if (item.rarity === 'Unique') {
    varBlocks.pop();
  }

  // Real stat blocks are static
  if (varBlocks.length > 0) {
    item.explicitMods = varBlocks.pop() as string[];
  }
  if (varBlocks.length > 0) {
    item.implicitMods = varBlocks.pop() as string[];
  }

  return item;
};
