open Jest
open Expect

let () =
  describe "Cursor" begin fun () ->
    describe "create" begin fun () ->
      test "it should create a cursor" begin fun () ->
        let c = Cursor.create 2 4 in
        expect (Cursor.row c, Cursor.column c) |> toEqual (2, 4)
      end;

      test "it should fail if row is negative" begin fun () ->
        expect (fun () -> Cursor.create (-2) 4) |> toThrow
      end;

      test "it should fail if column is negative" begin fun () ->
        expect (fun () -> Cursor.create 2 (-4)) |> toThrow
      end;
    end;
  end
