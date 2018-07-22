(** *)

module Pointed: sig
  (** Pointed.t represents a focus which points a specific position (offset) in a cell. *)
  type t

  (** Gets the row index of the given focus. *)
  val row: t -> int

  (** Gets the column index of the given focus. *)
  val column: t -> int

  (** Gets the offset position in the focused cell. *)
  val offset: t -> int
end

module Selected: sig
  (** Selected.t represents a focus which selects whole content of a cell. *)
  type t

  (** Gets the row index of the given focus. *)
  val row: t -> int

  (** Gets the column index of the given focus. *)
  val column: t -> int
end

(** Focus.t represents a focus on a cell. *)
type t =
  | Pointed of Pointed.t   (** Points a specific position (offset) in the cell. *)
  | Selected of Selected.t (** Selects the whole content of the cell. *)

(** Creates a new pointed focus.
    @param row Row index. Negative index means the focus is in the table header.
    @param column Column index. Must be >= 0.
    @param offset Offset in the focused cell. Must be >= 0.
*)
val create_pointed: row:int -> column:int -> offset:int -> t

(** Creates a new selected focus.
    @param row Row index. Negative index means the focus is in the table header.
    @param column Column index. Must be >= 0.
*)
val create_selected: row:int -> column:int -> t
