type t = {
  start_line: int;
  end_line: int;
}

let create start_line end_line =
  assert (end_line > start_line);
  { start_line; end_line }

let start_line range = range.start_line
let end_line range = range.end_line
