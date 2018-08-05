open Jest
open Expect
open Test_helper

let () =
  describe "Cursor" begin fun () ->
    let open Cursor in

    describe "create" begin fun () ->
      testAll "should create a cursor" [
        (0, 0);
        (0, 1);
        (1, 0);
        (1, 2);
      ] begin fun (r, c) ->
        let cursor = create ~row:r ~column:c in
        expect (row cursor, column cursor) |> toEqual (r, c)
      end;

      test "should fail if row is negative" begin fun () ->
        expect (fun () -> create ~row:(-1) ~column:0)
        |> toThrowAssertionFailure
      end;

      test "should fail if column is negative" begin fun () ->
        expect (fun () -> create ~row:0 ~column:(-1))
        |> toThrowAssertionFailure
      end;
    end;
  end
