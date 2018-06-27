open Jest
open Expect

let () =
  describe "Table" begin fun () ->
    describe "Normalized" begin fun () ->
      describe "create" begin fun () ->
        test "it should be able to create normalized table" begin fun () ->
          let header = Some ["name"; "color"] in
          let body = [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default; Alignment.Left] in
          let table = Table.Normalized.create ~header ~body ~alignments in
          expect (
            Table.Normalized.header table,
            Table.Normalized.body table,
            Table.Normalized.alignments table,
            Table.Normalized.width table,
            Table.Normalized.height table
          ) |> toEqual (header, body, alignments, 2, 3)
        end;

        test "it should fail if there are no columns" begin fun () ->
          let header = Some [] in
          let body = [[]; []; []] in
          let alignments = [] in
          expect (fun () -> Table.Normalized.create ~header ~body ~alignments) |> toThrow
        end;

        test "it should fail if there exists a column of diffrent width" begin fun () ->
          let header = Some ["name"; "color"] in
          let body = [
            ["apple"; "red"];
            ["banana"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default; Alignment.Left] in
          expect (fun () -> Table.Normalized.create ~header ~body ~alignments) |> toThrow
        end;

        test "it should fail if there exists a column without alignment" begin fun () ->
          let header = Some ["name"; "color"] in
          let body = [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default] in
          expect (fun () -> Table.Normalized.create ~header ~body ~alignments) |> toThrow
        end;

        test "it should be able to create normalized headless table" begin fun () ->
          let header = None in
          let body = [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default; Alignment.Left] in
          let table = Table.Normalized.create ~header ~body ~alignments in
          expect (
            Table.Normalized.header table,
            Table.Normalized.body table,
            Table.Normalized.alignments table,
            Table.Normalized.width table,
            Table.Normalized.height table
          ) |> toEqual (header, body, alignments, 2, 3)
        end;

        test "it should fail if there is no header and no columns" begin fun () ->
          let header = None in
          let body = [[]; []; []] in
          let alignments = [] in
          expect (fun () -> Table.Normalized.create ~header ~body ~alignments) |> toThrow
        end;

        test "it should fail if there is no header and exists a column of diffrent width" begin fun () ->
          let header = None in
          let body = [
            ["apple"; "red"];
            ["banana"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default; Alignment.Left] in
          expect (fun () -> Table.Normalized.create ~header ~body ~alignments) |> toThrow
        end;

        test "it should fail if there is no header and exists a column without alignment" begin fun () ->
          let header = None in
          let body = [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ] in
          let alignments = [Alignment.Default] in
          expect (fun () -> Table.Normalized.create ~header ~body ~alignments) |> toThrow
        end;

        test "it should fail if there is no header and no body" begin fun () ->
          let header = None in
          let body = [] in
          let alignments = [] in
          expect (fun () -> Table.Normalized.create ~header ~body ~alignments) |> toThrow
        end
      end
    end
  end
