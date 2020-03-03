type options = {target: Dom.element};

type app;

[@bs.module "./App.svelte"] [@bs.new]
external createApp: options => app = "default";

let root =
  Webapi.Dom.(Document.getElementById("root", document))->Js.Option.getExn;

createApp({target: root});
