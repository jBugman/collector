module ItemClass = {
  type t =
    | NULL
    | Weapon
    | Armour
    | Jewelry
    | Jewel
    | Map
    | Flask;

  // TS constants
  let weapon = Weapon;
  let armour = Armour;
  let jewelry = Jewelry;
  let jewel = Jewel;
  let map = Map;
  let flask = Flask;

  let fromTypeLine = (line: string): t => {
    let contains = (tp, xs) => Belt.Array.some(xs, x => x === tp);

    let words = Js.String.split(" ", line);

    switch (true) {
    | _ when contains("Jewel", words) => Jewel
    | _ when contains("Amulet", words) => Jewelry
    | _ => NULL
    };
  };

  let isArmour = (line: string): bool => {
    let hasPrefix = s => Js.String.startsWith(s, line);

    hasPrefix("Armour:")
    || hasPrefix("Evasion Rating:")
    || hasPrefix("Energy Shield:");
  };
};

type rawImplicitMod = string;
type rawExplicitMod = string;

type rawItem = {
  name: string,
  rarity: string,
  ilvl: int,
  itemClass: ItemClass.t,
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
  let unusablePrefix = [%re
    "/You cannot use this item\\. Its stats will be ignored\\n--------\\n/"
  ];
  let separator = "--------";
  text
  |> Js.String.replaceByRe(unusablePrefix, "")
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

[@bs.send.pipe: string]
external replaceCustom:
  (Js.Re.t, (string, string, option(string), string) => string) => string =
  "replace";

type rawRange = string;

let generalizeModRange = (line: rawRange): modRange => {
  module Dict = Js.Dict;

  let rangeRegex = [%re
    "/([+-]?\\((-?[0-9.]+)[-–](-?[0-9.]+)\\)|([+-]?[0-9.]+))/giu"
  ];
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
    |> replaceCustom(rangeRegex, (_, _, range1, range2) => {
         switch (range1) {
         | Some(range1) =>
           let x = (float_of_string(range1), float_of_string(range2));
           updateState(Some(x));

         | None => updateState(None)
         }
       });

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
          let constantsOnly =
            Belt.Array.every(scores, x =>
              switch (x) {
              | Constant => true
              | _ => false
              }
            );
          constantsOnly
            ? Scores({mods: Dict.fromList([]), score: 1.0})
            : {
              let totalScore =
                Belt.Array.keepMap(scores, x => {
                  switch (x) {
                  | Score((_, v)) => Some(v)
                  | _ => None
                  }
                })
                |> Utils.average
                |> Js.Option.getExn; // raises Error

              let usefulScores =
                Belt.Array.keepMap(scores, x =>
                  switch (x) {
                  | Score((k, v)) => Some((k, fixed(v)))
                  | _ => None
                  }
                )
                |> Dict.fromArray;

              Scores({mods: usefulScores, score: fixed(totalScore)});
            };
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
