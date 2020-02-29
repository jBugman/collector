type rawItem = {
  name: string,
  rarity: string,
  ilvl: int,
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

let getLines = (text: block): array(string) =>
  Js.String.(text |> trim |> split("\n"));

let rarity = (line: string): string => {
  line |> Utils.trimPrefix("Rarity:") |> Js.String.trim;
};
