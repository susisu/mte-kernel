type command =
  | Noop
  | Insert of int * string
  | Delete of int

let apply_command te offset command =
  match command with
  | Noop -> ()
  | Insert (row, line) -> Text_editor.insertLine te (row + offset) line
  | Delete row -> Text_editor.deleteLine te (row + offset)

let apply te ~offset script =
  List.iter (apply_command te offset) script

type m = {
  i: int;
  script: command list;
}

let get_m_exn mem i = Option.get_exn mem.(i)

let shortest_edit_script ~limit ~from_lines ~to_lines =
  let from_len = Array.length from_lines in
  let to_len = Array.length to_lines in
  let max_d = match limit with
    | Some limit -> min limit (from_len + to_len)
    | None -> from_len + to_len
  in
  let mem = Array.make (min max_d from_len + min max_d to_len + 1) None in
  let offset = min max_d from_len in
  let rec loop_d d =
    if d > max_d then None
    else
      let min_k = if d <= from_len then -d else d - 2 * from_len in
      let max_k = if d <= to_len then d else -d + 2 * to_len in
      let rec loop_k k =
        if k > max_k then None
        else
          let (init_i, script) =
            if d = 0 (* && k = 0 *) then
              (0, [])
            else if k = -d then
              let m = get_m_exn mem (offset + k + 1) in
              let i = m.i + 1 in
              let command =
                if i <= from_len then Delete (i + k)
                else Noop
              in
              (i, command :: m.script)
            else if k = d then
              let m = get_m_exn mem (offset + k - 1) in
              let i = m.i in
              let command =
                if i + k <= to_len then Insert (i + k - 1, to_lines.(i + k - 1))
                else Noop
              in
              (i, command :: m.script)
            else
              let vm = get_m_exn mem (offset + k + 1) in
              let hm = get_m_exn mem (offset + k - 1) in
              let vi = vm.i + 1 in
              let hi = hm.i in
              if vi > hi then
                let i = vi in
                let command =
                  if i <= from_len then Delete (i + k)
                  else Noop
                in
                (i, command :: vm.script)
              else
                let i = hi in
                let command =
                  if i + k <= to_len then Insert (i + k - 1, to_lines.(i + k - 1))
                  else Noop
                in
                (i, command :: hm.script)
          in
          let rec loop_i i =
            if i < from_len && i + k < to_len && from_lines.(i) = to_lines.(i + k) then
              loop_i (i + 1)
            else
              i
          in
          let i = loop_i init_i in
          if k = to_len - from_len && i = from_len then
            Some (List.rev script)
          else begin
            mem.(offset + k) <- Some { i; script };
            loop_k (k + 2);
          end
      in
      match loop_k min_k with
      | Some ses -> Some ses
      | None -> loop_d (d + 1)
  in
  loop_d 0
