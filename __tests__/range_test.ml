open Jest
open Expect

let () =
  describe "Range" begin fun () ->
    let open Range in
    describe "create" begin fun () ->
      test "it should create a range" begin fun () ->
        let r = create 2 4 in
        expect (start_row r, end_row r) |> toEqual (2, 4)
      end;

      test "it should fail if start_row >= end_row" begin fun () ->
        expect (fun () -> create 4 2) |> toThrow
      end;

      test "it should fail if start_row is negative" begin fun () ->
        expect (fun () -> create (-2) 4) |> toThrow
      end;
    end;
  end
