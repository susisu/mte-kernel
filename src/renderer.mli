type text_width_options = {
  normalize: bool;
  wide_chars: string Js_set.t;
  narrow_chars: string Js_set.t;
  ambiguous_as_wide: bool;
}

val compute_text_width: text_width_options -> string -> int
