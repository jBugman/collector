declare module '*/Source.re' {
  type PropRanges = import('../types').PropRanges;

  function poedbURL(name: string): string;
  function getWikiInfo(name: string): void;
  function filterBadMods(mods: PropRanges): PropRanges;
}

declare module '*/Utils.re' {
  function trimPrefix(pattern: string, val: string): string;
}

declare module '*/Item.re' {
  function blocks(text: string): string[];
  function getLines(text: string): string[];
  function rarity(line: string): string;
  function parseImplicits(lines: string[]): string[];

  type ItemClassT = number;

  interface ItemClass {
    weapon: ItemClassT;
    armour: ItemClassT;
    jewelry: ItemClassT;
    jewel: ItemClassT;
    map: ItemClassT;
    flask: ItemClassT;

    fromTypeLine: (line: string) => ItemClassT;
    isArmour: (line: string) => boolean;
  }

  const ItemClass: ItemClass;

  interface ItemScores {
    mods: Record<string, number>;
    score: number;
  }

  function compareItemStatsNullable(mods: string[], ranges: string[]): ItemScores | null;
}

declare module '*/DB.re' {
  type PropRanges = import('../types').PropRanges;

  const props_key: string; // eslint-disable-line camelcase,@typescript-eslint/camelcase
  const score_key: string; // eslint-disable-line camelcase,@typescript-eslint/camelcase

  function savePropRanges(name: string, data: PropRanges): void;
  function loadPropRanges(name: string): PropRanges | null;
  function saveUniqueScore(name: string, score: number): void;
  function loadUniqueScore(name: string): number | null;
}
