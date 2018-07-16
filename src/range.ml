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
