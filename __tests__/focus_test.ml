open Jest
open Expect
open Test_helper

let () =
  describe "Focus" begin fun () ->
    let open Focus in

    describe "create_point" begin fun () ->
      let open Focus_point in
      let open Point in

      testAll "should create a pointed focus" [
        ({ row = 0; column = 0 }, 0);
        ({ row = 0; column = 1 }, 2);
        ({ row = 1; column = 2 }, 3);
        ({ row = -1; column = 0 }, 0);
      ] begin fun (p, o) ->
        let focus = create_point ~pos:p ~offset:o in
        match focus with
        | Point f -> expect (pos f, offset f) |> toEqual (p, o)
        | Select _ -> fail "expect Focus.Point"
      end;

      test "should fail if column is negative" begin fun () ->
        expect (fun () -> create_point ~pos:{ row = 0; column = -1 } ~offset:0)
        |> toThrowAssertionFailure
      end;

      test "should fail if offset is negative" begin fun () ->
        expect (fun () -> create_point ~pos:{ row = 0; column = 0 } ~offset:(-1))
        |> toThrowAssertionFailure
      end;
    end;

    describe "create_select" begin fun () ->
      let open Focus_select in
      let open Point in

      testAll "should create selected focus" [
        { row = 0; column = 0 };
        { row = 0; column = 1 };
        { row = 1; column = 0 };
        { row = 1; column = 2 };
        { row = -1; column = 0 };
      ] begin fun p ->
        let focus = create_select ~pos:p in
        match focus with
        | Point _ -> fail "expect Focus.selected"
        | Select f -> expect (pos f) |> toEqual p
      end;

      test "should fail if column is negative" begin fun () ->
        expect (fun () -> create_select ~pos:{ row = 0; column = -1 })
        |> toThrowAssertionFailure
      end
    end
  end
