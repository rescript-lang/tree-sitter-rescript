
type rec t =
//<- keyword.type
//   ^ keyword.modifier
//       ^ type
  | Node(t, t)
//  ^ constructor
//       ^ type
  | Terminal
//  ^ constructor
  | Component(module(Foo.t))
//             ^ keyword

type obj = {
  "x": int,
// ^ @property
}
