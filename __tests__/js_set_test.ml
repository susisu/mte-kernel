open Jest
open Expect

let () =
  describe "Js_set" begin fun () ->
    let open Js_set in

    describe "make" begin fun () ->
      test "should create a new empty set" begin fun () ->
        let s = make () in
        expect (size s) |> toBe 0
      end;
    end;

    describe "add" begin fun () ->
      test "should add a new element to a set" begin fun () ->
        let s = of_array [|1; 2; 3|] in
        add s 4;
        expect (size s, has s 4) |> toEqual (4, true)
      end;
    end;

    describe "delete" begin fun () ->
      test "should delete an element from a set" begin fun () ->
        let s = of_array [|1; 2; 3|] in
        delete s 2;
        expect (size s, has s 2) |> toEqual (2, false)
      end;
    end;

    describe "clear" begin fun () ->
      test "should remove all the elements in a set" begin fun () ->
        let s = of_array [|1; 2; 3|] in
        clear s;
        expect (size s) |> toBe 0
      end;
    end;

    describe "has" begin fun () ->
      test "should checks whether a set has the given element" begin fun () ->
        let s = of_array [|1; 2; 3|] in
        expect (has s 1, has s 2, has s 3, has s 4) |> toEqual (true, true, true, false)
      end;
    end;

    describe "size" begin fun () ->
      test "should get the size of a set" begin fun () ->
        let s = of_array [|1; 2; 3|] in
        expect (size s) |> toBe 3
      end;
    end;

    describe "of_string" begin fun () ->
      test "should create a new set containing code points in a string" begin fun () ->
        let s = of_string {js|Aあ🍣|js} in
        expect (size s, has s "A", has s {js|あ|js}, has s {js|🍣|js})
        |> toEqual (3, true, true, true)
      end;
    end;

    describe "of_array" begin fun () ->
      test "should create a new set containing all the elements in an array" begin fun () ->
        let s = of_array [|1; 2; 3|] in
        expect (size s, has s 1, has s 2, has s 3) |> toEqual (3, true, true, true)
      end;
    end;
  end
