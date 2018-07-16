module Pointed = struct
  type t = {
    row: int;
    column: int;
    offset: int;
  }

  let create row column offset =
    assert (column >= 0);
    assert (offset >= 0);
    { row; column; offset }

  let row focus = focus.row
  let column focus = focus.column
  let offset focus = focus.offset
end

module Selected = struct
  type t = {
    row: int;
    column: int;
  }

  let create row column =
    assert (column >= 0);
    { row; column }

  let row focus = focus.row
  let column focus = focus.column
end

type t =
  | Pointed of Pointed.t
  | Selected of Selected.t

let create_pointed row column offset = Pointed (Pointed.create row column offset)
let create_selected row column = Selected (Selected.create row column)
