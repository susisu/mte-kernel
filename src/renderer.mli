type text_width_options = {
  normalize: bool;
  wide_chars: string Js_set.t;
  narrow_chars: string Js_set.t;
  ambiguous_as_wide: bool;
}

val compute_text_width: text_width_options -> string -> int
val pad: string -> string
val align: Alignment.t -> text_width_options -> int -> string -> string

type delimiter_alignment_position =
  | Outside
  | Inside

val delimiter_text: delimiter_alignment_position -> Alignment.t option -> int -> string
