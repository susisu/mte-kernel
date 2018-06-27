open Jest
open Expect

let () =
  describe "range" begin fun () ->
    describe "create" begin fun () ->
      test "it should create a range" begin fun () ->
        let r = Range.create 2 4 in
        expect (Range.start_row r, Range.end_row r) |> toEqual (2, 4)
      end;

      test "it should fail if start_row >= end_row" begin fun () ->
        expect (fun () -> Range.create 4 2) |> toThrow
      end;

      test "it should fail if start_row is negative" begin fun () ->
        expect (fun () -> Range.create (-2) 4) |> toThrow
      end;
    end;
  end
