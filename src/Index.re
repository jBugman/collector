type options = {target: Dom.element};

type app;

[@bs.module "./App.svelte"] [@bs.new]
external createApp: options => app = "default";

[@bs.val] [@bs.scope "document"]
external getElementById: string => option(Dom.element) = "getElementById";

let root = Belt.Option.getExn(getElementById("root"));
createApp({target: root});
