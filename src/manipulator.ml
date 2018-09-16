module Prim = struct
  module List = struct
    include List

    let replicate n e =
      let rec loop n xs =
        if n > 0 then loop (n - 1) (e :: xs)
        else xs
      in
      loop n []

    let insert i x xs =
      let rec loop j xs ys =
        match xs with
        | [] ->
          if j <= i then x :: ys
          else ys
        | x' :: xs' ->
          if j = i then loop (j + 1) xs (x :: ys)
          else loop (j + 1) xs' (x' :: ys)
      in
      loop 0 xs [] |> List.rev

    let swap i j xs =
      let xi = List.nth xs i in
      let xj = List.nth xs j in
      let rec loop k xs ys =
        match xs with
        | [] -> ys
        | x :: xs ->
          let xk =
            if k = i then xj
            else if k = j then xi
            else x
          in
          loop (k + 1) xs (xk :: ys)
      in
      loop 0 xs [] |> List.rev

    let set i x xs =
      List.mapi (fun j x' -> if i = j then x else x') xs
  end

  let insert_empty_row row table =
    let (header, body, alignments, width) =
      let open Table.Normalized in
      (header table, body table, alignments table, width table)
    in
    let empty_row = List.replicate width "" in
    let row = max row 0 in
    Table.Normalized.create ~header ~body:(List.insert row empty_row body) ~alignments

  let insert_empty_column column table =
    let (header, body, alignments) =
      let open Table.Normalized in
      (header table, body table, alignments table)
    in
    let column = max column 0 in
    let insert = List.insert column "" in
    Table.Normalized.create
      ~header:(Option.map insert header)
      ~body:(List.map insert body)
      ~alignments:(List.insert column None alignments)

  let swap_rows row_i row_j table =
    let (header, body, alignments) =
      let open Table.Normalized in
      (header table, body table, alignments table)
    in
    Table.Normalized.create ~header ~body:(List.swap row_i row_j body) ~alignments

  let swap_columns column_i column_j table =
    let (header, body, alignments) =
      let open Table.Normalized in
      (header table, body table, alignments table)
    in
    let swap xs = List.swap column_i column_j xs in
    Table.Normalized.create
      ~header:(Option.map swap header)
      ~body:(List.map swap body)
      ~alignments:(swap alignments)

  let set_alignment column alignment table =
    let (header, body, alignments) =
      let open Table.Normalized in
      (header table, body table, alignments table)
    in
    Table.Normalized.create
      ~header
      ~body
      ~alignments:(List.set column alignment alignments)
end

module State = struct
  type smart_cursor = {
    start: Point.t;
    last: Point.t;
  }

  type t = {
    smart_cursor: smart_cursor option;
  }

  let init = {
    smart_cursor = None;
  }
end
