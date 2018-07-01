val toThrowAssertionFailure: [< (unit -> 'a) Jest.Expect.partial] -> Jest.assertion

module Mock_text_editor: sig
  type t

  val to_text_editor: t -> Text_editor.t

  val create: string array -> t
  val getCursor: t -> int * int
  val setCursor: t -> int * int -> unit
  val getSelection: t -> (int * int) * (int * int)
  val setSelection: t -> int * int -> int * int -> unit
  val getLastRow: t -> int
  val accept: t -> int -> bool
  val getLine: t -> int -> string
  val getLines: t -> string array
  val insertLine: t -> int -> string -> unit
  val deleteLine: t -> int -> unit
  val replaceLines: t -> int * int -> string array -> unit
  val transact: t -> (unit -> unit [@bs]) -> unit
end
