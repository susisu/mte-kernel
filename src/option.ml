let get_exn = function
  | Some x -> x
  | None -> failwith "None"
