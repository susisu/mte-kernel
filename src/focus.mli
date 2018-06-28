module Pointed: sig
  type t

  val row: t -> int
  val column: t -> int
  val offset: t -> int
end

module Selected: sig
  type t

  val row: t -> int
  val column: t -> int
end

type t =
  | Pointed of Pointed.t
  | Selected of Selected.t

val create_pointed: int -> int -> int -> t
val create_selected: int -> int -> t
