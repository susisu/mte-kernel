module Cursor = struct
  type t = Point.t

  let create point =
    let open Point in
    assert (point.row >= 0);
    assert (point.column >= 0);
    point

  let row cursor = cursor.Point.row
  let column cursor = cursor.Point.column
end

type t

module Js_intf = struct
  external get_cursor: t -> int * int = "getCursor" [@@bs.send]
  external set_cursor: t -> int * int -> unit = "setCursor" [@@bs.send]
  external set_selection: t -> int * int -> int * int -> unit = "setSelection" [@@bs.send]
  external get_last_row: t -> int = "getLastRow" [@@bs.send]
  external accepts: t -> int -> bool = "accepts" [@@bs.send]
  external get_line: t -> int -> string = "getLine" [@@bs.send]
  external insert_line: t -> int -> string -> unit = "insertLine" [@@bs.send]
  external delete_line: t -> int -> unit = "deleteLine" [@@bs.send]
  external replace_lines: t -> int * int -> string array -> unit = "replaceLines" [@@bs.send]
  external transact: t -> (unit -> unit [@bs]) -> unit = "transact" [@@bs.send]
end

let get_cursor t =
  let (row, column) = Js_intf.get_cursor t in
  Cursor.create { row; column }
let set_cursor t cursor =
  let c = (Cursor.row cursor, Cursor.column cursor) in
  Js_intf.set_cursor t c
let set_selection t start_cursor end_cursor =
  let s = (Cursor.row start_cursor, Cursor.column start_cursor) in
  let e = (Cursor.row end_cursor, Cursor.column end_cursor) in
  Js_intf.set_selection t s e
let get_last_row t =
  Js_intf.get_last_row t
let accepts t row =
  Js_intf.accepts t row
let get_line t row =
  Js_intf.get_line t row
let insert_line t row line =
  Js_intf.insert_line t row line
let delete_line t row =
  Js_intf.delete_line t row
let replace_lines t range text =
  let r = (Range.start_row range, Range.end_row range) in
  let lines = Array.of_list text in
  Js_intf.replace_lines t r lines
let transact t f =
  Js_intf.transact t (fun [@bs] () -> f ())
