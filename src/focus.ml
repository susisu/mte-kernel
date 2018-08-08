module Focus_point = struct
  type t = Point.t * int

  let create p o =
    assert (p.Point.column >= 0);
    assert (o >= 0);
    (p, o)

  let pos (p, _) = p
  let offset (_, o) = o
end

module Focus_select = struct
  type t = Point.t

  let create p =
    assert (p.Point.column >= 0);
    p

  let pos s = s
end

type t =
  | Point of Focus_point.t
  | Select of Focus_select.t

let create_point ~pos ~offset = Point (Focus_point.create pos offset)
let create_select ~pos = Select (Focus_select.create pos)
