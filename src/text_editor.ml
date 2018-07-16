type t

module Js_interface = struct
  external getCursor: t -> int * int = "" [@@bs.send]
  external setCursor: t -> int * int -> unit = "" [@@bs.send]
  external setSelection: t -> int * int -> int * int -> unit = "" [@@bs.send]
  external getLastRow: t -> int = "" [@@bs.send]
  external accepts: t -> int -> bool = "" [@@bs.send]
  external getLine: t -> int -> string = "" [@@bs.send]
  external insertLine: t -> int -> string -> unit = "" [@@bs.send]
  external deleteLine: t -> int -> unit = "" [@@bs.send]
  external replaceLines: t -> int * int -> string array -> unit = "" [@@bs.send]
  external transact: t -> (unit -> unit [@bs]) -> unit = "" [@@bs.send]
end

let getCursor t =
  let (row, column) = Js_interface.getCursor t in
  Cursor.create ~row ~column
let setCursor t cursor =
  let c = (Cursor.row cursor, Cursor.column cursor) in
  Js_interface.setCursor t c
let setSelection t start_cursor end_cursor =
  let s = (Cursor.row start_cursor, Cursor.column start_cursor) in
  let e = (Cursor.row end_cursor, Cursor.column end_cursor) in
  Js_interface.setSelection t s e
let getLastRow t =
  Js_interface.getLastRow t
let accepts t row =
  Js_interface.accepts t row
let getLine t row =
  Js_interface.getLine t row
let insertLine t row line =
  Js_interface.insertLine t row line
let deleteLine t row =
  Js_interface.deleteLine t row
let replaceLines t range text =
  let r = (Range.start_row range, Range.end_row range) in
  let lines = Array.of_list text in
  Js_interface.replaceLines t r lines
let transact t f =
  Js_interface.transact t (fun [@bs] () -> f ())
