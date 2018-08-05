let toThrowAssertionFailure p =
  Jest.Expect.toThrowMessageRe (Js.Re.fromStringWithFlags "assert" ~flags:"i") p

module Mock_text_editor = struct
  type t

  external to_text_editor: t -> Text_editor.t = "%identity"

  external create: string array -> t = "MockTextEditor"
  [@@bs.module "./mock_text_editor.js"] [@@bs.new]
  external get_cursor: t -> int * int = "getCursor" [@@bs.send]
  external set_cursor: t -> int * int -> unit = "setCursor" [@@bs.send]
  external get_selection: t -> (int * int) * (int * int) = "getSelection" [@@bs.send]
  external set_selection: t -> int * int -> int * int -> unit = "setSelection" [@@bs.send]
  external get_last_row: t -> int = "getLastRow" [@@bs.send]
  external accepts: t -> int -> bool = "accepts" [@@bs.send]
  external get_line: t -> int -> string = "getLine" [@@bs.send]
  external get_lines: t -> string array = "getLines" [@@bs.send]
  external insert_line: t -> int -> string -> unit = "insertLine" [@@bs.send]
  external delete_line: t -> int -> unit = "deleteLine" [@@bs.send]
  external replace_lines: t -> int * int -> string array -> unit = "replaceLines" [@@bs.send]
  external transact: t -> (unit -> unit [@bs]) -> unit = "transact" [@@bs.send]
end
