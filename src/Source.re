let proxy = "https://cors-anywhere.herokuapp.com/";

let poedbURL = name => {
  let mangledName =
    name
    |> Js.String.replaceByRe([%re "/'/"], "")
    |> Js.String.replaceByRe([%re "/ /"], "_");

  proxy ++ "https://poedb.tw/us/unique.php?n=" ++ mangledName;
};

let wikiURL = name => {
  let mangledName =
    name
    |> Js.String.replaceByRe([%re "/'/"], "%27")
    |> Js.String.replaceByRe([%re "/ /"], "_");
  proxy ++ "https://pathofexile.gamepedia.com/" ++ mangledName;
};

module Parser = {
  type t;

  [@bs.new] external make: unit => t = "DOMParser";

  [@bs.send.pipe: t]
  external fromString: (string, string) => Dom.document = "parseFromString";

  let parseHTML = (source: string) => {
    make() |> fromString(source, "text/html");
  };
};

type propRanges = {
  implicitMods: array(string),
  explicitMods: array(string),
};

let badMods = Belt.Set.String.fromArray([|"Avoids Frozen"|]);

let filterBadMods = (pps: propRanges): propRanges => {
  let {implicitMods, explicitMods} = pps;
  let explicitMods =
    Belt.Array.keep(explicitMods, x => !Belt.Set.String.has(badMods, x));
  {implicitMods, explicitMods};
};

let parseWiki = (source): propRanges => {
  open Webapi.Dom;

  let modLines = (idx, nodes): array(string) => {
    let items = [||];
    let line = ref("");

    let children =
      nodes
      |> HtmlCollection.item(idx)
      |> Js.Option.getExn
      |> Element.childNodes
      |> NodeList.toArray;

    Array.iter(
      el => {
        let s = line^;
        if (Node.nodeName(el) === "BR") {
          let _ = Js.Array.push(s, items);
          line := "";
        } else {
          let txt = Node.textContent(el);
          line := s === "" ? txt : s ++ txt;
        };
      },
      children,
    );

    if (line^ !== "") {
      let _ = Js.Array.push(line^, items);
      ();
    };

    items;
  };

  let statBlocks =
    Parser.parseHTML(source)
    |> Document.getElementsByClassName("item-stats")
    |> HtmlCollection.item(0)
    |> Js.Option.getExn
    |> Element.getElementsByClassName("-mod");

  if (HtmlCollection.length(statBlocks) === 1) {
    {implicitMods: [||], explicitMods: modLines(0, statBlocks)};
  } else {
    {
      implicitMods: modLines(0, statBlocks),
      explicitMods: modLines(1, statBlocks),
    };
  };
};

let getWikiInfo = (name: string): Js.Promise.t(propRanges) => {
  open Js.Promise;

  let url = wikiURL(name);
  Fetch.fetchWithInit(url, Fetch.RequestInit.make(~mode=CORS, ()))
  |> then_(Fetch.Response.text)
  |> then_(text => text |> parseWiki |> resolve);
};
