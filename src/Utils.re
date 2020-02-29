let trimPrefix = (p, s) => {
  let re = Js.Re.fromString("^" ++ p);
  Js.String.replaceByRe(re, "", s);
};
