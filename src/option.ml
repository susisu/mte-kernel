let is_none = function
  | None -> true
  | Some _ -> false

let is_some = function
  | None -> false
  | Some _ -> true

let get_exn = function
  | Some x -> x
  | None -> failwith "None"

let map f = function
  | None -> None
  | Some x -> Some (f x)
