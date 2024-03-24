foo->bar == +x +. 1.0
// ^ operator
//       ^ operator
//          ^ operator
//            ^ operator


{ .  "x": 1 }
//    ^ property

switch foo {
// <- keyword.conditional
| list{1, x, ...rest} =>
//^ type
//     ^ number
//        ^ variable.parameter
//           ^ punctuation.special
//              ^ variable.parameter
//                    ^ operator
  42
| list{1, 2, ...list{b, ..._} as rest} => rest
//                   ^ variable.parameter
//                                ^ variable
| exception Js.Exn.Error(_) => 99
//^ keyword.exception
}

switch bar {
| #...Mod.t => 33
//^ constructor
}

{ foo, bar: baz, qux: 1 }
//^ property
//     ^ property

exception InputClosed(string)
//<- keyword.exception

raise(InputClosed("The stream has closed!"))
//<- keyword.exception

try {
//<- keyword.exception
  someOtherJSFunctionThatThrows()
} catch {
// ^ keyword.exception
| Not_found => 1 // catch a ReScript exception
| Invalid_argument(_) => 2 // catch a second ReScript exception
| Js.Exn.Error(obj) => 3 // catch the JS exception
}


let c = list{a, ...list{b}}
//        ^ type
//           ^ variable
//                      ^ variable

let x = fn()
//      ^ function.call     

let y = x->M.f->f
//           ^function.call
//              ^function.call   

let v = M.v
//        ^variable.member

let {x} = y
//   ^variable.member

let x = y.x
//        ^variable.member 

f(~a=b)
// ^property
