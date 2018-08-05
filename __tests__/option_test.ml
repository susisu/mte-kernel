open Jest
open Expect
open Test_helper

let () =
  describe "Option" begin fun () ->
    let open Option in

    describe "get_exn" begin fun () ->
      test "should retrieve the content of an optional value" begin fun () ->
        let opt = Some 42 in
        expect (get_exn opt) |> toBe 42
      end;

      test "should fail if None is given" begin fun () ->
        expect (fun () -> get_exn None) |> toThrowMessage "None"
      end;
    end;
  end
