type t

val  getCursor: t -> Cursor.t
val  setCursor: t -> Cursor.t -> unit
val  setSelection: t -> Cursor.t -> Cursor.t -> unit
val  getLastRow: t -> int
val  accepts: t -> int -> bool
val  getLine: t -> int -> string
val  insertLine: t -> int -> string -> unit
val  deleteLine: t -> int -> unit
val  replaceLines: t -> Range.t -> string list -> unit
val  transact: t -> (unit -> unit) -> unit
