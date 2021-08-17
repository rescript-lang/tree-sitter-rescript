(identifier) @variable
(type_identifier) @type
(variant_identifier) @constant
(property_identifier) @property
(shorthand_property_identifier_pattern) @parameter
(module_name) @namespace

(formal_parameters (identifier) @parameter)
(labeled_argument label: (identifier) @function)
(labeled_argument "~" @function)
(function "=>" @function)

(string) @string
(number) @number
(polyvar) @constant

[
  (true)
  (false)
] @constant.builtin

[
  "type"
  "let"
  "module"
] @keyword

[
  "if"
  "else"
  "switch"
] @conditional

[
  "-."
  "+."
  "/"
  "/."
  "<"
  "<="
  "=="
  "==="
  "!"
  "!="
  "!=="
  ">"
  ">="
  "&&"
  "||"
] @operator

[
  "="
  "->"
] @operator

[
  "."
  ","
] @punctuation.delimiter

[
  "("
  ")"
  "{"
  "}"
  "["
  "]"
]  @punctuation.bracket
