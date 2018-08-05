val toThrowAssertionFailure: [< (unit -> 'a) Jest.Expect.partial] -> Jest.assertion

module Mock_text_editor: sig
  type t

  val to_text_editor: t -> Text_editor.t

  val create: string array -> t
  val get_cursor: t -> int * int
  val set_cursor: t -> int * int -> unit
  val get_selection: t -> (int * int) * (int * int)
  val set_selection: t -> int * int -> int * int -> unit
  val get_last_row: t -> int
  val accepts: t -> int -> bool
  val get_line: t -> int -> string
  val get_lines: t -> string array
  val insert_line: t -> int -> string -> unit
  val delete_line: t -> int -> unit
  val replace_lines: t -> int * int -> string array -> unit
  val transact: t -> (unit -> unit [@bs]) -> unit
end
