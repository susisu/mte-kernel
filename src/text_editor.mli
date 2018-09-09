(** *)

module Cursor: sig
  (** Cursor.t represents a position of a cursor in the text editor. *)
  type t

  (** Creates a cursor. Rows and columns must be >= 0. *)
  val create: Point.t -> t

  (** Gets the row of a cursor. *)
  val row: t -> int

  (** Gets the column of a cursor. *)
  val column: t -> int
end

module Selection: sig
  (** Selection.t represents a selection in the text editor, consists of two cursors. *)
  type t

  (** Creates a new selection. *)
  val create: start_cursor:Cursor.t -> end_cursor:Cursor.t -> t

  (** Gets the start position (cursor) of the selection. *)
  val start_cursor: t -> Cursor.t

  (** Gets the end position (cursor) of the selection. *)
  val end_cursor: t -> Cursor.t
end

module Range: sig
  (** Range.t represents a range of rows in the text editor. *)
  type t

  (** Creates a new range.
      @param start_row must Start row index of the range. Must be >= 0.
      @param end_row End row index of the range. It is exclusive i.e. the row at `end_row` is not
      included in the range. Must be greater than `start_row`.
  *)
  val create: start_row:int -> end_row:int -> t

  (** Gets start row index of the given range. *)
  val start_row: t -> int

  (** Gets end row index of the given range. *)
  val end_row: t -> int
end

type t

val  get_cursor: t -> Cursor.t
val  set_cursor: t -> Cursor.t -> unit
val  set_selection: t -> Selection.t -> unit
val  get_last_row: t -> int
val  accepts: t -> int -> bool
val  get_line: t -> int -> string
val  insert_line: t -> int -> string -> unit
val  delete_line: t -> int -> unit
val  replace_lines: t -> Range.t -> string list -> unit
val  transact: t -> (unit -> unit) -> unit
