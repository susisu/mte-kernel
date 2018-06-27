open Jest
open Expect

let () =
  describe "range" begin fun () ->
    describe "create" begin fun () ->
      test "it should create a range" begin fun () ->
        let r = Range.create 2 4 in
        expect (Range.start_line r, Range.end_line r) |> toEqual (2, 4)
      end;

      test "it should fail if start_line >= end_line" begin fun () ->
        expect (fun () -> Range.create 4 2) |> toThrow
      end;

      test "it should fail if start_line is negative" begin fun () ->
        expect (fun () -> Range.create (-2) 4) |> toThrow
      end;
    end;
  end
