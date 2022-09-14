
type rec t =
//<- keyword
//   ^ keyword
//       ^ type
  | Node(t, t)
//  ^ constant
//       ^ type
  | Terminal
//  ^ constant
  | Component(module(Foo.t))
//             ^ keyword

type obj = {
  "x": int,
// ^ @property
}
