type t = {
  row: int;
  column: int;
}

let create row column =
  assert (row >= 0);
  assert (column >= 0);
  { row; column }

let row cursor = cursor.row
let column cursor = cursor.column
