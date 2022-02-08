(comment) @comment

; Identifiers
;------------

; Escaped identifiers like \"+."
((value_identifier) @constant.macro
 (#match? @constant.macro "^\\.*$"))

[
  (type_identifier)
  (unit_type)
  "list"
] @type

[
  (variant_identifier)
  (polyvar_identifier)
] @constant

(property_identifier) @property
(module_identifier) @namespace

(jsx_identifier) @tag
(jsx_attribute (property_identifier) @attribute)

; Parameters
;----------------

(list_pattern (value_identifier) @parameter)
(spread_pattern (value_identifier) @parameter)

; String literals
;----------------

[
  (string)
  (template_string)
] @string

(template_substitution
  "${" @punctuation.bracket
  "}" @punctuation.bracket) @embedded

(character) @string.special
(escape_sequence) @string.escape

; Other literals
;---------------

[
  (true)
  (false)
] @constant.builtin

(number) @number
(polyvar) @constant
(polyvar_string) @constant

; Functions
;----------

[
 (formal_parameters (value_identifier))
 (labeled_parameter (value_identifier))
] @parameter

(function parameter: (value_identifier) @parameter)

; Meta
;-----

[
 "@"
 "@@"
 (decorator_identifier)
] @annotation

(extension_identifier) @keyword
("%") @keyword

; Misc
;-----

(subscript_expression index: (string) @property)
(polyvar_type_pattern "#" @constant)

[
  ("include")
  ("open")
] @include

[
  "as"
  "export"
  "external"
  "let"
  "module"
  "mutable"
  "private"
  "rec"
  "type"
  "and"
] @keyword

[
  "if"
  "else"
  "switch"
] @conditional

[
  "exception"
  "try"
  "catch"
  "raise"
] @exception

[
  "for"
  "in"
  "to"
  "downto"
  "while"
] @repeat

[
  "."
  ","
  "|"
] @punctuation.delimiter

[
  "++"
  "+"
  "+."
  "-"
  "-."
  "*"
  "*."
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
  "="
  ":="
  "->"
  "|>"
  ":>"
  (uncurry)
] @operator

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
  "..."
] @punctuation.special

(ternary_expression ["?" ":"] @operator)

