module Prim: sig
  val insert_empty_row: int -> Table.Normalized.t -> Table.Normalized.t
  val insert_empty_column: int -> Table.Normalized.t -> Table.Normalized.t
end
