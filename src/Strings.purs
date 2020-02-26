module Strings (trimPrefix) where

import Prelude
import Data.String (Pattern(..), stripPrefix)
import Data.Maybe (fromMaybe)

trimPrefix :: String -> String -> String
trimPrefix p s = fromMaybe "" $ stripPrefix (Pattern p) s
