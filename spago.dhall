{ name = "collector"
, dependencies = [ "console", "effect", "strings" ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "test/**/*.purs" ]
}
