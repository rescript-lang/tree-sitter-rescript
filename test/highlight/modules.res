
@@warning("-27")
//<- attribute
//^attribute
//        ^ string

include NumericCurve({
// ^ keyword.import
//      ^ module
  let foo = foo
})

let {baz, _} = module(User.Inner)
//             ^ keyword
//                    ^ module
//                          ^ module

module Belt = {
  include (Belt: module type of Belt with module Map := Belt.Map and module Result := Belt.Result)
  // ^ keyword.import
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
//   ^ module
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
//                   ^ module
//                      ^ module
