let toThrowAssertionFailure p =
  Jest.Expect.toThrowMessageRe (Js.Re.fromStringWithFlags "assert" ~flags:"i") p

module Mock_text_editor = struct
  type t

  external to_text_editor: t -> Text_editor.t = "%identity"

  external create: string array -> t = "MockTextEditor"
  [@@bs.module "./mock_text_editor.js"] [@@bs.new]
  external getCursor: t -> int * int = "" [@@bs.send]
  external setCursor: t -> int * int -> unit = "" [@@bs.send]
  external getSelection: t -> (int * int) * (int * int) = "" [@@bs.send]
  external setSelection: t -> int * int -> int * int -> unit = "" [@@bs.send]
  external getLastRow: t -> int = "" [@@bs.send]
  external accept: t -> int -> bool = "" [@@bs.send]
  external getLine: t -> int -> string = "" [@@bs.send]
  external getLines: t -> string array = "" [@@bs.send]
  external insertLine: t -> int -> string -> unit = "" [@@bs.send]
  external deleteLine: t -> int -> unit = "" [@@bs.send]
  external replaceLines: t -> int * int -> string array -> unit = "" [@@bs.send]
  external transact: t -> (unit -> unit [@bs]) -> unit = "" [@@bs.send]
end
