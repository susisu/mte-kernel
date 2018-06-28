open Jest
open Expect

let () =
  describe "Range" begin fun () ->
    let open Range in
    describe "create" begin fun () ->
      testAll "it should create a range" [
        (0, 1);
        (1, 2);
      ] begin fun (r, c) ->
        let range = create r c in
        expect (start_row range, end_row range) |> toEqual (r, c)
      end;

      test "it should fail if start_row >= end_row" begin fun () ->
        expect (fun () -> create 1 0)
        |> toThrowMessageRe (Js.Re.fromStringWithFlags "assert" ~flags:"i")
      end;

      test "it should fail if start_row is negative" begin fun () ->
        expect (fun () -> create (-1) 0)
        |> toThrowMessageRe (Js.Re.fromStringWithFlags "assert" ~flags:"i")
      end;
    end;
  end
