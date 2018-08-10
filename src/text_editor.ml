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

module Selection = struct
  type t = {
    start_cursor: Cursor.t;
    end_cursor: Cursor.t;
  }

  let create ~start_cursor ~end_cursor =
    assert (Point.compare start_cursor end_cursor <= 0);
    { start_cursor; end_cursor }

  let start_cursor sel = sel.start_cursor
  let end_cursor sel = sel.end_cursor
end

module Range = struct
  type t = {
    start_row: int;
    end_row: int;
  }

  let create ~start_row ~end_row =
    assert (start_row >= 0);
    assert (end_row > start_row);
    { start_row; end_row }

  let start_row range = range.start_row
  let end_row range = range.end_row
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
let set_selection t sel =
  let sc = Selection.start_cursor sel in
  let ec = Selection.end_cursor sel in
  let s = (Cursor.row sc, Cursor.column sc) in
  let e = (Cursor.row ec, Cursor.column ec) in
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
