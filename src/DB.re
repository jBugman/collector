type key = string;

[@bs.val] [@bs.scope "localStorage"]
external getItem: key => Js.Nullable.t(string) = "getItem";

[@bs.val] [@bs.scope "localStorage"]
external setItem: (key, string) => unit = "setItem";

[@bs.val] [@bs.scope "JSON"]
external parseArrayExn: string => array(string) = "parse";

[@bs.val] [@bs.scope "JSON"]
external parsePropRangesExn: string => Source.propRanges = "parse";

let prefix: key = "collector";
let list_key: key = prefix ++ ":list";
let props_key: key = prefix ++ ":props:";
let score_key: key = prefix ++ ":score:";
let propsKey = (name: string): key => props_key ++ name;
let scoreKey = (name: string): key => score_key ++ name;

let loadList = (): array(string) => {
  getItem(list_key)
  |> Js.Nullable.toOption
  |> Js.Option.getWithDefault("[]")
  |> parseArrayExn;
};

let saveList = (items: array(string)) => {
  module Json = Js.Json;

  items |> Json.stringArray |> Json.stringify |> setItem(list_key);
};

let savePropRanges = (name: string, data: Source.propRanges) => {
  module Json = Js.Json;

  data |> Json.stringifyAny |> Js.Option.getExn |> setItem(propsKey(name));
};

let loadPropRanges = (name: string): Js.Nullable.t(Source.propRanges) => {
  let blob = getItem(propsKey(name));
  Js.Nullable.bind(blob, (. s) => parsePropRangesExn(s));
};
