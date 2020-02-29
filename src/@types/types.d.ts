declare module '~/Source.re' {
  function poedbURL(name: string): string;
}

declare module '~/Utils.re' {
  function trimPrefix(pattern: string, val: string): string;
}

declare module '~/Item.re' {
  function scale(x: number, bottom: number, top: number): number;
  function fixed(x: number): number;
  function blocks(text: string): string[];
}
