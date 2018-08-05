open Jest
open Expect


let lt_iter upper = Iterable.create (fun [@bs] () ->
    let n = ref 1 in
    Iterable.Iterator.create (fun [@bs] () ->
        let t = !n in
        if t < upper then (n := t + 1; Some t)
        else None
      )
  )

let lt_four_iter = lt_iter 4
let lt_five_iter = lt_iter 5

let empty_iter = Iterable.create (fun [@bs] () ->
    Iterable.Iterator.create (fun [@bs] () -> None)
  )

let () =
  describe "Iterable" begin fun () ->
    let open Iterable in

    describe "iterator" begin fun () ->
      test "should create a new iterator" begin fun () ->
        let i = iterator lt_four_iter in
        let v1 = Iterator.next i in
        let v2 = Iterator.next i in
        let v3 = Iterator.next i in
        let v4 = Iterator.next i in
        expect [v1; v2; v3; v4] |> toEqual [Some 1; Some 2; Some 3; None]
      end;
    end;

    describe "to_list" begin fun () ->
      testAll "should convert an iterable to a list" [
        (lt_four_iter, [1; 2; 3]);
        (lt_five_iter, [1; 2; 3; 4]);
        (empty_iter, []);
      ] begin fun (iter, list) ->
        expect (to_list iter) |> toEqual list
      end;
    end;

    describe "iterate" begin fun () ->
      test "should iterate over the given iterable" begin fun () ->
        let ns = ref [] in
        iterate lt_four_iter ~f:(fun n ->
            ns := n :: !ns
          );
        expect (!ns) |> toEqual [3; 2; 1]
      end;

      test "should do nothing if an empty iterable is given" begin fun () ->
        let did = ref false in
        iterate empty_iter ~f:(fun _ ->
            did := true
          );
        expect (!did) |> toBe false
      end;
    end;

    describe "fold_left" begin fun () ->
      testAll "should fold an iterable from left ro right" [
        (lt_four_iter, (((0 - 1) - 2) - 3));
        (lt_five_iter, ((((0 - 1) - 2) - 3) - 4));
        (empty_iter, 0);
      ] begin fun (iter, ans) ->
        let r = fold_left iter ~init:0 ~f:(fun acc n -> acc - n) in
        expect r |> toBe ans
      end;
    end;

    describe "fold_right" begin fun () ->
      testAll "should fold an iterable from right ro left" [
        (lt_four_iter, (1 - (2 - (3 - 0))));
        (lt_five_iter, (1 - (2 - (3 - (4 - 0)))));
        (empty_iter, 0);
      ] begin fun (iter, ans) ->
        let r = fold_right iter ~init:0 ~f:(fun acc n -> n - acc) in
        expect r |> toBe ans
      end;
    end;

    describe "map" begin fun () ->
      testAll "should create a new iterable which generates values mapped by the given function" [
        (lt_four_iter, [2; 4; 6]);
        (empty_iter, []);
      ] begin fun (iter, list) ->
        let iter' = map iter ~f:(fun n -> n * 2) in
        expect (to_list iter') |> toEqual list
      end;

      test "should not call the mapping function until it is needed" begin fun () ->
        let did = ref false in
        ignore @@ map lt_four_iter ~f:(fun n -> did := true; n * 2);
        expect (!did) |> toBe false
      end;
    end;

    describe "filter" begin fun () ->
      testAll "should create a new iterable which generates values filtered by the given function" [
        (lt_four_iter, [1; 3]);
        (empty_iter, []);
      ] begin fun (iter, list) ->
        let iter' = filter iter ~f:(fun n -> n mod 2 = 1) in
        expect (to_list iter') |> toEqual list
      end;
    end;

    describe "of_string" begin fun () ->
      test "should convert a string to an iterable" begin fun () ->
        let iter = of_string {js|Aあ🍣|js} in
        expect (to_list iter) |> toEqual ["A"; {js|あ|js}; {js|🍣|js}]
      end;
    end;

    describe "of_array" begin fun () ->
      test "should convert an array to an iterable" begin fun () ->
        let iter = of_array [|1; 2; 3|] in
        expect (to_list iter) |> toEqual [1; 2; 3]
      end;
    end;
  end
