(** *)

(** Point.t is a generic type representing two-dimensional position. *)
type t = {
  row: int;
  column: int;
}

(** Compares two points. Rows are compared first, then columns. *)
val compare: t -> t -> int
