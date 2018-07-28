(** *)

(** The Iterator module provides very low level interface of iterator. *)
module Iterator: sig
  type 'a t

  (** Creates a new iterator. *)
  val create: (unit -> 'a option) -> 'a t

  (** Gets the next value of the iterator.
      It returns None when the iterator is done, and it always return None after that.
  *)
  val next: 'a t -> 'a option
end

type 'a t

(** Creates a new iterable. *)
val create: (unit -> 'a Iterator.t) -> 'a t

(** Creates a new iterator. *)
val iterator: 'a t -> 'a Iterator.t

(** Coverts an iterable to a list. *)
val to_list: 'a t -> 'a list

(** Iterates over an iterable and calls the given function on each generated value. *)
val iterate: 'a t -> f:('a -> unit) -> unit

(** Folds an iterable by the given function from left to right. *)
val fold_left: 'a t -> init:'b -> f:('b -> 'a -> 'b) -> 'b

(** Folds an iterable by the given function from right to left. *)
val fold_right: 'a t -> init:'b -> f:('b -> 'a -> 'b) -> 'b

(** Creates a new iterator which generates values mapped by the ginven function. *)
val map: 'a t -> f:('a -> 'b) -> 'b t

(** Creates a new iterator which generates values filtered by the ginven function. *)
val filter: 'a t -> f:('a -> bool) -> 'a t

(** Converts a string to an iterable. *)
val of_string: string -> string t

(** Converts an array to an iterable. *)
val of_array: 'a array -> 'a t
