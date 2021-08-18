(comment) @comment

;(identifier) @variable
((identifier) @constant.macro
 (#match? @constant.macro "^\\.*$"))

[
  (type_identifier)
  (unit_type)
] @type

[
  (variant_identifier)
  (polyvar_identifier)
] @constant

(property_identifier) @property
(shorthand_property_identifier_pattern) @parameter
(module_name) @namespace

(string) @string
(number) @number
(polyvar) @constant

(decorator_identifier) @annotation
("@") @annotation

(include_statement) @include

[
 (formal_parameters (identifier))
 (positional_parameter (identifier))
 (labeled_parameter (identifier))
] @parameter

[
  (true)
  (false)
] @constant.builtin

[
  "type"
  "let"
  "external"
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

(ternary_expression ["?" ":"] @operator)

[
  "="
  "->"
] @operator

[
  "."
  ","
  "|"
] @punctuation.delimiter

[
  "("
  ")"
  "{"
  "}"
  "["
  "]"
] @punctuation.bracket

(polyvar_type
  [
   "["
   "[>"
   "[<"
   "]"
  ] @punctuation.bracket)

[
  "~"
  "?"
  "=>"
  (optional)
] @punctuation.special
