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
type value = Js.Dict.t(float);
type itemMod = (modName, value);
type range = Js.Dict.t((float, float));
type modRange = (modName, range);

let placeholders = [|"X", "Y", "Z"|];

let generalizeMod = (line: rawExplicitMod): itemMod => {
  module Dict = Js.Dict;

  let valueRegex = [%re "/([+-]?[0-9.]+)/giu"];
  let values = Dict.empty();
  let idx = ref(0);
  let name =
    Js.String.unsafeReplaceBy0(
      valueRegex,
      (match, _, _) => {
        let x = float_of_string(match);
        let i = idx^;
        let p = placeholders[i];
        idx := i + 1;
        Dict.set(values, p, x);
        p;
      },
      line,
    );

  (name, values);
};

type rawRange = string;

let generalizeModRange = (line: rawRange): modRange => {
  module Dict = Js.Dict;

  let rangeRegex = [%re "/[+-]?\\(([0-9.]+)[-–]([0-9.]+)\\)/giu"];
  let values = Dict.empty();
  let idx = ref(0);
  let name =
    Js.String.unsafeReplaceBy2(
      rangeRegex,
      (_, a, b, _, _) => {
        let x = (float_of_string(a), float_of_string(b));
        let i = idx^;
        let p = placeholders[i];
        idx := i + 1;
        Dict.set(values, p, x);
        p;
      },
      line,
    );

  (name, values);
};

let average = (xs: array(float)): float =>
  Array.fold_left((+.), 0., xs) /. float_of_int(Array.length(xs));

let scaleMod = (value: value, range: range): option(float) => {
  module Dict = Js.Dict;

  let score =
    Dict.entries(value)
    |> Array.map(((key, v)) => {
         let (bottom, top) = Dict.unsafeGet(range, key);
         scale(v, bottom, top);
       })
    |> average;

  let inBounds = score >= 0. && score <= 1.;
  inBounds ? Some(score) : None;
};

type itemScores =
  | Scores({
      mods: Js.Dict.t(float),
      score: float,
    })
  | Legacy;

let compareItemStats =
    (mods: array(rawExplicitMod), ranges: array(rawRange)): itemScores => {
  module Dict = Js.Dict;
  module Set = Belt.Set.String;

  let mods = mods |> Array.map(generalizeMod) |> Dict.fromArray;
  let ranges = ranges |> Array.map(generalizeModRange) |> Dict.fromArray;

  let modList =
    Set.intersect(
      mods |> Dict.keys |> Set.fromArray,
      ranges |> Dict.keys |> Set.fromArray,
    );

  let dictSize = xs => xs |> Dict.keys |> Array.length;

  let modCount = Set.size(modList);
  let sc = modCount !== dictSize(mods) || modCount !== dictSize(ranges);
  sc
    ? Legacy
    : {
      let scores =
        modList
        |> Set.toArray
        |> Array.map(key => {
             scaleMod(
               Dict.unsafeGet(mods, key),
               Dict.unsafeGet(ranges, key),
             )
             ->(Belt.Option.map(score => (key, score)))
           });

      let goodScores = Belt.Array.keepMap(scores, x => x);
      let hasOutOfBoundsScore =
        Array.length(goodScores) < Array.length(scores);

      hasOutOfBoundsScore
        ? Legacy
        : {
          let scores = Dict.fromArray(goodScores);
          let totalScore = Dict.values(scores) |> average;
          Scores({mods: scores, score: fixed(totalScore)});
        };
    };
};
