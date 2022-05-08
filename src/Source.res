let proxy = "https://cors-anywhere.herokuapp.com/"

let poedbURL = name => {
  let mangledName =
    name |> Js.String.replaceByRe(%re("/'/"), "") |> Js.String.replaceByRe(%re("/ /"), "_")

  proxy ++ ("https://poedb.tw/us/unique.php?n=" ++ mangledName)
}

let wikiURL = name => {
  let mangledName =
    name |> Js.String.replaceByRe(%re("/'/"), "%27") |> Js.String.replaceByRe(%re("/ /"), "_")
  proxy ++
  ("http://webcache.googleusercontent.com/search?q=cache:" ++
  ("https://pathofexile.gamepedia.com/" ++ mangledName))
}

module DOMParser = {
  type t

  @new external new: unit => t = "DOMParser"

  @send
  external method: (t, string, string) => Dom.document = "parseFromString"

  let parseFromString = (source: string) => new() -> method(source, "text/html")
}

type propRanges = {
  implicitMods: array<string>,
  explicitMods: array<string>,
}

let badMods = Belt.Set.String.fromArray(["Avoids Frozen", "Corrupted"])

let filterBadMods = (pps: propRanges): propRanges => {
  let {implicitMods, explicitMods} = pps
  let explicitMods = Belt.Array.keep(explicitMods, x => !Belt.Set.String.has(badMods, x))
  {implicitMods: implicitMods, explicitMods: explicitMods}
}

let parseWiki = (source): propRanges => {
  open Webapi.Dom

  let modLines = (idx, nodes): array<string> => {
    let items = []
    let line = ref("")

    let children =
      nodes
      -> HtmlCollection.item(idx)
      -> Js.Option.getExn
      -> Element.childNodes
      -> NodeList.toArray

    Array.iter(el => {
      let s = line.contents
      if Node.nodeName(el) === "BR" {
        let _ = Js.Array.push(s, items)
        line := ""
      } else {
        let txt = Node.textContent(el)
        line := (s === "" ? txt : s ++ txt)
      }
    }, children)

    if line.contents !== "" {
      let _ = Js.Array.push(line.contents, items)
    }

    items
  }

  let statBlocks =
    DOMParser.parseFromString(source)
    -> Document.getElementsByClassName("item-stats")
    -> HtmlCollection.item(0)
    -> Js.Option.getExn
    -> Element.getElementsByClassName("group -mod")

  if HtmlCollection.length(statBlocks) === 1 {
    {
      implicitMods: [],
      explicitMods: modLines(0, statBlocks),
    }
  } else {
    {
      implicitMods: modLines(0, statBlocks),
      explicitMods: modLines(1, statBlocks),
    }
  }
}

let getWikiInfo = (name: string) => {
  open Promise
  open Webapi.Fetch

  let url = wikiURL(name)
  fetchWithInit(url, RequestInit.make(~mode=CORS, ()))
  -> then(Response.text)
  -> then(parseWiki -> resolve)
}
