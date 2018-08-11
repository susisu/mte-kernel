open Jest
open Expect
open Test_helper

let () =
  describe "Renderer" begin fun () ->
    let open Renderer in

    describe "compute_text_width" begin fun () ->
      testAll "should compute text width based on the Unicode EAW properties of characters" [
        ("", 0);
        ({js|ℵAあＡｱ∀|js}, 8);
        ({js|\u0065\u0301|js}, 2);
        ({js|🍣|js}, 2);
      ] begin fun (text, width) ->
        let opts = {
          normalize = false;
          wide_chars = Js_set.make ();
          narrow_chars = Js_set.make ();
          ambiguous_as_wide = false;
        } in
        expect (compute_text_width opts text) |> toBe width
      end;

      test "should normalize by NFC before width computation if normalize = true" begin fun () ->
        let opts = {
          normalize = true;
          wide_chars = Js_set.make ();
          narrow_chars = Js_set.make ();
          ambiguous_as_wide = false;
        } in
        expect (compute_text_width opts {js|\u0065\u0301|js}) |> toBe 1
      end;

      test "should treat characters in wide_chars to be wide" begin fun () ->
        let wide_chars = Js_set.make () in
        Js_set.add wide_chars {js|∀|js};
        let opts = {
          normalize = false;
          wide_chars;
          narrow_chars = Js_set.make ();
          ambiguous_as_wide = false;
        } in
        expect (compute_text_width opts {js|ℵAあＡｱ∀|js}) |> toBe 9
      end;

      test "should treat characters in narrow_chars to be narrow" begin fun () ->
        let narrow_chars = Js_set.make () in
        Js_set.add narrow_chars {js|∀|js};
        let opts = {
          normalize = false;
          wide_chars = Js_set.make ();
          narrow_chars;
          ambiguous_as_wide = true;
        } in
        expect (compute_text_width opts {js|ℵAあＡｱ∀|js}) |> toBe 8
      end;

      test "should treat ambiguous characters as wide if ambiguous_as_wide = true" begin fun () ->
        let opts = {
          normalize = false;
          wide_chars = Js_set.make ();
          narrow_chars = Js_set.make ();
          ambiguous_as_wide = true;
        } in
        expect (compute_text_width opts {js|ℵAあＡｱ∀|js}) |> toBe 9
      end;
    end;

    describe "pad" begin fun () ->
      test "should add whitespace characters on each side of the text" begin fun () ->
        expect (pad "ABC") |> toBe " ABC "
      end;
    end;

    describe "align" begin fun () ->
      testAll "should align text to have the given width excluding the padding" [
        (Alignment.Left, "ABC  ");
        (Alignment.Right, "  ABC");
        (Alignment.Center, " ABC ");
      ] begin fun (al, res) ->
        let tw_opts = {
          normalize = false;
          wide_chars = Js_set.make ();
          narrow_chars = Js_set.make ();
          ambiguous_as_wide = false;
        } in
        expect (align tw_opts al 5 "ABC") |> toBe res
      end;

      test "should fail if the specified width is smaller than the text width" begin fun () ->
        let tw_opts = {
          normalize = false;
          wide_chars = Js_set.make ();
          narrow_chars = Js_set.make ();
          ambiguous_as_wide = false;
        } in
        expect (fun () -> align tw_opts Alignment.Left 5 "ABCDEF")
        |> toThrowAssertionFailure
      end;
    end;

    describe "delimiter_text" begin fun () ->
      let open Alignment in

      testAll "should create delimiter text with given width" [
        (Outside, None, " ----- ");
        (Outside, Some Left, ":----- ");
        (Outside, Some Right, " -----:");
        (Outside, Some Center, ":-----:");
        (Inside, None, " ----- ");
        (Inside, Some Left, " :---- ");
        (Inside, Some Right, " ----: ");
        (Inside, Some Center, " :---: ");
      ] begin fun (al_pos, al, res) ->
        expect (delimiter_text al_pos al 5) |> toBe res
      end;

      testAll "should fail if the given width is not enough" [
        (Outside, None, 0);
        (Outside, Some Left, 0);
        (Outside, Some Right, 0);
        (Outside, Some Center, 0);
        (Inside, None, 0);
        (Inside, Some Left, 1);
        (Inside, Some Right, 1);
        (Inside, Some Center, 2);
      ] begin fun (al_pos, al, width) ->
        expect (fun () -> delimiter_text al_pos al width)
        |> toThrowAssertionFailure
      end;
    end;
  end
