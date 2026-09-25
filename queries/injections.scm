([
  (line_comment)
  (block_comment)
] @injection.content (#set! injection.language "comment"))

; regex literal
(regex
  (regex_pattern) @injection.content (#set! injection.language "regex"))

; %re
(extension_expression
  (extension_identifier) @_name
  (#eq? @_name "re")
  (expression_statement (_) @injection.content (#set! injection.language "regex")))

; %raw
(extension_expression
  (extension_identifier) @_name
  (#eq? @_name "raw")
  (expression_statement
    [
      (string (string_fragment) @injection.content)
      (template_string (template_string_content) @injection.content)
      (tagged_template_expression
        (template_string (template_string_content) @injection.content))
    ]
    (#set! injection.language "javascript")))

; %graphql
(extension_expression
  (extension_identifier) @_name
  (#eq? @_name "graphql")
  (expression_statement
    [
      (string (string_fragment) @injection.content)
      (template_string (template_string_content) @injection.content)
      (tagged_template_expression
        (template_string (template_string_content) @injection.content))
    ]
    (#set! injection.language "graphql")))

; %relay
(extension_expression
  (extension_identifier) @_name
  (#eq? @_name "relay")
  (expression_statement
    [
      (string (string_fragment) @injection.content)
      (template_string (template_string_content) @injection.content)
      (tagged_template_expression
        (template_string (template_string_content) @injection.content))
    ]
    (#set! injection.language "graphql")))
