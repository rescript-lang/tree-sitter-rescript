(comment) @comment

; %re("")
(extension_expression
  (extension_identifier) @_name
  (#eq? @_name "re")
  (expression_statement (string) @regex))

; %re(``)
(extension_expression
  (extension_identifier) @_name
  (#eq? @_name "re")
  (expression_statement
    (template_string 
      (template_string_content) @regex)))

; %raw("") or %%raw("")
(extension_expression
  (extension_identifier) @_name
  (#eq? @_name "raw")
  (expression_statement
    (string
      (string_fragment) @javascript)))

; %raw(``) or %%raw(``)
(extension_expression
  (extension_identifier) @_name
  (#eq? @_name "raw")
  (expression_statement
    (template_string
      (template_string_content) @javascript)))

; %graphql``
(extension_expression
  (extension_identifier) @_name
  (#eq? @_name "graphql")
  (expression_statement
    (string 
      (string_fragment) @graphql)))

; %graphql""
 (extension_expression
  (extension_identifier) @_name
  (#eq? @_name "graphql")
  (expression_statement
    (string
      (string_fragment) @graphql)))
