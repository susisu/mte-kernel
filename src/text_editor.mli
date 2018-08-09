module Cursor: sig
  type t

  val create: Point.t -> t

  val row: t -> int
  val column: t -> int
end

module Selection: sig
  type t

  val create: start_cursor:Cursor.t -> end_cursor:Cursor.t -> t

  val start_cursor: t -> Cursor.t
  val end_cursor: t -> Cursor.t
end

type t

val  get_cursor: t -> Cursor.t
val  set_cursor: t -> Cursor.t -> unit
val  set_selection: t -> Cursor.t -> Cursor.t -> unit
val  get_last_row: t -> int
val  accepts: t -> int -> bool
val  get_line: t -> int -> string
val  insert_line: t -> int -> string -> unit
val  delete_line: t -> int -> unit
val  replace_lines: t -> Range.t -> string list -> unit
val  transact: t -> (unit -> unit) -> unit
