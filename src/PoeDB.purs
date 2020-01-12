module PoeDB (getURL) where

import Prelude
import Data.String (Pattern(..), Replacement(..), replace)


proxy :: String
proxy = "https://cors-anywhere.herokuapp.com/" -- TODO: use own proxy

getURL :: String -> String
getURL name = proxy <> "https://poedb.tw/us/unique.php?n=" <> mangledName
  where
    mangledName = replace (Pattern "'") (Replacement "")
                $ replace (Pattern " ") (Replacement "_")
                $ name
