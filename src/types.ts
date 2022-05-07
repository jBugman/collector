import { ItemClassT } from '*/Item.res';

export interface PropRanges {
  implicitMods?: string[];
  explicitMods: string[];
}

export enum SpecialType {
  Corrupted = 'Corrupted',
  Shaper = 'Shaper Item',
  Elder = 'Elder Item',
  Synthesized = 'Synthesised Item',
}

export interface RawItem {
  rarity: string;
  ilvl: number;
  name: string;
  typeLine: string;
  itemClass: ItemClassT;
  specialType?: SpecialType;
  implicitMods: string[];
  explicitMods: string[];
  craftedMods?: string[];
}
