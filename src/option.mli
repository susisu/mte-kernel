(** *)

(** Retrieves the content of an optional value. It thorws error if None is given. *)
val get_exn: 'a option -> 'a
