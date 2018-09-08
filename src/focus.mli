(** *)

(** Focus.t represents a focus on a cell. *)
type t =
  | Offset of Point.t * int (* With offset in the cell. *)
  | Select of Point.t       (* With selection of the whole content of the cell. *)
