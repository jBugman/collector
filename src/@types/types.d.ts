declare module '*/Source.res' {
  type PropRanges = import('../types').PropRanges;

  function poedbURL(name: string): string;
  function getWikiInfo(name: string): Promise<PropRanges>;
  function filterBadMods(mods: PropRanges): PropRanges;
}

declare module '*/Utils.res' {
  function trimPrefix(pattern: string, val: string): string;
}

declare module '*/Item.res' {
  type RawItem = import('../types').RawItem;

  function blocks(text: string): string[];
  function getLines(text: string): string[];
  function rarity(line: string): string;
  function parseImplicits(lines: string[]): string[];

  type ItemClassT = number;

  interface ItemClass {
    weapon: ItemClassT;
    armour: ItemClassT;

    fromTypeLine: (line: string) => ItemClassT;
    isArmour: (line: string) => boolean;
  }

  function shouldStripInstructions(item: RawItem): boolean;

  const ItemClass: ItemClass;

  interface ItemScores {
    mods: Record<string, number>;
    score: number;
  }

  function compareItemStatsNullable(mods: string[], ranges: string[]): ItemScores | null;
}

declare module '*/DB.res' {
  type PropRanges = import('../types').PropRanges;

  const props_key: string; // eslint-disable-line camelcase,@typescript-eslint/camelcase
  const score_key: string; // eslint-disable-line camelcase,@typescript-eslint/camelcase

  function savePropRanges(name: string, data: PropRanges): void;
  function loadPropRanges(name: string): PropRanges | null;
  function saveUniqueScore(name: string, score: number): void;
  function loadUniqueScore(name: string): number | null;
}
