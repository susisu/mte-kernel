open Jest
open Expect
open Test_helper

let () =
  describe "Text_editor" begin fun () ->
    let open Text_editor in

    describe "Cursor" begin fun () ->
      let open Cursor in
      let open Point in

      describe "create" begin fun () ->
        testAll "should create a cursor" [
          { row = 0; column = 0 };
          { row = 0; column = 1 };
          { row = 1; column = 0 };
          { row = 1; column = 2 };
        ] begin fun p ->
          let cursor = create p in
          expect (row cursor, column cursor) |> toEqual (p.row, p.column)
        end;

        test "should fail if row is negative" begin fun () ->
          expect (fun () -> create { row = -1; column = 0 })
          |> toThrowAssertionFailure
        end;

        test "should fail if column is negative" begin fun () ->
          expect (fun () -> create { row = 0; column = -1 })
          |> toThrowAssertionFailure
        end;
      end;
    end;

    describe "Selection" begin fun () ->
      let open Selection in
      let open Point in

      describe "create" begin fun () ->
        testAll "should create a selection" [
          ({ row = 0; column = 0 }, { row = 0; column = 0 });
          ({ row = 0; column = 0 }, { row = 1; column = 0 });
          ({ row = 0; column = 0 }, { row = 0; column = 1 });
        ] begin fun (s, e) ->
          let sc = Cursor.create s in
          let ec = Cursor.create e in
          let sel = create ~start_cursor:sc ~end_cursor:ec in
          expect (start_cursor sel, end_cursor sel) |> toEqual (sc, ec)
        end;

        testAll "should fail if the start cursor is greater than the end" [
          ({ row = 1; column = 0 }, { row = 0; column = 0 });
          ({ row = 0; column = 1 }, { row = 0; column = 0 });
        ] begin fun (s, e) ->
          let sc = Cursor.create s in
          let ec = Cursor.create e in
          expect (fun () -> create ~start_cursor:sc ~end_cursor:ec)
          |> toThrowAssertionFailure
        end;
      end;
    end;

    let module Mock = Mock_text_editor in

    describe "get_cursor" begin fun () ->
      test "should get current cursor" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        Mock.set_cursor mock (1, 2);
        expect (get_cursor te) |> toEqual (Cursor.create { row = 1; column = 2 })
      end;
    end;

    describe "set_cursor" begin fun () ->
      test "should set cursor" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        set_cursor te (Cursor.create { row = 1; column = 2 });
        expect (Mock.get_cursor mock) |> toEqual (1, 2)
      end;
    end;

    describe "set_selection" begin fun () ->
      test "should set selection" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
            "baz";
          |] in
        let te = Mock.to_text_editor mock in
        let sel = Selection.create
            ~start_cursor:(Cursor.create { row = 0; column = 1 })
            ~end_cursor:(Cursor.create { row = 2; column = 3 }) in
        set_selection te sel;
        expect (Mock.get_selection mock) |> toEqual ((0, 1), (2, 3))
      end;
    end;

    describe "get_last_row" begin fun () ->
      test "should get the last row index of the text editor" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        expect (get_last_row te) |> toBe 1
      end;
    end;

    describe "accepts" begin fun () ->
      test "should return true if the text editor accepts table edit" begin fun () ->
        let mock = Mock.create [|
            "|foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        expect (accepts te 0) |> toBe true
      end;

      test "should return false if the text editor does not accepts table edit" begin fun () ->
        let mock = Mock.create [|
            "|foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        expect (accepts te 1) |> toBe false
      end;
    end;

    describe "get_line" begin fun () ->
      test "should get a line at the specified row" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        expect (get_line te 0) |> toBe "foo"
      end;
    end;

    describe "insert_line" begin fun () ->
      test "should insert a line at the specified row" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        insert_line te 1 "baz";
        expect (Mock.get_lines mock) |> toEqual [|
          "foo";
          "baz";
          "bar";
        |]
      end;
    end;

    describe "delete_line" begin fun () ->
      test "should delete the line at the specifed row" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
            "baz";
          |] in
        let te = Mock.to_text_editor mock in
        delete_line te 1;
        expect (Mock.get_lines mock) |> toEqual [|
          "foo";
          "baz";
        |]
      end;
    end;

    describe "replace_lines" begin fun () ->
      test "should replace lines in the specifed range" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
            "baz";
          |] in
        let te = Mock.to_text_editor mock in
        replace_lines te (Range.create ~start_row:1 ~end_row:3) ["nyancat"];
        expect (Mock.get_lines mock) |> toEqual [|
          "foo";
          "nyancat";
        |]
      end;
    end;

    describe "transact" begin fun () ->
      test "should batched multiple operations in a single undo step" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
            "baz";
          |] in
        let te = Mock.to_text_editor mock in
        transact te (fun () ->
            delete_line te 1;
            delete_line te 1;
            insert_line te 1 "nyancat";
          );
        expect (Mock.get_lines mock) |> toEqual [|
          "foo";
          "nyancat";
        |]
      end;
    end;
  end
