open Jest
open Expect

let () =
  describe "Table" begin fun () ->
    let open Table in
    describe "Normalized" begin fun () ->
      let open Normalized in
      describe "create" begin fun () ->
        test "it should be able to create a normalized table" begin fun () ->
          let header = Some ["name"; "color"] in
          let body = [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default; Alignment.Left] in
          let table = create ~header ~body ~alignments in
          expect (
            Normalized.header table,
            Normalized.body table,
            Normalized.alignments table,
            Normalized.width table,
            Normalized.height table
          ) |> toEqual (header, body, alignments, 2, 3)
        end;

        test "it should fail if there are no columns" begin fun () ->
          let header = Some [] in
          let body = [[]; []; []] in
          let alignments = [] in
          expect (fun () -> create ~header ~body ~alignments) |> toThrow
        end;

        test "it should fail if there exists a column of diffrent width" begin fun () ->
          let header = Some ["name"; "color"] in
          let body = [
            ["apple"; "red"];
            ["banana"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default; Alignment.Left] in
          expect (fun () -> create ~header ~body ~alignments) |> toThrow
        end;

        test "it should fail if there exists a column without alignment" begin fun () ->
          let header = Some ["name"; "color"] in
          let body = [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default] in
          expect (fun () -> create ~header ~body ~alignments) |> toThrow
        end;

        test "it should be able to create a normalized headless table" begin fun () ->
          let header = None in
          let body = [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default; Alignment.Left] in
          let table = create ~header ~body ~alignments in
          expect (
            Normalized.header table,
            Normalized.body table,
            Normalized.alignments table,
            Normalized.width table,
            Normalized.height table
          ) |> toEqual (header, body, alignments, 2, 3)
        end;

        test "it should fail if there is no header and no columns" begin fun () ->
          let header = None in
          let body = [[]; []; []] in
          let alignments = [] in
          expect (fun () -> create ~header ~body ~alignments) |> toThrow
        end;

        test "it should fail if there is no header and exists a column of diffrent width" begin fun () ->
          let header = None in
          let body = [
            ["apple"; "red"];
            ["banana"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default; Alignment.Left] in
          expect (fun () -> create ~header ~body ~alignments) |> toThrow
        end;

        test "it should fail if there is no header and exists a column without alignment" begin fun () ->
          let header = None in
          let body = [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default] in
          expect (fun () -> create ~header ~body ~alignments) |> toThrow
        end;

        test "it should fail if there is no header and no body" begin fun () ->
          let header = None in
          let body = [] in
          let alignments = [] in
          expect (fun () -> create ~header ~body ~alignments) |> toThrow
        end;
      end;
    end;
  end
