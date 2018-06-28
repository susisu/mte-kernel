open Jest
open Expect

let () =
  describe "Cursor" begin fun () ->
    let open Cursor in
    describe "create" begin fun () ->
      test "it should create a cursor" begin fun () ->
        let c = create 2 4 in
        expect (row c, column c) |> toEqual (2, 4)
      end;

      test "it should fail if row is negative" begin fun () ->
        expect (fun () -> create (-2) 4) |> toThrow
      end;

      test "it should fail if column is negative" begin fun () ->
        expect (fun () -> create 2 (-4)) |> toThrow
      end;
    end;
  end
