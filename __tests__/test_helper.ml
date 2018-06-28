let toThrowAssertionFailure p =
  Jest.Expect.toThrowMessageRe (Js.Re.fromStringWithFlags "assert" ~flags:"i") p
