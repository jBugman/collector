type options = {target: Dom.element}

type app

@module("./App.svelte") @new
external createApp: options => app = "default"

let root = {
  open Webapi.Dom
  Document.getElementById(document, "root")
}->Js.Option.getExn

let _ = createApp({target: root})
