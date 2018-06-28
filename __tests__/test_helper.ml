(* This coercion is safe since return value of the function will be ignored *)
let _toThrowAssertionFailure = Obj.magic @@
  Jest.Expect.toThrowMessageRe (Js.Re.fromStringWithFlags "assert" ~flags:"i")
let toThrowAssertionFailure: [< (unit -> 'a) Jest.Expect.partial] -> Jest.assertion =
  _toThrowAssertionFailure
