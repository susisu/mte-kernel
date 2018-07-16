(** Syntax.t represents syntax of a table. *)
type t =
  | Md_piped   (** With leading and trailing pipes. *)
  | Md_unpiped (** Without leading nor trailing pipes. *)
