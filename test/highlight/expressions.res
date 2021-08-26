
switch foo {
// <- conditional
| list{1, x, ...rest} =>
//^ type
//     ^ number
//        ^ parameter
//           ^ punctuation.special
//              ^ parameter
//                    ^ punctuation.special
  42
}

{ foo, bar: baz, qux: 1 }
//^ property
//     ^ property
