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
      let open Table.Alignment in
      let open Table.Focus in

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
            Offset ({ row = 0; column = 0 }, 0)
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
            Offset ({ row = 0; column = 0 }, 0)
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
            Offset ({ row = 0; column = 0 }, 0)
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
            Offset ({ row = 0; column = 0 }, 0)
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
            Select { row = 0; column = 0 }
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
            Select { row = 0; column = 0 }
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
            Offset ({ row = 0; column = 0 }, 0)
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
            Offset ({ row = 0; column = 0 }, 0)
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
            Offset ({ row = 1; column = 1 }, 1)
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
            Offset ({ row = 1; column = 1 }, 1)
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
            Offset ({ row = -1; column = 0 }, 0)
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
            Offset ({ row = -1; column = 0 }, 0)
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
            Offset ({ row = 0; column = -1 }, 0)
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
            Offset ({ row = 0; column = -1 }, 0)
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
            Offset ({ row = 0; column = 2 }, 0)
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
            Offset ({ row = 0; column = 2 }, 0)
          )
        );
      ] begin fun ((t, f), a, e) ->
        let (s', t', f') = align a State.init t f in
        expect (s', (t', f')) |> toEqual (State.init, e)
      end;
    end;

    describe "select" begin fun () ->
      let open Table.Focus in

      testAll "should select the cell content" [
        (Offset ({ row = 0; column = 1 }, 2), Select { row = 0; column = 1 });
        (Select { row = 0; column = 1 }, Select { row = 0; column = 1 });
      ] begin fun (f, e) ->
        let t = Table.Normalized.create
            ~header:(Some ["name"; "color"])
            ~body:[
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
            ~alignments:[Some Left; Some Right]
        in
        let (s', t', f') = select State.init t f in
        expect (s', t', f') |> toEqual (State.init, t, e)
      end;
    end;

    describe "move_focus" begin fun () ->
      let open Table.Focus in

      let table_without_header = Table.Normalized.create
          ~header:None
          ~body:[
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ]
          ~alignments:[Some Left; Some Right]
      in
      let table_with_header = Table.Normalized.create
          ~header:(Some ["name"; "color"])
          ~body:[
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ]
          ~alignments:[Some Left; Some Right]
      in
      testAll "should move focus" [
        (
          "without header - no move",
          table_without_header,
          Offset ({ row = 0; column = 0 }, 0),
          (0, 0),
          Offset ({ row = 0; column = 0 }, 0)
        );
        (
          "without header - move up",
          table_without_header,
          Offset ({ row = 1; column = 0 }, 0),
          (-1, 0),
          Select { row = 0; column = 0 }
        );
        (
          "without header - move up cancelled",
          table_without_header,
          Offset ({ row = 0; column = 0 }, 0),
          (-1, 0),
          Offset ({ row = 0; column = 0 }, 0)
        );
        (
          "without header - move down",
          table_without_header,
          Offset ({ row = 0; column = 0 }, 0),
          (1, 0),
          Select { row = 1; column = 0 }
        );
        (
          "without header - move down cancelled",
          table_without_header,
          Offset ({ row = 2; column = 0 }, 0),
          (1, 0),
          Offset ({ row = 2; column = 0 }, 0)
        );
        (
          "without header - move left",
          table_without_header,
          Offset ({ row = 0; column = 1 }, 0),
          (0, -1),
          Select { row = 0; column = 0 }
        );
        (
          "without header - move left from gutter",
          table_without_header,
          Offset ({ row = 0; column = 2 }, 0),
          (0, -1),
          Select { row = 0; column = 1 }
        );
        (
          "without header - move left cancelled",
          table_without_header,
          Offset ({ row = 0; column = 0 }, 0),
          (0, -1),
          Offset ({ row = 0; column = 0 }, 0)
        );
        (
          "without header - move left from gutter cancelled",
          table_without_header,
          Offset ({ row = 0; column = -1 }, 0),
          (0, -1),
          Offset ({ row = 0; column = -1 }, 0)
        );
        (
          "without header - move right",
          table_without_header,
          Offset ({ row = 0; column = 0 }, 0),
          (0, 1),
          Select { row = 0; column = 1 }
        );
        (
          "without header - move right from gutter",
          table_without_header,
          Offset ({ row = 0; column = -1 }, 0),
          (0, 1),
          Select { row = 0; column = 0 }
        );
        (
          "without header - move right cancelled",
          table_without_header,
          Offset ({ row = 0; column = 1 }, 0),
          (0, 1),
          Offset ({ row = 0; column = 1 }, 0)
        );
        (
          "without header - move right from gutter cancelled",
          table_without_header,
          Offset ({ row = 0; column = 2 }, 0),
          (0, 1),
          Offset ({ row = 0; column = 2 }, 0)
        );
        (
          "with header - no move",
          table_with_header,
          Offset ({ row = 0; column = 0 }, 0),
          (0, 0),
          Offset ({ row = 0; column = 0 }, 0)
        );
        (
          "with header - move up",
          table_with_header,
          Offset ({ row = 1; column = 0 }, 0),
          (-1, 0),
          Select { row = 0; column = 0 }
        );
        (
          "with header - move up to header",
          table_with_header,
          Offset ({ row = 0; column = 0 }, 0),
          (-1, 0),
          Select { row = -1; column = 0 }
        );
        (
          "with header - move up cancelled",
          table_with_header,
          Offset ({ row = -1; column = 0 }, 0),
          (-1, 0),
          Offset ({ row = -1; column = 0 }, 0)
        );
        (
          "with header - move down",
          table_with_header,
          Offset ({ row = 0; column = 0 }, 0),
          (1, 0),
          Select { row = 1; column = 0 }
        );
        (
          "with header - move down from header",
          table_with_header,
          Offset ({ row = -1; column = 0 }, 0),
          (1, 0),
          Select { row = 0; column = 0 }
        );
        (
          "with header - move down cancelled",
          table_with_header,
          Offset ({ row = 2; column = 0 }, 0),
          (1, 0),
          Offset ({ row = 2; column = 0 }, 0)
        );
        (
          "with header - move left",
          table_with_header,
          Offset ({ row = 0; column = 1 }, 0),
          (0, -1),
          Select { row = 0; column = 0 }
        );
        (
          "with header - move left from gutter",
          table_with_header,
          Offset ({ row = 0; column = 2 }, 0),
          (0, -1),
          Select { row = 0; column = 1 }
        );
        (
          "with header - move left cancelled",
          table_with_header,
          Offset ({ row = 0; column = 0 }, 0),
          (0, -1),
          Offset ({ row = 0; column = 0 }, 0)
        );
        (
          "with header - move left from gutter cancelled",
          table_with_header,
          Offset ({ row = 0; column = -1 }, 0),
          (0, -1),
          Offset ({ row = 0; column = -1 }, 0)
        );
        (
          "with header - move right",
          table_with_header,
          Offset ({ row = 0; column = 0 }, 0),
          (0, 1),
          Select { row = 0; column = 1 }
        );
        (
          "with header - move right from gutter",
          table_with_header,
          Offset ({ row = 0; column = -1 }, 0),
          (0, 1),
          Select { row = 0; column = 0 }
        );
        (
          "with header - move right cancelled",
          table_with_header,
          Offset ({ row = 0; column = 1 }, 0),
          (0, 1),
          Offset ({ row = 0; column = 1 }, 0)
        );
        (
          "with header - move right from gutter cancelled",
          table_with_header,
          Offset ({ row = 0; column = 2 }, 0),
          (0, 1),
          Offset ({ row = 0; column = 2 }, 0)
        );
      ] begin fun (_, t, f, (r, c), e) ->
        let (s', t', f') = move_focus r c State.init t f in
        expect (s', t', f') |> toEqual (State.init, t, e)
      end;
    end;
  end
