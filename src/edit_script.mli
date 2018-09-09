(** *)

(** A command represents a single operation which can be applied to a text editor. *)
type command =
  | Noop                   (** No operation (used as dummy). *)
  | Insert of int * string (** Insert a line. *)
  | Delete of int          (** Delete a line. *)

(** Applies a script (list of commands) to a text editor.
    @param offset Offset added to the row indices specified by the commands. *)
val apply: Text_editor.t -> offset:int -> command list -> unit

(** Computes the shortest edit script between from_lines to to_lines. When limit is specified, it
    returns None if the edit distance between the arrays are greater than the limit.
*)
val shortest_edit_script: limit:int option -> from_lines:string array -> to_lines:string array
  -> command list option
