(* specialized for int *)
let max (x: int) (y: int) = max x y

(* maximum in list *)
let maximum = List.fold_left max min_int

(* takes n items from head in list *)
let take n xs =
  let rec loop r xs ys =
    if r = 0 then List.rev ys
    else match xs with
      | x :: xs' -> loop (r - 1) xs' (x :: ys)
      | [] -> List.rev ys
  in
  loop n xs []

(* creates a list with n items *)
let replicate n x =
  let rec loop r xs =
    if r = 0 then xs
    else loop (r - 1) (x :: xs)
  in
  loop n []

(* creates a list filled with x to have length n *)
let fill n x xs =
  let l = List.length xs in
  if l >= n then xs
  else List.append xs (replicate (n - l) x)

let normalize table =
  let body = Table.body table in
  let alignments = Table.alignments table in
  match Table.header table with
  | Some header ->
    let max_width = maximum (1 :: List.map List.length (header :: body)) in
    Table.Normalized.create
      ~header:(Some (fill max_width "" header))
      ~body:(List.map (fill max_width "") body)
      ~alignments:(take max_width @@ fill max_width None alignments)
  | None ->
    if List.length body = 0 then
      Table.Normalized.create
        ~header:(Some [""])
        ~body:[]
        ~alignments:[None]
    else
      let max_width = maximum (1 :: List.map List.length body) in
      Table.Normalized.create
        ~header:None
        ~body:(List.map (fill max_width "") body)
        ~alignments:(take max_width @@ fill max_width None alignments)
