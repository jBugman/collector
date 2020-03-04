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
  function scoreKey(name: string): string;

  function loadList(): string[];
  function saveList(items: string[]): void;

  function savePropRanges(name: string, data: PropRanges): void;
  function loadPropRanges(name: string): PropRanges | null;
}
