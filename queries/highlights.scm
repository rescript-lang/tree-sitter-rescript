(identifier) @variable
(type_identifier) @type
(variant_identifier) @constant
(property_identifier) @property
(module_name) @namespace

(formal_parameters
  [
    (identifier) @variable.parameter
  ]
)

(string) @string
(number) @number
(polyvar) @constant

[
  "type"
  "let"
  "module"
] @keyword

[
  "="
  "=>"
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
]  @punctuation.bracket
