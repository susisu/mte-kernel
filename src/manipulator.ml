module Prim = struct
  module List = struct
    include List

    let relicate n e =
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
  end

  let insert_empty_row row table =
    let (header, body, alignments, width) =
      let open Table.Normalized in
      (header table, body table, alignments table, width table)
    in
    let empty_row = List.relicate width "" in
    if row < 0 then
      match header with
      | Some header -> Table.Normalized.create ~header:(Some empty_row) ~body:(header :: body) ~alignments
      | None -> Table.Normalized.create ~header:(Some empty_row) ~body ~alignments
    else
      Table.Normalized.create ~header ~body:(List.insert row empty_row body) ~alignments
end
