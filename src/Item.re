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
type range = Js.Dict.t(option((float, float)));
type modRange = (modName, range);

let placeholders = [|"X", "Y", "Z"|];
let valueRegex = [%re "/([+-]?[0-9.]+)/giu"];

let generalizeMod = (line: rawExplicitMod): itemMod => {
  module Dict = Js.Dict;

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

  let updateState = v => {
    let i = idx^;
    let p = placeholders[i];
    idx := i + 1;
    Dict.set(values, p, v);
    p;
  };

  let name =
    line
    |> Js.String.unsafeReplaceBy2(
         rangeRegex,
         (_, a, b, _, _) => {
           let x = (float_of_string(a), float_of_string(b));
           updateState(Some(x));
         },
       )
    |> Js.String.unsafeReplaceBy0(valueRegex, (_, _, _) => updateState(None));

  (name, values);
};

type modScale('a) =
  | Score('a)
  | OutOfBounds
  | Constant;

let scaleMod = (value: value, range: range): modScale(float) => {
  module Dict = Js.Dict;

  let score =
    Dict.entries(value)
    |> Array.map(((key, v)) => {
         let r = Dict.unsafeGet(range, key);
         switch (r) {
         | Some((bottom, top)) => Some(scale(v, bottom, top) |> fixed)
         | None => None
         };
       })
    |> Utils.filterSome
    |> Utils.average;

  switch (score) {
  | None => Constant
  | Some(score) =>
    let inBounds = score >= 0. && score <= 1.;
    inBounds ? Score(score) : OutOfBounds;
  };
};

type itemScores = {
  mods: Js.Dict.t(float),
  score: float,
};
type anyItemScores =
  | Scores(itemScores)
  | Legacy;

let compareItemStats =
    (mods: array(rawExplicitMod), ranges: array(rawRange)): anyItemScores => {
  module Dict = Js.Dict;
  module Set = Belt.Set.String;

  let mods = mods |> Array.map(generalizeMod) |> Dict.fromArray;
  let ranges = ranges |> Array.map(generalizeModRange) |> Dict.fromArray;

  let modList =
    Set.intersect(
      mods |> Dict.keys |> Set.fromArray,
      ranges |> Dict.keys |> Set.fromArray,
    );

  let modCount = Set.size(modList);
  let sc =
    modCount !== Utils.dictSize(mods) || modCount !== Utils.dictSize(ranges);
  sc
    ? Legacy
    : {
      let scores =
        modList
        |> Set.toArray
        |> Array.map(key => {
             let score =
               scaleMod(
                 Dict.unsafeGet(mods, key),
                 Dict.unsafeGet(ranges, key),
               );
             switch (score) {
             | Score(x) => Score((key, x))
             | OutOfBounds => OutOfBounds
             | Constant => Constant
             };
           });

      let hasOutOfBoundsScore =
        Belt.Array.some(scores, x =>
          switch (x) {
          | OutOfBounds => true
          | _ => false
          }
        );

      hasOutOfBoundsScore
        ? Legacy
        : {
          let goodScores =
            Belt.Array.keepMap(scores, x =>
              switch (x) {
              | Score(x) => Some(x)
              | Constant => None
              | OutOfBounds => None
              }
            );
          let scores = Dict.fromArray(goodScores);
          let totalScore = Dict.values(scores) |> Utils.average;
          let totalScore = Js.Option.getExn(totalScore); // raises Error
          Scores({mods: scores, score: fixed(totalScore)});
        };
    };
};

let compareItemStatsNullable =
    (mods: array(rawExplicitMod), ranges: array(rawRange))
    : Js.Nullable.t(itemScores) =>
  switch (compareItemStats(mods, ranges)) {
  | Scores(result) => Js.Nullable.return(result)
  | Legacy => Js.Nullable.null
  };
