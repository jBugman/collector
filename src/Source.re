let poedbURL = name => {
  let proxy = "https://cors-anywhere.herokuapp.com/";
  let mangledName =
    name
    |> Js.String.replaceByRe([%re "/'/"], "")
    |> Js.String.replaceByRe([%re "/ /"], "_");

  proxy ++ "https://poedb.tw/us/unique.php?n=" ++ mangledName;
};
