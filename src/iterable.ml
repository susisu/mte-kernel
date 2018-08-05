module Iterator: sig
  type 'a t
  val create: (unit -> 'a option [@bs]) -> 'a t
  val next: 'a t -> 'a option
end = struct
  type 'a t = unit -> 'a option [@bs]
  let create (f: unit -> 'a option [@bs]): 'a t = f
  let next f = f () [@bs]
end

module T: sig
  type 'a t
  val create: (unit -> 'a Iterator.t [@bs]) -> 'a t
  val iterator: 'a t -> 'a Iterator.t
  val to_list: 'a t -> 'a list
  val iterate: 'a t -> f:('a -> unit) -> unit
  val fold_left: 'a t -> init:'b -> f:('b -> 'a -> 'b) -> 'b
  val fold_right: 'a t -> init:'b -> f:('b -> 'a -> 'b) -> 'b
  val map: 'a t -> f:('a -> 'b) -> 'b t
  val filter: 'a t -> f:('a -> bool) -> 'a t
end = struct
  type 'a t = unit -> 'a Iterator.t [@bs]
  let create (f: unit -> 'a Iterator.t [@bs]): 'a t = f
  let iterator iter = iter () [@bs]

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
    let f' = fun [@bs] x -> f x in
    let rec loop () =
      match Iterator.next i with
      | Some x -> f' x [@bs]; loop ()
      | None -> ()
    in loop ()

  let fold_left iter ~init ~f =
    let i = iterator iter in
    let f' = fun [@bs] acc x -> f acc x in
    let rec loop acc =
      match Iterator.next i with
      | Some x -> loop (f' acc x [@bs])
      | None -> acc
    in loop init

  let fold_right iter ~init ~f =
    let rev_list = to_rev_list iter in
    List.fold_left f init rev_list

  let map iter ~f = create (fun [@bs] () ->
      let i = iterator iter in
      let f' = fun [@bs] x -> f x in
      Iterator.create (fun [@bs] () ->
          match Iterator.next i with
          | Some x -> Some (f' x [@bs])
          | None -> None
        )
    )

  let filter iter ~f = create (fun [@bs] () ->
      let i = iterator iter in
      let f' = fun [@bs] x -> f x in
      Iterator.create (fun [@bs] () ->
          let rec loop () =
            match Iterator.next i with
            | Some x -> if f' x [@bs] then Some x else loop ()
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

  let to_iterator (i: 'a t): 'a Iterator.t = Iterator.create (fun [@bs] () ->
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

  let to_iterable (iter: 'a t): 'a T.t = create (fun [@bs] () ->
      iterator iter |> Js_iterator.to_iterator
    )
end

external js_t_of_string: string -> string Js_iterable.t = "%identity"
external js_t_of_array: 'a array -> 'a Js_iterable.t = "%identity"

let of_string str = js_t_of_string str |> Js_iterable.to_iterable
let of_array arr = js_t_of_array arr |> Js_iterable.to_iterable
