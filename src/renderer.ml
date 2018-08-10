type text_width_options = {
  normalize: bool;
  wide_chars: string Js_set.t;
  narrow_chars: string Js_set.t;
  ambiguous_as_wide: bool;
}

let compute_text_width tw_opts text =
  let {
    normalize;
    wide_chars;
    narrow_chars;
    ambiguous_as_wide;
  } = tw_opts in
  let text =
    if normalize then Js.String.normalizeByForm "NFC" text
    else text
  in
  let iter = Iterable.of_string text in
  Iterable.fold_left iter ~init:0 ~f:(fun width c ->
      let w =
        if Js_set.has wide_chars c then 2
        else if Js_set.has narrow_chars c then 1
        else
          match Option.get_exn (Meaw.eaw c) with
          | F | W -> 2
          | A -> if ambiguous_as_wide then 2 else 1
          | _ -> 1
      in
      width + w
    )
