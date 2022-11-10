let inc = %raw(`function(x) {return x + 1;}`)
//          ^ keyword
//             ^ string

let gql = %graphql(`{ hero { name } }`)
//                 ^ string

let re = %re(`^[A-Z][a-z0-9]*$`)
//           ^ string
