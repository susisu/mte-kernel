(** *)

module Focus_point: sig
  (** Focus_point.t represents a focus which specifies a cell and offset position in it. *)
  type t

  (** Gets the position of the focused cell. *)
  val pos: t -> Point.t

  (** Gets the offset position in the focused cell. *)
  val offset: t -> int
end

module Focus_select: sig
  (** Focus_select.t represents a focus which specifies a cell and selects its content. *)
  type t

  (** Gets the position of the focused cell. *)
  val pos: t -> Point.t
end

(** Focus.t represents a focus on a cell. *)
type t =
  | Point of Focus_point.t   (** Points a specific position (offset) in the focused cell. *)
  | Select of Focus_select.t (** Selects the whole content of the focused cell. *)

(** Creates a new focus specifying a offset position in the focused cell
    @param pos Position of the focused cell in the table. Negative row index means the focus is in
    the table header, and column index must be >= 0.
    @param offset Offset in the focused cell. Must be >= 0.
*)
val create_point: pos:Point.t -> offset:int -> t

(** Creates a new focus selecting the content of the focused cell.
  @param pos Position of the focused cell in the table. Negative row index means the focus is in
  the table header, and column index must be >= 0.
*)
val create_select: pos:Point.t -> t
