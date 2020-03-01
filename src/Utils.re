let trimPrefix = (p, s) => {
  let re = Js.Re.fromString("^" ++ p);
  Js.String.replaceByRe(re, "", s);
};

let dictSize = xs => xs |> Js.Dict.keys |> Array.length;

let filterSome = xs => Belt.Array.keepMap(xs, x => x);

let average = (xs: array(float)): option(float) => {
  let size = Array.length(xs);
  size === 0
    ? None
    : {
      let x = Array.fold_left((+.), 0., xs) /. float_of_int(size);
      Some(x);
    };
};
