export interface PropRanges {
  implicitMods?: string[];
  explicitMods: string[];
}

export enum ItemClass {
  Weapon = 'Weapon',
  Armour = 'Armour',
  Jewelry = 'Jewelry',
  Jewel = 'Jewel',
  Map = 'Map',
  Flask = 'Flask'
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
  class: ItemClass;
  specialType?: SpecialType;
  implicitMods: string[];
  explicitMods: string[];
  craftedMods?: string[];
}
