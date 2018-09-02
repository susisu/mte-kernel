open Jest
open Expect

let () =
  describe "Manipulator" begin fun () ->
    let open Manipulator in

    describe "Prim" begin fun () ->
      let open Prim in

      describe "insert_empty_row" begin fun () ->
        testAll "should insert an empty row to a table" [
          (
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            ),
            -1,
            (
              None,
              [
                [""; ""];
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            )
          );
          (
            (
              Some ["name"; "color"],
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            ),
            -1,
            (
              Some ["name"; "color"],
              [
                [""; ""];
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            )
          );
          (
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            ),
            0,
            (
              None,
              [
                [""; ""];
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            )
          );
          (
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            ),
            1,
            (
              None,
              [
                ["apple"; "red"];
                [""; ""];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            )
          );
          (
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            ),
            3,
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
                [""; ""];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            )
          );
        ] begin fun ((h, b, a), i, e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = insert_empty_row i table in
          expect (header table', body table', alignments table') |> toEqual e
        end;
      end;

      describe "insert_empty_column" begin fun () ->
        testAll "should insert an empty column to a table" [
          (
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            ),
            0,
            (
              None,
              [
                [""; "apple"; "red"];
                [""; "banana"; "yellow"];
                [""; "lime"; "green"];
              ],
              [None; Some Alignment.Left; Some Alignment.Right]
            )
          );
          (
            (
              Some ["name"; "color"],
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            ),
            -1,
            (
              Some [""; "name"; "color"],
              [
                [""; "apple"; "red"];
                [""; "banana"; "yellow"];
                [""; "lime"; "green"];
              ],
              [None; Some Alignment.Left; Some Alignment.Right]
            )
          );
          (
            (
              Some ["name"; "color"],
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            ),
            0,
            (
              Some [""; "name"; "color"],
              [
                [""; "apple"; "red"];
                [""; "banana"; "yellow"];
                [""; "lime"; "green"];
              ],
              [None; Some Alignment.Left; Some Alignment.Right]
            )
          );
          (
            (
              Some ["name"; "color"],
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            ),
            1,
            (
              Some ["name"; ""; "color"],
              [
                ["apple"; ""; "red"];
                ["banana"; ""; "yellow"];
                ["lime"; ""; "green"];
              ],
              [Some Alignment.Left; None; Some Alignment.Right]
            )
          );
          (
            (
              Some ["name"; "color"],
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Alignment.Left; Some Alignment.Right]
            ),
            2,
            (
              Some ["name"; "color"; ""],
              [
                ["apple"; "red"; ""];
                ["banana"; "yellow"; ""];
                ["lime"; "green"; ""];
              ],
              [Some Alignment.Left; Some Alignment.Right; None]
            )
          );
        ] begin fun ((h, b, a), i, e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = insert_empty_column i table in
          expect (header table', body table', alignments table') |> toEqual e
        end;
      end;
    end;
  end
