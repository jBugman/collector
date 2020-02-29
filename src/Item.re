type itemClass = string;
// type itemClass =
//   | Jewel;

type rawImplicitMod = string;
type rawExplicitMod = string;

type rawItem = {
  name: string,
  rarity: string,
  ilvl: int,
  itemClass,
  typeLine: string,
  implicitMods: array(rawImplicitMod),
  explicitMods: array(rawExplicitMod),
};

let scale = (x, bottom, top) => (x -. bottom) /. (top -. bottom);

let fixed = x => {
  let s = Js.Float.toFixedWithPrecision(x, ~digits=4);
  Js.Float.fromString(s);
};

type block = string;

let blocks = (text: string): array(block) => {
  let separator = "--------";
  text
  |> Js.String.replaceByRe([%re "/\\r/"], "")
  |> Js.String.split(separator);
};

type lines = array(string);

let getLines = (text: block): lines =>
  Js.String.(text |> trim |> split("\n"));

let rarity = (line: string): string => {
  line |> Utils.trimPrefix("Rarity:") |> Js.String.trim;
};

let parseImplicits = (src: lines): array(rawImplicitMod) =>
  Array.map(Js.String.replaceByRe([%re "/ \\(implicit\\)$/"], ""), src);
