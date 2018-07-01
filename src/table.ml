module Row = struct
  type t = string list

  let width = List.length
end

type t = {
  header: Row.t option;
  body: Row.t list;
  alignments: Alignment.t option list;
}

module Normalized = struct
  type t = {
    header: Row.t option;
    body: Row.t list;
    alignments: Alignment.t option list;
    width: int;
    height: int;
  }

  let create ~header ~body ~alignments =
    match header with
    | Some header_row ->
      let width = Row.width header_row in
      assert (width > 0);
      assert (List.for_all (fun row -> Row.width row = width) body);
      assert (List.length alignments = width);
      let height = List.length body in
      { header; body; alignments; width; height }
    | None ->
      (* When there is no header, body must have at least one row *)
      let height = List.length body in
      assert (height > 0);
      let width = Row.width @@ List.hd body in
      assert (width > 0);
      assert (List.for_all (fun row -> Row.width row = width) body);
      assert (List.length alignments = width);
      { header; body; alignments; width; height }

  let header table = table.header
  let body table = table.body
  let alignments table = table.alignments
  let width table = table.width
  let height table = table.height
end
