let get_exn = function
  | Some x -> x
  | None -> failwith "None"

let map f = function
  | None -> None
  | Some x -> Some (f x)
