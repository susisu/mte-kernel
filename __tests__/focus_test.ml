open Jest
open Expect
open Test_helper

let () =
  describe "Focus" begin fun () ->
    let open Focus in

    describe "create_pointed" begin fun () ->
      let open Pointed in
      testAll "it should create a pointed focus" [
        (0, 0, 0);
        (0, 1, 2);
        (1, 2, 3);
        (-1, 0, 0);
      ] begin fun (r, c, o) ->
        let focus = create_pointed r c o in
        match focus with
        | Pointed f -> expect (row f, column f, offset f) |> toEqual (r, c, o)
        | Selected _ -> fail "expect Focus.Pointed"
      end;

      test "it should fail if column is negative" begin fun () ->
        expect (fun () -> create_pointed 0 (-1) 0)
        |> toThrowAssertionFailure
      end;

      test "it should fail if offset is negative" begin fun () ->
        expect (fun () -> create_pointed 0 0 (-1))
        |> toThrowAssertionFailure
      end;
    end;

    describe "create_selected" begin fun () ->
      let open Selected in
      testAll "it should create selected focus" [
        (0, 0);
        (0, 1);
        (1, 0);
        (1, 2);
        (-1, 0);
      ] begin fun (r, c) ->
        let focus = create_selected r c in
        match focus with
        | Pointed _ -> fail "expect Focus.selected"
        | Selected f -> expect (row f, column f) |> toEqual (r, c)
      end;

      test "it should fail if column is negative" begin fun () ->
        expect (fun () -> create_selected 0 (-1))
        |> toThrowAssertionFailure
      end
    end
  end
