open Jest
open Expect

let () =
  describe "Meaw" begin fun () ->
    let open Meaw in

    describe "eaw" begin fun () ->
      testAll "should be able to distinguish code points having N" [
        {js|\x00|js};
        {js|ℵ|js};
      ] begin fun c ->
        expect (eaw c) |> toEqual (Some N)
      end;

      testAll "should be able to distinguish code points having Na" [
        "1";
        "A";
        "a";
        ".";
      ] begin fun c ->
        expect (eaw c) |> toEqual (Some Na)
      end;

      testAll "should be able to distinguish code points having W" [
        {js|あ|js};
        {js|ア|js};
        {js|安|js};
        {js|。|js};
        {js|🍣|js};
      ] begin fun c ->
        expect (eaw c) |> toEqual (Some W)
      end;

      testAll "should be able to distinguish code points having F" [
        {js|１|js};
        {js|Ａ|js};
        {js|ａ|js};
      ] begin fun c ->
        expect (eaw c) |> toEqual (Some F)
      end;

      testAll "should be able to distinguish code points having H" [
        {js|ｱ|js};
      ] begin fun c ->
        expect (eaw c) |> toEqual (Some H)
      end;

      testAll "should be able to distinguish code points having A" [
        {js|∀|js};
        {js|→|js};
        {js|Ω|js};
        {js|Я|js};
      ] begin fun c ->
        expect (eaw c) |> toEqual (Some A)
      end;

      test "should return the EAW property of the first code point in the string" begin fun () ->
        expect (eaw {js|ℵAあＡｱ∀|js}) |> toEqual (Some N)
      end;

      test "should return None if the given string is empty" begin fun () ->
        expect (eaw "") |> toEqual None
      end;
    end;
  end
