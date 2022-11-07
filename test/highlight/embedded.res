// NOT AN AUTOMATED TEST.
//
// Looks like Tree-sitter test framework does not allow to test
// for correct language embedding. So, this file is just a showcase
// to observe results with eyes.
//
// You should see comprehensive highlighting for constructs inside
// strings. That is, they should not look like plain strings if
// you have corresponding grammar installed.

// :TSInstall javascript
let inc = %raw(`function(x) {return x + 1;}`)

// :TSInstall graphql
let gql = %graphql(`{ hero { name } }`)
