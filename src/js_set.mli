(** Binding of JavaScript Set *)

type 'a t

val make: unit -> 'a t

val add: 'a t -> 'a -> unit
val delete: 'a t -> 'a -> unit
val clear: 'a t -> unit
val has: 'a t -> 'a -> bool
val size: 'a t -> int

val of_string: string -> string t
val of_array: 'a array -> 'a t
