(** Binding of meaw *)

(** The type eaw_property represents Unicode East Asian Width (EAW) property of a code point. *)
type eaw_property =
  | N  (** neutral *)
  | Na (** narrow *)
  | W  (** wide *)
  | F  (** full-wdith *)
  | H  (** half-width *)
  | A  (** ambiguous *)

(** Gets the EAW property of the given code point represneted as a string.
    If the given string contains multiple code points, it returns the property of the first one.
    If the given string is empty, it returns None.
*)
val eaw: string -> eaw_property option
