open Jest
open Expect

let () =
  describe "Manipulator" begin fun () ->
    let open Manipulator in

    describe "Prim" begin fun () ->
      let open Prim in

      describe "insert_empty_row" begin fun () ->
        let open Table.Alignment in

        testAll "should insert an empty row to a table" [
          (
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Left; Some Right]
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
              [Some Left; Some Right]
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
              [Some Left; Some Right]
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
              [Some Left; Some Right]
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
              [Some Left; Some Right]
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
              [Some Left; Some Right]
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
              [Some Left; Some Right]
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
              [Some Left; Some Right]
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
              [Some Left; Some Right]
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
              [Some Left; Some Right]
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
        let open Table.Alignment in

        testAll "should insert an empty column to a table" [
          (
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Left; Some Right]
            ),
            0,
            (
              None,
              [
                [""; "apple"; "red"];
                [""; "banana"; "yellow"];
                [""; "lime"; "green"];
              ],
              [None; Some Left; Some Right]
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
              [Some Left; Some Right]
            ),
            -1,
            (
              Some [""; "name"; "color"],
              [
                [""; "apple"; "red"];
                [""; "banana"; "yellow"];
                [""; "lime"; "green"];
              ],
              [None; Some Left; Some Right]
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
              [Some Left; Some Right]
            ),
            0,
            (
              Some [""; "name"; "color"],
              [
                [""; "apple"; "red"];
                [""; "banana"; "yellow"];
                [""; "lime"; "green"];
              ],
              [None; Some Left; Some Right]
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
              [Some Left; Some Right]
            ),
            1,
            (
              Some ["name"; ""; "color"],
              [
                ["apple"; ""; "red"];
                ["banana"; ""; "yellow"];
                ["lime"; ""; "green"];
              ],
              [Some Left; None; Some Right]
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
              [Some Left; Some Right]
            ),
            2,
            (
              Some ["name"; "color"; ""],
              [
                ["apple"; "red"; ""];
                ["banana"; "yellow"; ""];
                ["lime"; "green"; ""];
              ],
              [Some Left; Some Right; None]
            )
          );
        ] begin fun ((h, b, a), i, e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = insert_empty_column i table in
          expect (header table', body table', alignments table') |> toEqual e
        end;
      end;

      describe "swap_rows" begin fun () ->
        let open Table.Alignment in

        testAll "should swap two body rows of the table" [
          (
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Left; Some Right]
            ),
            (0, 1),
            (
              None,
              [
                ["banana"; "yellow"];
                ["apple"; "red"];
                ["lime"; "green"];
              ],
              [Some Left; Some Right]
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
              [Some Left; Some Right]
            ),
            (0, 1),
            (
              Some ["name"; "color"],
              [
                ["banana"; "yellow"];
                ["apple"; "red"];
                ["lime"; "green"];
              ],
              [Some Left; Some Right]
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
              [Some Left; Some Right]
            ),
            (0, 2),
            (
              Some ["name"; "color"],
              [
                ["lime"; "green"];
                ["banana"; "yellow"];
                ["apple"; "red"];
              ],
              [Some Left; Some Right]
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
              [Some Left; Some Right]
            ),
            (1, 2),
            (
              Some ["name"; "color"],
              [
                ["apple"; "red"];
                ["lime"; "green"];
                ["banana"; "yellow"];
              ],
              [Some Left; Some Right]
            )
          );
        ] begin fun ((h, b, a), (i, j), e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = swap_rows i j table in
          expect (header table', body table', alignments table') |> toEqual e
        end;
      end;

      describe "swap_columns" begin fun () ->
        let open Table.Alignment in

        testAll "should swap two columns in the table" [
          (
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Left; Some Right]
            ),
            (0, 1),
            (
              None,
              [
                ["red"; "apple"];
                ["yellow"; "banana"];
                ["green"; "lime"];
              ],
              [Some Right; Some Left]
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
              [Some Left; Some Right]
            ),
            (0, 1),
            (
              Some ["color"; "name"],
              [
                ["red"; "apple"];
                ["yellow"; "banana"];
                ["green"; "lime"];
              ],
              [Some Right; Some Left]
            )
          );
        ] begin fun ((h, b, a), (i, j), e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = swap_columns i j table in
          expect (header table', body table', alignments table') |> toEqual e
        end;
      end;

      describe "set_alignment" begin fun () ->
        let open Table.Alignment in

        testAll "should set column alignment of the table" [
          (
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Left; Some Right]
            ),
            (0, None),
            (
              None,
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [None; Some Right]
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
              [Some Left; Some Right]
            ),
            (0, None),
            (
              Some ["name"; "color"],
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [None; Some Right]
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
              [Some Left; Some Right]
            ),
            (1, Some Center),
            (
              Some ["name"; "color"],
              [
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ],
              [Some Left; Some Center]
            )
          );
        ] begin fun ((h, b, a), (i, a'), e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = set_alignment i a' table in
          expect (header table', body table', alignments table') |> toEqual e
        end;
      end;
    end;

    describe "align" begin fun () ->
      let open Table in
      let open Table.Alignment in

      testAll "should set alignment of the focused column" [
        (
          (
            Table.Normalized.create
              ~header:None
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; Some Right],
            Focus.Offset ({ row = 0; column = 0 }, 0)
          ),
          None,
          (
            Table.Normalized.create
              ~header:None
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[None; Some Right],
            Focus.Offset ({ row = 0; column = 0 }, 0)
          )
        );
        (
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; Some Right],
            Focus.Offset ({ row = 0; column = 0 }, 0)
          ),
          None,
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[None; Some Right],
            Focus.Offset ({ row = 0; column = 0 }, 0)
          )
        );
        (
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; Some Right],
            Focus.Select { row = 0; column = 0 }
          ),
          None,
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[None; Some Right],
            Focus.Select { row = 0; column = 0 }
          )
        );
        (
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; Some Right],
            Focus.Offset ({ row = 0; column = 0 }, 0)
          ),
          Some Center,
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Center; Some Right],
            Focus.Offset ({ row = 0; column = 0 }, 0)
          )
        );
        (
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; Some Right],
            Focus.Offset ({ row = 1; column = 1 }, 1)
          ),
          None,
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; None],
            Focus.Offset ({ row = 1; column = 1 }, 1)
          )
        );
        (
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; Some Right],
            Focus.Offset ({ row = -1; column = 0 }, 0)
          ),
          None,
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[None; Some Right],
            Focus.Offset ({ row = -1; column = 0 }, 0)
          )
        );
        (
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; Some Right],
            Focus.Offset ({ row = 0; column = -1 }, 0)
          ),
          None,
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; Some Right],
            Focus.Offset ({ row = 0; column = -1 }, 0)
          )
        );
        (
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; Some Right],
            Focus.Offset ({ row = 0; column = 2 }, 0)
          ),
          None,
          (
            Table.Normalized.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[Some Left; Some Right],
            Focus.Offset ({ row = 0; column = 2 }, 0)
          )
        );
      ] begin fun ((t, f), a, e) ->
        let (state', table, focus) = align a State.init t f in
        expect (state', (table, focus)) |> toEqual (State.init, e)
      end;
    end;
  end
