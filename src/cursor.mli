(** *)

(** Cursor.t represents a position in the text editor. *)
type t

(** Creates a new cursor.
    @param row Row index. Must be >= 0.
    @param column Column index. Must be >= 0.
*)
val create: row:int -> column:int -> t

(** Gets row index of the given cursor. *)
val row: t -> int

(** Gets column index of the given cursor. *)
val column: t -> int
