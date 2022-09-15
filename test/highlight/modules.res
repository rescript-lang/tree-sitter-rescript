
@@warning("-27")
//<- annotation
//^annotation
//        ^ string

include NumericCurve({
// ^ include
//      ^ namespace
  let foo = foo
})

let {baz, _} = module(User.Inner)
//             ^ keyword
//                    ^ namespace
//                          ^ namespace

module Belt = {
  include (Belt: module type of Belt with module Map := Belt.Map and module Result := Belt.Result)
  // ^ include
  //              ^ keyword
  //                                  ^ keyword
  //                                                                                ^ operator
}

let a = module(
//      ^ keyword
  {
    type t
    let hello = "Hello"
  }: X
//   ^ namespace
)

module B = unpack(a)
//         ^ keyword

module type A = {
  type t = int
  let value: t
}

module A: A = {
  type t = int
  let value: t = 42
}

let packedA = module(A: A)
//                   ^ namespace
//                      ^ namespace
