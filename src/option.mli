(** *)

(** Retrieves the content of an optional value. It thorws error if None is given. *)
val get_exn: 'a option -> 'a

(** Maps an optional value with a given function. *)
val map: ('a -> 'b) -> 'a option -> 'b option
