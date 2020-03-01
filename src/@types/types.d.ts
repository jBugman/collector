declare module '*/Source.re' {
  function poedbURL(name: string): string;
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
