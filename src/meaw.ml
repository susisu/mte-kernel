external eaw_string: string -> string option = "getEAW"
[@@bs.module "meaw"] [@@bs.return undefined_to_opt]

type eaw_property = N | Na | W | F | H | A

let eaw_property_dict = Js.Dict.fromArray [|
    ("N", N);
    ("Na", Na);
    ("W", W);
    ("F", F);
    ("H", H);
    ("A", A);
  |]
let eaw_property_of_string p = Js.Dict.unsafeGet eaw_property_dict p

let eaw c =
  match eaw_string c with
  | None -> None
  | Some p -> Some (eaw_property_of_string p)
