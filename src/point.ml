type t = {
  row: int;
  column: int;
}

let compare p q =
  if p.row < q.row then -1
  else if p.row > q.row then 1
  else if p.column < q.column then -1
  else if p.column > q.column then 1
  else 0
