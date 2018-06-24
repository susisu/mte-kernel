module Row: sig
  type t = string list

  val width: t -> int
end

type t = {
  header: Row.t option;
  body: Row.t list;
  alignments: Alignment.t list;
}

module Normalized: sig
  type t

  val create: header:Row.t option -> body:Row.t list -> alignments:Alignment.t list -> t
  val header: t -> Row.t option
  val body: t -> Row.t list
  val alignments: t -> Alignment.t list
  val width: t -> int
  val height: t -> int
end
