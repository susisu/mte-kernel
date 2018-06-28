open Jest
open Expect

let () =
  describe "Cursor" begin fun () ->
    let open Cursor in
    describe "create" begin fun () ->
      testAll "it should create a cursor" [
        (0, 0);
        (0, 1);
        (1, 0);
        (1, 2);
      ] begin fun (r, c) ->
        let cursor = create r c in
        expect (row cursor, column cursor) |> toEqual (r, c)
      end;

      test "it should fail if row is negative" begin fun () ->
        expect (fun () -> create (-1) 0) |> toThrow
      end;

      test "it should fail if column is negative" begin fun () ->
        expect (fun () -> create 0 (-1)) |> toThrow
      end;
    end;
  end
