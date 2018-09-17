open Jest
open Expect

let () =
  describe "Manipulator" begin fun () ->
    let open Manipulator in

    describe "Prim" begin fun () ->
      let open Prim in

      describe "insert_empty_row" begin fun () ->
        let open Table.Alignment in

        let table_without_header = (
          None,
          [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ],
          [Some Left; Some Right]
        ) in
        let table_with_header = (
          Some ["name"; "color"],
          [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ],
          [Some Left; Some Right]
        ) in
        testAll "should insert an empty row to a table" [
          (
            "without header",
            table_without_header,
            0,
            [
              [""; ""];
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
          );
          (
            "without header - top gutter",
            table_without_header,
            -1,
            [
              [""; ""];
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
          );
          (
            "with header 1",
            table_with_header,
            0,
            [
              [""; ""];
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
          );
          (
            "with header 2",
            table_with_header,
            1,
            [
              ["apple"; "red"];
              [""; ""];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
          );
          (
            "with header - top gutter",
            table_with_header,
            -1,
            [
              [""; ""];
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
          );
          (
            "with header - bottom gutter",
            table_with_header,
            3,
            [
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
              [""; ""];
            ]
          );
        ] begin fun (_, (h, b, a), i, e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = insert_empty_row i table in
          expect (header table', body table', alignments table') |> toEqual (h, e, a)
        end;
      end;

      describe "insert_empty_column" begin fun () ->
        let open Table.Alignment in

        let table_without_header = (
          None,
          [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ],
          [Some Left; Some Right]
        ) in
        let table_with_header = (
          Some ["name"; "color"],
          [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ],
          [Some Left; Some Right]
        ) in
        testAll "should insert an empty column to a table" [
          (
            "without header",
            table_without_header,
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
            "with header 1",
            table_with_header,
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
            "with header 2",
            table_with_header,
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
            "with header - left gutter",
            table_with_header,
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
            "with header - right gutter",
            table_with_header,
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
        ] begin fun (_, (h, b, a), i, e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = insert_empty_column i table in
          expect (header table', body table', alignments table') |> toEqual e
        end;
      end;

      describe "swap_rows" begin fun () ->
        let open Table.Alignment in

        let table_without_header = (
          None,
          [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ],
          [Some Left; Some Right]
        ) in
        let table_with_header = (
          Some ["name"; "color"],
          [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ],
          [Some Left; Some Right]
        ) in
        testAll "should swap two body rows of the table" [
          (
            "without header",
            table_without_header,
            (0, 1),
            [
              ["banana"; "yellow"];
              ["apple"; "red"];
              ["lime"; "green"];
            ]
          );
          (
            "with header 1",
            table_with_header,
            (0, 1),
            [
              ["banana"; "yellow"];
              ["apple"; "red"];
              ["lime"; "green"];
            ]
          );
          (
            "with header 2",
            table_with_header,
            (0, 2),
            [
              ["lime"; "green"];
              ["banana"; "yellow"];
              ["apple"; "red"];
            ]
          );
          (
            "with header 3",
            table_with_header,
            (1, 2),
            [
              ["apple"; "red"];
              ["lime"; "green"];
              ["banana"; "yellow"];
            ]
          );
        ] begin fun (_, (h, b, a), (i, j), e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = swap_rows i j table in
          expect (header table', body table', alignments table') |> toEqual (h, e, a)
        end;
      end;

      describe "swap_columns" begin fun () ->
        let open Table.Alignment in


        testAll "should swap two columns in the table" [
          (
            "without header",
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
            "with header",
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
        ] begin fun (_, (h, b, a), (i, j), e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = swap_columns i j table in
          expect (header table', body table', alignments table') |> toEqual e
        end;
      end;

      describe "set_alignment" begin fun () ->
        let open Table.Alignment in

        let table_without_header = (
          None,
          [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ],
          [Some Left; Some Right]
        ) in
        let table_with_header = (
          Some ["name"; "color"],
          [
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ],
          [Some Left; Some Right]
        ) in
        testAll "should set column alignment of the table" [
          (
            "without header - none",
            table_without_header,
            (0, None),
            [None; Some Right]
          );
          (
            "without header - some",
            table_without_header,
            (1, Some Center),
            [Some Left; Some Center]
          );
          (
            "with header - none",
            table_with_header,
            (0, None),
            [None; Some Right]
          );
          (
            "with header - some",
            table_with_header,
            (1, Some Center),
            [Some Left; Some Center]
          );
        ] begin fun (_, (h, b, a), (i, a'), e) ->
          let open Table.Normalized in
          let table = create ~header:h ~body:b ~alignments:a in
          let table' = set_alignment i a' table in
          expect (header table', body table', alignments table') |> toEqual (h, b, e)
        end;
      end;
    end;

    describe "align" begin fun () ->
      let open Table.Alignment in
      let open Table.Focus in

      let table_without_header =
        Table.Normalized.create
          ~header:None
          ~body:[
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ]
          ~alignments:[Some Left; Some Right]
      in
      let table_with_header =
        Table.Normalized.create
          ~header:(Some ["name"; "color"])
          ~body:[
            ["apple"; "red"];
            ["banana"; "yellow"];
            ["lime"; "green"];
          ]
          ~alignments:[Some Left; Some Right]
      in
      testAll "should set alignment of the focused column" [
        (
          "without header",
          (
            table_without_header,
            Offset ({ row = 0; column = 0 }, 0)
          ),
          None,
          Table.Normalized.create
            ~header:None
            ~body:[
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
            ~alignments:[None; Some Right]
        );
        (
          "with header - offset focus 1",
          (
            table_with_header,
            Offset ({ row = 0; column = 0 }, 0)
          ),
          None,
          Table.Normalized.create
            ~header:(Some ["name"; "color"])
            ~body:[
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
            ~alignments:[None; Some Right]
        );
        (
          "with header - offset focus 2",
          (
            table_with_header,
            Offset ({ row = 0; column = 0 }, 0)
          ),
          Some Center,
          Table.Normalized.create
            ~header:(Some ["name"; "color"])
            ~body:[
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
            ~alignments:[Some Center; Some Right]
        );
        (
          "with header - offset focus 3",
          (
            table_with_header,
            Offset ({ row = 1; column = 1 }, 1)
          ),
          None,
          Table.Normalized.create
            ~header:(Some ["name"; "color"])
            ~body:[
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
            ~alignments:[Some Left; None]
        );
        (
          "with header - offset focus in header",
          (
            table_with_header,
            Offset ({ row = -1; column = 0 }, 0)
          ),
          None,
          Table.Normalized.create
            ~header:(Some ["name"; "color"])
            ~body:[
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
            ~alignments:[None; Some Right]
        );
        (
          "with header - offset focus in gutter",
          (
            table_with_header,
            Offset ({ row = 0; column = -1 }, 0)
          ),
          None,
          table_with_header
        );
        (
          "with header - offset focus in gutter",
          (
            table_with_header,
            Offset ({ row = 0; column = 2 }, 0)
          ),
          None,
          table_with_header
        );
        (
          "with header - select focus",
          (
            table_with_header,
            Select { row = 0; column = 0 }
          ),
          None,
          Table.Normalized.create
            ~header:(Some ["name"; "color"])
            ~body:[
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
            ~alignments:[None; Some Right]
        );
      ] begin fun (_, (t, f), a, e) ->
        let (s', t', f') = align a State.init t f in
        expect (s', t', f') |> toEqual (State.init, e, f)
      end;

      test "should keep state intact" begin fun () ->
        let s = State.{
            smart_cursor = Some {
                start = { row = 0; column = 0 };
                last = { row = 0; column = 1 };
              }
          }
        in
        let t = table_with_header in
        let f = Offset ({ row = 0; column = 1 }, 2) in
        let a = None in
        let e = Table.Normalized.create
            ~header:(Some ["name"; "color"])
            ~body:[
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ]
            ~alignments:[Some Left; None]
        in
        let (s', t', f') = align a s t f in
        expect (s', t', f') |> toEqual (s, e, f)
      end;
    end;

    describe "select" begin fun () ->
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
      testAll "should select the cell content" [
        (
          "without header - offset focus",
          table_without_header,
          Offset ({ row = 0; column = 1 }, 2),
          Select { row = 0; column = 1 }
        );
        (
          "without header - select focus",
          table_without_header,
          Select { row = 0; column = 1 },
          Select { row = 0; column = 1 }
        );
        (
          "with header - offset focus",
          table_with_header,
          Offset ({ row = 0; column = 1 }, 2),
          Select { row = 0; column = 1 }
        );
        (
          "with header - select focus",
          table_with_header,
          Select { row = 0; column = 1 },
          Select { row = 0; column = 1 }
        );
        (
          "with header - offset focus in header",
          table_with_header,
          Offset ({ row = -1; column = 1 }, 2),
          Select { row = -1; column = 1 }
        );
        (
          "with header - select focus in header",
          table_with_header,
          Select { row = -1; column = 1 },
          Select { row = -1; column = 1 }
        );
      ] begin fun (_, t, f, e) ->
        let (s', t', f') = select State.init t f in
        expect (s', t', f') |> toEqual (State.init, t, e)
      end;

      test "should keep state intact" begin fun () ->
        let s = State.{
            smart_cursor = Some {
                start = { row = 0; column = 0 };
                last = { row = 0; column = 1 };
              }
          }
        in
        let t = table_with_header in
        let f = Offset ({ row = 0; column = 1 }, 2) in
        let e = Select { row = 0; column = 1 } in
        let (s', t', f') = select s t f in
        expect (s', t', f') |> toEqual (s, t, e)
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

      let dirty_state = State.{
          smart_cursor = Some {
              start = { row = 0; column = 0 };
              last = { row = 0; column = 1 };
            }
        }
      in
      test "should reset state only if focus is moved" begin fun () ->
        let s = dirty_state in
        let t = table_with_header in
        let f = Offset ({ row = 0; column = 1 }, 2) in
        let (r, c) = (0, -1) in
        let e = Select { row = 0; column = 0 } in
        let (s', t', f') = move_focus r c s t f in
        expect (s', t', f') |> toEqual (State.init, t, e)
      end;

      test "should keep state intact if focus is not moved" begin fun () ->
        let s = dirty_state in
        let t = table_with_header in
        let f = Offset ({ row = 0; column = 1 }, 2) in
        let (r, c) = (0, 1) in
        let e = Offset ({ row = 0; column = 1 }, 2) in
        let (s', t', f') = move_focus r c s t f in
        expect (s', t', f') |> toEqual (s, t, e)
      end;
    end;
  end
