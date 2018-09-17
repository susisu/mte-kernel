(** *)

(** Includes primitive operations. *)
module Prim: sig
  val insert_empty_row: int -> Table.Normalized.t -> Table.Normalized.t
  val insert_empty_column: int -> Table.Normalized.t -> Table.Normalized.t
  val swap_rows: int -> int -> Table.Normalized.t -> Table.Normalized.t
  val swap_columns: int -> int -> Table.Normalized.t -> Table.Normalized.t
  val set_alignment: int -> Table.Alignment.t option -> Table.Normalized.t -> Table.Normalized.t
end

module State: sig
  type smart_cursor = {
    start: Point.t;
    last: Point.t;
  }

  type t = {
    smart_cursor: smart_cursor option;
  }

  val init: t
end

type t = State.t -> Table.Normalized.t -> Table.Focus.t -> State.t * Table.Normalized.t * Table.Focus.t

val align: Table.Alignment.t option -> t
val select: t
val move_focus: int -> int -> t
