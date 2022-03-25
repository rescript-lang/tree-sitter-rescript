
type rec t =
//<- keyword
//   ^ keyword
//       ^ type
  | Node(t, t)
//  ^ constant
//       ^ type
  | Terminal
//  ^ constant

type obj = {
  "x": int,
// ^ @property
}
