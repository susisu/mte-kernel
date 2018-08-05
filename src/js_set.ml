type 'a t

module Js_intf = struct
  external make: unit -> 'a t = "Set" [@@bs.new]
  external add: 'a t -> 'a -> 'a t = "add" [@@bs.send]
  external delete: 'a t -> 'a -> bool = "delete" [@@bs.send]
  external clear: 'a t -> unit = "clear" [@@bs.send]
  external has: 'a t -> 'a -> bool = "has" [@@bs.send]
  external size: 'a t -> int = "size" [@@bs.get]

  external of_string: string -> string t = "Set" [@@bs.new]
  external of_array: 'a array -> 'a t = "Set" [@@bs.new]
end

let make = Js_intf.make

let add s x = Js_intf.add s x |> ignore
let delete s x = Js_intf.delete s x |> ignore
let clear s = Js_intf.clear s
let has s x = Js_intf.has s x
let size s = Js_intf.size s

let of_string = Js_intf.of_string
let of_array = Js_intf.of_array
