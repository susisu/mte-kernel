module Iterator: sig
  type 'a t
  val create: (unit -> 'a option) -> 'a t
  val next: 'a t -> 'a option
end = struct
  type 'a t = unit -> 'a option
  let create (f: unit -> 'a option): 'a t = f
  let next f = f ()
end

module T: sig
  type 'a t
  val create: (unit -> 'a Iterator.t) -> 'a t
  val iterator: 'a t -> 'a Iterator.t
  val to_list: 'a t -> 'a list
  val iterate: 'a t -> f:('a -> unit) -> unit
  val fold_left: 'a t -> init:'b -> f:('b -> 'a -> 'b) -> 'b
  val fold_right: 'a t -> init:'b -> f:('b -> 'a -> 'b) -> 'b
  val map: 'a t -> f:('a -> 'b) -> 'b t
  val filter: 'a t -> f:('a -> bool) -> 'a t
end = struct
  type 'a t = unit -> 'a Iterator.t
  let create (f: unit -> 'a Iterator.t): 'a t = f
  let iterator iter = iter ()

  let to_rev_list iter =
    let i = iterator iter in
    let rec loop rev_list =
      match Iterator.next i with
      | Some x -> loop (x :: rev_list)
      | None -> rev_list
    in loop []

  let to_list iter = List.rev (to_rev_list iter)

  let iterate iter ~f =
    let i =  iterator iter in
    let rec loop () =
      match Iterator.next i with
      | Some x -> f x; loop ()
      | None -> ()
    in loop ()

  let fold_left iter ~init ~f =
    let i = iterator iter in
    let rec loop acc =
      match Iterator.next i with
      | Some x -> loop (f acc x)
      | None -> acc
    in loop init

  let fold_right iter ~init ~f =
    let rev_list = to_rev_list iter in
    List.fold_left f init rev_list

  let map iter ~f = create (fun () ->
      let i = iterator iter in
      Iterator.create (fun () ->
          match Iterator.next i with
          | Some x -> Some (f x)
          | None -> None
        )
    )

  let filter iter ~f = create (fun () ->
      let i = iterator iter in
      Iterator.create (fun () ->
          let rec loop () =
            match Iterator.next i with
            | Some x -> if f x then Some x else loop ()
            | None -> None
          in loop ()
        )
    )
end

include T

module Js_iterator: sig
  type 'a t
  val to_iterator: 'a t -> 'a Iterator.t
end = struct
  type 'a t
  type 'a result = {
    done_: bool [@bs.as "done"];
    value: 'a;
  } [@@bs.deriving abstract]

  external next: 'a t -> 'a result = "next" [@@bs.send]

  let to_iterator (i: 'a t): 'a Iterator.t = Iterator.create (fun () ->
      let r = next i in
      if done_Get r then None
      else Some (valueGet r)
    )
end

[%%raw {|
function genericGetJsIterator(obj) {
  return obj[Symbol.iterator]();
}
|}]

module Js_iterable: sig
  type 'a t
  val to_iterable: 'a t -> 'a T.t
end = struct
  type 'a t

  external iterator: 'a t -> 'a Js_iterator.t = "genericGetJsIterator" [@@bs.val]

  let to_iterable x = create (fun () ->
      iterator x |> Js_iterator.to_iterator
    )
end

external js_t_of_string: string -> string Js_iterable.t = "%identity"
external js_t_of_array: 'a array -> 'a Js_iterable.t = "%identity"

let of_string str = js_t_of_string str |> Js_iterable.to_iterable
let of_array arr = js_t_of_array arr |> Js_iterable.to_iterable
