let inc = n => n + 1
//        ^ variable.parameter
//          ^ punctuation.special
//  ^ function

let fn = (a, (b, c), {d, e}, [f, g]) => a + b + c + d + e + f + g
//        ^ variable.parameter
//            ^ variable.parameter
//                    ^ variable.parameter
//                            ^ variable.parameter

let get = async (id) => id
//         ^ keyword.coroutine
