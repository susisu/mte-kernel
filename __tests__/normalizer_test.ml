open Jest
open Expect

let () =
  describe "Normalizer" begin fun () ->
    let open Normalizer in

    describe "normalize" begin fun () ->
      let open Table.Normalized in

      describe "with header" begin fun () ->
        test "should do nothing if the given table havs the normalized form" begin fun () ->
          let table = Table.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[None; Some Table.Alignment.Left]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            Some ["name"; "color"],
            [
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ],
            [None; Some Table.Alignment.Left],
            2
          )
        end;

        test "should add empty cells if there are no columns" begin fun () ->
          let table = Table.create
              ~header:(Some [])
              ~body:[
                [];
                [];
              ]
              ~alignments:[]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            Some [""],
            [
              [""];
              [""];
            ],
            [None],
            1
          )
        end;

        test "should insert empty cells to rows that have less cells than the maximum one\
             " begin fun () ->
          let table = Table.create
              ~header:(Some ["name"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"];
              ]
              ~alignments:[None; Some Table.Alignment.Left]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            Some ["name"; ""],
            [
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; ""];
            ],
            [None; Some Table.Alignment.Left],
            2
          )
        end;

        test "should add empty alignment specifications if missing" begin fun () ->
          let table = Table.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[None]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            Some ["name"; "color"],
            [
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ],
            [None; None],
            2
          )
        end;

        test "should drop redundant alignment specifications" begin fun () ->
          let table = Table.create
              ~header:(Some ["name"; "color"])
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[None; Some Table.Alignment.Left; Some Table.Alignment.Right]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            Some ["name"; "color"],
            [
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ],
            [None; Some Table.Alignment.Left],
            2
          )
        end;
      end;

      describe "without header" begin fun () ->
        test "should do nothing if the given table havs the normalized form" begin fun () ->
          let table = Table.create
              ~header:None
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[None; Some Table.Alignment.Left]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            None,
            [
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ],
            [None; Some Table.Alignment.Left],
            2
          )
        end;

        test "should insert a row with one empty cell to body if there are no rows" begin fun () ->
          let table = Table.create
              ~header:None
              ~body:[]
              ~alignments:[]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            None,
            [
              [""]
            ],
            [None],
            1
          )
        end;

        test "should add empty cells if there are no columns" begin fun () ->
          let table = Table.create
              ~header:None
              ~body:[
                [];
                [];
              ]
              ~alignments:[]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            None,
            [
              [""];
              [""];
            ],
            [None],
            1
          )
        end;

        test "should insert empty cells to rows that have less cells than the maximum one\
             " begin fun () ->
          let table = Table.create
              ~header:None
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"];
              ]
              ~alignments:[None; Some Table.Alignment.Left]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            None,
            [
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; ""];
            ],
            [None; Some Table.Alignment.Left],
            2
          )
        end;

        test "should add empty alignment specifications if missing" begin fun () ->
          let table = Table.create
              ~header:None
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[None]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            None,
            [
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ],
            [None; None],
            2
          )
        end;

        test "should drop redundant alignment specifications" begin fun () ->
          let table = Table.create
              ~header:None
              ~body:[
                ["apple"; "red"];
                ["banana"; "yellow"];
                ["lime"; "green"];
              ]
              ~alignments:[None; Some Table.Alignment.Left; Some Table.Alignment.Right]
          in
          let normalized = normalize table in
          expect (
            header normalized,
            body normalized,
            alignments normalized,
            width normalized
          ) |> toEqual (
            None,
            [
              ["apple"; "red"];
              ["banana"; "yellow"];
              ["lime"; "green"];
            ],
            [None; Some Table.Alignment.Left],
            2
          )
        end;
      end;
    end;
  end
