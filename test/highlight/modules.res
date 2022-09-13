
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
