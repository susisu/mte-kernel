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

let pad text = " " ^ text ^ " "

let space size = Js.String.repeat size " "

let align tw_opts (al: Alignment.t) width text =
  let space_size = width - compute_text_width tw_opts text in
  assert (space_size > 0);
  match al with
  | Left -> text ^ space space_size
  | Right -> space space_size ^ text
  | Center ->
    let left = space_size / 2 in
    let right = space_size - left in
    space left ^ text ^ space right

type delimiter_alignment_position =
  | Outside
  | Inside

let delimiter_text al_pos (al: Alignment.t option) width =
  let (left, right) = match (al_pos, al) with
    | (Outside, None) -> (" ", " ")
    | (Outside, Some Left) -> (":", " ")
    | (Outside, Some Right) -> (" ", ":")
    | (Outside, Some Center) -> (":", ":")
    | (Inside, None) -> (" ", " ")
    | (Inside, Some Left) -> (" :", " ")
    | (Inside, Some Right) -> (" ", ": ")
    | (Inside, Some Center) -> (" :", ": ")
  in
  let bar_width = width + 2 - Js.String.length left - Js.String.length right in
  assert (bar_width > 0);
  let bar = Js.String.repeat bar_width "-" in
  left ^ bar ^ right
