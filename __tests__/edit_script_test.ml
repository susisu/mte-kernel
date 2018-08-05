open Jest
open Expect
open Test_helper

let () =
  describe "Edit_script" begin fun () ->
    let open Edit_script in
    let module Mock = Mock_text_editor in

    describe "apply" begin fun () ->
      test "should apply the given edit script to the text editor" begin fun () ->
        let mock = Mock.create [|"A"; "C"; "D"|] in
        let te = Mock.to_text_editor mock in
        let script = [
          Noop;
          Insert (1, "B");
          Noop;
          Delete 2;
          Noop;
        ] in
        apply te ~offset:0 script;
        expect (Mock.get_lines mock) |> toEqual [|"A"; "B"; "D"|]
      end;

      test "should be able to offset row indices in the script" begin fun () ->
        let mock = Mock.create [|"A"; "C"; "D"|] in
        let te = Mock.to_text_editor mock in
        let script = [
          Noop;
          Insert (0, "B");
          Noop;
          Delete 1;
          Noop;
        ] in
        apply te ~offset:1 script;
        expect (Mock.get_lines mock) |> toEqual [|"A"; "B"; "D"|]
      end;
    end;

    describe "shortest_edit_script" begin fun () ->
      testAll "should compute the shortest edit script between two arrays" [
        ([|"A"; "B"; "C"|], [|"D"; "E"; "F"|], 6, None);
        ([|"D"; "E"; "F"|], [|"A"; "B"; "C"|], 6, None);
        ([|"A"; "B"; "C"|], [||], 3, None);
        ([||], [|"A"; "B"; "C"|], 3, None);
        ([|"A"; "B"; "C"|], [|"A"; "B"; "C"; "D"; "E"; "F"|], 3, None);
        ([|"A"; "B"; "C"; "D"; "E"; "F"|], [|"A"; "B"; "C"|], 3, None);
        ([|"D"; "E"; "F"|], [|"A"; "B"; "C"; "D"; "E"; "F"|], 3, None);
        ([|"A"; "B"; "C"; "D"; "E"; "F"|], [|"D"; "E"; "F"|], 3, None);
        ([|"A"; "B"; "C"; "D"; "E"|], [|"A"; "X"; "B"; "D"; "Y"|], 4, None);
        ([|"A"; "X"; "B"; "D"; "Y"|], [|"A"; "B"; "C"; "D"; "E"|], 4, None);
        (Js.String.split "" "kitten", Js.String.split "" "sitting", 5, None);
        (Js.String.split "" "sitting", Js.String.split "" "kitten", 5, None);
        (Js.String.split "" "kitten", Js.String.split "" "sitting", 5, Some 5);
        (Js.String.split "" "sitting", Js.String.split "" "kitten", 5, Some 5);
      ] begin fun (from_lines, to_lines, distance, limit) ->
        let ses = shortest_edit_script ~limit ~from_lines ~to_lines
                  |> Option.get_exn in
        let mock = Mock.create from_lines in
        let te = Mock.to_text_editor mock in
        apply te ~offset:0 ses;
        expect (List.length ses, Mock.get_lines mock) |> toEqual (distance, to_lines)
      end;

      testAll "should return None if the edit distance of two arrays are greater than the given limit\
              " [
        (Js.String.split "" "kitten", Js.String.split "" "sitting", 4);
        (Js.String.split "" "sitting", Js.String.split "" "kitten", 4);
      ] begin fun (from_lines, to_lines, limit) ->
        expect (shortest_edit_script ~limit:(Some limit) ~from_lines ~to_lines) |> toEqual None
      end;
    end;
  end
