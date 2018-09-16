open Jest
open Expect
open Test_helper

let () =
  describe "Option" begin fun () ->
    let open Option in

    describe "is_none" begin fun () ->
      testAll "should checks if the value is None" [
        (None, true);
        (Some 42, false);
      ] begin fun (x, e) ->
        expect (is_none x) |> toBe e
      end;
    end;

    describe "is_some" begin fun () ->
      testAll "should checks if the value is Some" [
        (None, false);
        (Some 42, true);
      ] begin fun (x, e) ->
        expect (is_some x) |> toBe e
      end;
    end;

    describe "get_exn" begin fun () ->
      test "should retrieve the content of an optional value" begin fun () ->
        let opt = Some 42 in
        expect (get_exn opt) |> toBe 42
      end;

      test "should fail if None is given" begin fun () ->
        expect (fun () -> get_exn None) |> toThrowMessage "None"
      end;
    end;

    describe "map" begin fun () ->
      test "should apply the given function to the content of the optional value" begin fun () ->
        expect (map (fun x -> x * 2) (Some 42)) |> toEqual (Some 84)
      end;

      test "should return None if the optional value is None" begin fun () ->
        expect (map (fun x -> x * 2) None) |> toEqual None
      end;
    end;
  end
