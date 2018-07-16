(** *)

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
