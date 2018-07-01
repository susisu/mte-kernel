open Jest
open Expect
open Test_helper

let () =
  describe "Text_editor" begin fun () ->
    let open Text_editor in
    let module Mock = Mock_text_editor in

    describe "getCursor" begin fun () ->
      test "it should get current cursor" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        Mock.setCursor mock (1, 2);
        expect (getCursor te) |> toEqual (Cursor.create 1 2)
      end;
    end;

    describe "setCursor" begin fun () ->
      test "it should set cursor" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        setCursor te (Cursor.create 1 2);
        expect (Mock.getCursor mock) |> toEqual (1, 2)
      end;
    end;

    describe "setSelection" begin fun () ->
      test "it should set selection" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
            "baz";
          |] in
        let te = Mock.to_text_editor mock in
        setSelection te (Cursor.create 0 1) (Cursor.create 2 3);
        expect (Mock.getSelection mock) |> toEqual ((0, 1), (2, 3))
      end;
    end;

    describe "getLastRow" begin fun () ->
      test "it should get the last row index of the text editor" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        expect (getLastRow te) |> toBe 1
      end;
    end;

    describe "accept" begin fun () ->
      test "it should return true if the text editor accepts table edit" begin fun () ->
        let mock = Mock.create [|
            "|foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        expect (accept te 0) |> toBe true
      end;

      test "it should return false if the text editor does not accept table edit" begin fun () ->
        let mock = Mock.create [|
            "|foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        expect (accept te 1) |> toBe false
      end;
    end;

    describe "getLine" begin fun () ->
      test "it should get a line at the specified row" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        expect (getLine te 0) |> toBe "foo"
      end;
    end;

    describe "insertLine" begin fun () ->
      test "it should insert a line at the specified row" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
          |] in
        let te = Mock.to_text_editor mock in
        insertLine te 1 "baz";
        expect (Mock.getLines mock) |> toEqual [|
          "foo";
          "baz";
          "bar";
        |]
      end;
    end;

    describe "deleteLine" begin fun () ->
      test "it should delete the line at the specifed row" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
            "baz";
          |] in
        let te = Mock.to_text_editor mock in
        deleteLine te 1;
        expect (Mock.getLines mock) |> toEqual [|
          "foo";
          "baz";
        |]
      end;
    end;

    describe "replaceLines" begin fun () ->
      test "it should replace lines in the specifed range" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
            "baz";
          |] in
        let te = Mock.to_text_editor mock in
        replaceLines te (Range.create 1 3) ["nyancat"];
        expect (Mock.getLines mock) |> toEqual [|
          "foo";
          "nyancat";
        |]
      end;
    end;

    describe "transact" begin fun () ->
      test "it should batched multiple operations in a single undo step" begin fun () ->
        let mock = Mock.create [|
            "foo";
            "bar";
            "baz";
          |] in
        let te = Mock.to_text_editor mock in
        transact te (fun () ->
            deleteLine te 1;
            deleteLine te 1;
            insertLine te 1 "nyancat";
          );
        expect (Mock.getLines mock) |> toEqual [|
          "foo";
          "nyancat";
        |]
      end;
    end;
  end
