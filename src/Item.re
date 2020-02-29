type itemClass = string;

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

type modName = string;
type itemMod = {
  name: modName,
  values: Js.Dict.t(float),
};
type modRange = {
  name: modName,
  values: Js.Dict.t((float, float)),
};

let placeholders = [|"X", "Y", "Z"|];

let generalizeMod = (line: rawExplicitMod): itemMod => {
  let valueRegex = [%re "/([+-]?[0-9.]+)/giu"];
  let values = Js.Dict.empty();
  let idx = ref(0);
  let name =
    Js.String.unsafeReplaceBy0(
      valueRegex,
      (match, _, _) => {
        let x = float_of_string(match);
        let i = idx^;
        let p = placeholders[i];
        idx := i + 1;
        Js.Dict.set(values, p, x);
        p;
      },
      line,
    );

  {name, values};
};

let generalizeModRange = (line: string): modRange => {
  let rangeRegex = [%re "/[+-]?\\(([0-9.]+)[-–]([0-9.]+)\\)/giu"];
  let values = Js.Dict.empty();
  let idx = ref(0);
  let name =
    Js.String.unsafeReplaceBy2(
      rangeRegex,
      (_, a, b, _, _) => {
        let x = (float_of_string(a), float_of_string(b));
        let i = idx^;
        let p = placeholders[i];
        idx := i + 1;
        Js.Dict.set(values, p, x);
        p;
      },
      line,
    );

  {name, values};
};
