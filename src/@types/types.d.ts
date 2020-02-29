declare module '~/PoeDB.re' {
  function getURL(name: string): string;
}

declare module '~/Utils.re' {
  function trimPrefix(pattern: string, val: string): string;
}
