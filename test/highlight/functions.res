let inc = n => n + 1
//        ^ variable.parameter
//          ^ punctuation.special

let fn = (a, (b, c), {d, e}, [f, g]) => a + b + c + d + e + f + g
//        ^ variable.parameter
//            ^ variable.parameter
//                    ^ variable.parameter
//                            ^ variable.parameter

let uncurry = (. u, .x) => (u, x)
//             ^ operator
//                  ^ operator

let get = async (id) => id
//         ^ keyword
