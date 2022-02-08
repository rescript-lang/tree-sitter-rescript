module.exports = grammar({
  name: 'rescript',

  externals: $ => [
    $._newline,
    $.comment,
    $._newline_and_comment,
    '"',
    "`",
    $._template_chars,
    $._lparen,
    $._rparen,
  ],

  extras: $ => [
    $.comment,
    /[\s\uFEFF\u2060\u200B\u00A0]/
  ],

  supertypes: $ => [
    $.statement,
    $.declaration,
    $.expression,
    $.primary_expression,
    $._type,
    $.module_expression,
  ],

  precedences: $ => [
    [
      'unary_not',
      'member',
      'call',
      $.spread_element,
      'binary_times',
      'binary_plus',
      'binary_compare',
      'binary_relation',
      'binary_and',
      'binary_or',
      'coercion_relation',
      $.expression,
      $.primary_expression,
      $.ternary_expression,
      $.mutation_expression,
      $.function,
      $.let_binding,
    ],
    [$._jsx_attribute_value, $.pipe_expression],
    [$.function_type_parameters, $.function_type],
    [$.module_identifier_path, $.module_type_of],
  ],

  conflicts: $ => [
    [$.unit, $.formal_parameters],
    [$.pipe_expression, $.expression],
    [$.primary_expression, $._pattern],
    [$.primary_expression, $.record_pattern],
    [$.primary_expression, $.spread_pattern],
    [$.primary_expression, $._literal_pattern],
    [$.tuple_pattern, $._formal_parameter],
    [$.primary_expression, $._formal_parameter],
    [$.primary_expression, $.record_field],
    [$.module_identifier_path, $.module_expression],
    [$.tuple_type, $.function_type_parameter],
    [$.list, $.list_pattern],
    [$.array, $.array_pattern],
    [$.record_field, $.record_pattern],
    [$.expression_statement, $.ternary_expression],
    [$._type_declaration],
    [$.let_binding, $.ternary_expression],
    [$.variant_identifier, $.module_identifier],
    [$.variant],
    [$.variant, $.variant_pattern],
    [$.variant_declaration, $.function_type_parameter],
    [$.polyvar],
    [$.polyvar, $.polyvar_pattern],
    [$._pattern],
    [$._record_element, $.jsx_expression],
    [$.record_field, $._record_single_field],
    [$._record_field_name, $.record_pattern],
    [$.decorator],
    [$._statement, $._one_or_more_statements],
    [$._simple_extension],
    [$._inline_type, $.function_type_parameters],
  ],

  rules: {
    source_file: $ => seq(
      repeat($._statement_delimeter),
      repeat($._statement)
    ),

    _statement: $ => seq(
      $.statement,
      repeat1($._statement_delimeter)
    ),

    _statement_delimeter: $ => choice(
      ';',
      $._newline,
      alias($._newline_and_comment, $.comment),
    ),

    _one_or_more_statements: $ => seq(
      repeat($._statement),
      $.statement,
      optional($._statement_delimeter),
    ),

    statement: $ => choice(
      alias($._decorated_statement, $.decorated),
      $.decorator_statement,
      $.expression_statement,
      $.declaration,
      $.open_statement,
      $.include_statement,
    ),

    _decorated_statement: $ => seq(
      repeat1($.decorator),
      $.declaration,
    ),

    decorator_statement: $ => seq(
      '@@',
      $.decorator_identifier,
      optional($.decorator_arguments)
    ),

    block: $ => prec.right(seq(
      '{',
      optional($._one_or_more_statements),
      '}',
    )),

    open_statement: $ => seq(
      'open',
      optional('!'),
      $.module_expression,
    ),

    include_statement: $ => seq(
      'include',
      $.module_expression,
    ),

    declaration: $ => choice(
      $.type_declaration,
      $.let_binding,
      $.module_declaration,
      $.external_declaration,
      $.exception_declaration,
    ),

    module_declaration: $ => seq(
      'module',
      optional('rec'),
      optional('type'),
      field('name', $.module_identifier),
      optional(seq(
        ':',
        field('signature', choice($.block, $.module_expression)),
      )),
      optional(seq(
        '=',
        field('definition', $._module_definition),
      )),
    ),

    _module_definition: $ => choice(
      $.block,
      $.module_expression,
      $.functor,
      $.extension_expression,
    ),

    functor: $ => seq(
      field('parameters', $.functor_parameters),
      optional(field('return_module_type', $.module_type_annotation)),
      '=>',
      field('body', $._module_definition),
    ),

    functor_parameters: $ => seq(
      '(',
      optional(commaSep1t($.functor_parameter)),
      ')',
    ),

    functor_parameter: $ => seq(
      $.module_identifier,
      $.module_type_annotation,
    ),

    module_type_annotation: $ => seq(
      ':',
      choice(
        $.module_expression,
        $.block,
      )
    ),

    external_declaration: $ => seq(
      'external',
      $.value_identifier,
      $.type_annotation,
      '=',
      $.string,
    ),

    exception_declaration: $ => seq(
      'exception',
      $.variant_identifier,
      optional($.variant_parameters),
    ),

    type_declaration: $ => seq(
      optional('export'),
      'type',
      optional('rec'),
      $._type_declaration,
    ),

    _type_declaration: $ => seq(
      $.type_identifier,
      optional($.type_parameters),
      optional(seq(
        '=',
        optional('private'),
        $._type,
        optional(seq(
          'and',
          $._type_declaration
        )),
      )),
    ),

    type_parameters: $ => seq(
      '<',
      commaSep1t($.type_identifier),
      '>',
    ),

    type_annotation: $ => seq(
      ':',
      repeat($.decorator),
      $._inline_type,
    ),

    _type: $ => choice(
      $._inline_type,
      $.variant_type,
      $.record_type,
    ),

    _inline_type: $ => choice(
      $._non_function_inline_type,
      $.function_type,
    ),

    _non_function_inline_type: $ => choice(
      $._type_identifier,
      $.tuple_type,
      $.polyvar_type,
      $.object_type,
      $.generic_type,
      $.unit_type,
    ),

    tuple_type: $ => prec.dynamic(-1, seq(
      '(',
      commaSep1t($._type),
      ')',
    )),

    variant_type: $ => prec.left(seq(
      optional('|'),
      barSep1($.variant_declaration),
    )),

    variant_declaration: $ => prec.right(seq(
      optional($.decorator),
      $.variant_identifier,
      optional($.variant_parameters),
      optional($.type_annotation),
    )),

    variant_parameters: $ => seq(
      '(',
      commaSep1t($._type),
      ')',
    ),

    polyvar_type: $ => seq(
      choice('[', '[>', '[<',),
      optional('|'),
      barSep1($.polyvar_declaration),
      ']',
    ),

    polyvar_declaration: $ => prec.right(
      choice(
        seq(
          optional($.decorator),
          $.polyvar_identifier,
          optional($.polyvar_parameters),
        ),
        $._type_identifier
      )
    ),

    polyvar_parameters: $ => seq(
      '(',
      commaSep1t($._type),
      ')',
    ),

    record_type: $ => seq(
      '{',
      commaSep1t($.record_type_field),
      '}',
    ),

    record_type_field: $ => seq(
      repeat($.decorator),
      optional('mutable'),
      alias($.value_identifier, $.property_identifier),
      $.type_annotation,
    ),

    object_type: $ => seq(
      '{',
      choice(
        commaSep1t($._object_type_field),
        seq('.', commaSept($._object_type_field)),
        seq('..', commaSept($._object_type_field)),
      ),
      '}',
    ),

    _object_type_field: $ => alias($.object_type_field, $.field),

    object_type_field: $ => seq(
      alias($.string, $.property_identifier),
      ':',
      $._type,
    ),

    generic_type: $ => seq(
      $._type_identifier,
      $.type_arguments
    ),

    type_arguments: $ => seq(
      '<',
      commaSep1t($._type),
      '>'
    ),

    function_type: $ => prec.left(seq(
      $.function_type_parameters,
      '=>',
      $._type,
    )),

    function_type_parameters: $ => choice(
      $._non_function_inline_type,
      $._function_type_parameter_list,
    ),

    _function_type_parameter_list: $ => seq(
      '(',
      commaSept(alias($.function_type_parameter, $.parameter)),
      ')',
    ),

    function_type_parameter: $ => seq(
      optional($.uncurry),
      repeat($.decorator),
      choice(
        $._type,
        seq($.uncurry, $._type),
        $.labeled_parameter,
      ),
    ),

    let_binding: $ => seq(
      choice('export', 'let'),
      optional('rec'),
      $._let_binding,
    ),

    _let_binding: $ => seq(
      choice($._pattern, $.unit),
      optional($.type_annotation),
      optional(seq(
        '=',
        $.expression,
        optional(seq(
          'and',
          $._let_binding,
        )),
      )),
    ),

    expression_statement: $ => $.expression,

    expression: $ => choice(
      $.primary_expression,
      $._jsx_element,
      $.jsx_fragment,
      $.unary_expression,
      $.binary_expression,
      $.coercion_expression,
      $.ternary_expression,
      $.for_expression,
      $.while_expression,
      $.mutation_expression,
      $.block,
    ),

    primary_expression: $ => choice(
      $.parenthesized_expression,
      $.value_identifier_path,
      $.value_identifier,
      $.number,
      $.string,
      $.template_string,
      $.character,
      $.true,
      $.false,
      $.function,
      $.unit,
      $.record,
      $.object,
      $.tuple,
      $.array,
      $.list,
      $.variant,
      $.polyvar,
      $.if_expression,
      $.switch_expression,
      $.try_expression,
      $.call_expression,
      $.raise_expression,
      $.pipe_expression,
      $.subscript_expression,
      $.member_expression,
      $.extension_expression,
    ),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),

    value_identifier_path: $ => seq(
      repeat1(seq($.module_identifier, '.')),
      $.value_identifier,
    ),

    function: $ => prec.left(seq(
      choice(
        field('parameter', $.value_identifier),
        $._definition_signature
      ),
      '=>',
      field('body', $.expression),
    )),

    record: $ => seq(
      '{',
      choice(
        alias($._record_single_field, $.record_field),
        commaSep2t($._record_element),
      ),
      '}',
    ),

    _record_element: $ => choice(
      $.spread_element,
      $.record_field,
    ),

    record_field: $ => seq(
      $._record_field_name,
      optional(seq(
        ':',
        $.expression,
      )),
    ),

    _record_single_field: $ => seq(
      $._record_field_name,
      ':',
      $.expression,
      optional(','),
    ),

    _record_field_name: $ => choice(
      alias($.value_identifier, $.property_identifier),
      alias($.value_identifier_path, $.property_identifier),
    ),

    object: $ => seq(
      '{',
      choice(
        commaSep1t($._object_field),
        seq('.', commaSept($._object_field)),
        seq('..', commaSept($._object_field)),
      ),
      '}',
    ),

    _object_field: $ => alias($.object_field, $.field),

    object_field: $ => seq(
      alias($.string, $.property_identifier),
      ':',
      $.expression,
    ),

    tuple: $ => seq(
      '(',
      commaSep2t($.expression),
      ')',
    ),

    array: $ => seq(
      '[',
      commaSept($.expression),
      ']'
    ),

    list: $ => seq(
      'list',
      '{',
      optional(commaSep1t($._list_element)),
      '}'
    ),

    _list_element: $ => choice(
      $.expression,
      $.spread_element,
    ),

    if_expression: $ => seq(
      'if',
      $.expression,
      $.block,
      repeat($.else_if_clause),
      optional($.else_clause),
    ),

    else_if_clause: $ => seq(
      'else',
      'if',
      $.expression,
      $.block,
    ),

    else_clause: $ => seq(
      'else',
      $.block,
    ),

    switch_expression: $ => seq(
      'switch',
      $.expression,
      '{',
      repeat($.switch_match),
      '}',
    ),

    switch_match: $ => prec.dynamic(-1, seq(
      '|',
      $._switch_pattern,
      '=>',
      $._one_or_more_statements,
    )),

    _switch_pattern: $ => barSep1(choice(
      alias($._switch_exception_pattern, $.exception),
      $._switch_value_pattern,
      $.polyvar_type_pattern,
    )),

    _switch_exception_pattern: $ => seq(
      'exception',
      $._switch_value_pattern,
    ),

    _switch_value_pattern: $ => seq(
      $._pattern,
      optional($.switch_pattern_condition),
    ),

    switch_pattern_condition: $ => seq(
      'if',
      $.expression,
    ),

    polyvar_type_pattern: $ => seq(
      '#',
      '...',
      $._type_identifier,
      optional($.as_aliasing)
    ),

    try_expression: $ => seq(
      'try',
      $.block,
      'catch',
      '{',
      repeat($.switch_match),
      '}',
    ),

    as_aliasing: $ => seq(
      'as',
      $.value_identifier,
    ),

    call_expression: $ => prec('call', seq(
      field('function', $.primary_expression),
      field('arguments', alias($.call_arguments, $.arguments)),
    )),

    raise_expression: $ => prec('call', seq(
      'raise',
      '(',
      $.variant,
      ')',
    )),

    pipe_expression: $ => prec.left(seq(
      $.primary_expression,
      choice('->', '|>'),
      choice(
        $.value_identifier,
        $.value_identifier_path,
        choice($.variant_identifier, $.nested_variant_identifier),
      ),
    )),

    call_arguments: $ => seq(
      '(',
      optional($.uncurry),
      optional(commaSep1t(choice(
        $.expression,
        $.labeled_argument,
      ))),
      ')'
    ),

    labeled_argument: $ => seq(
      '~',
      field('label', $.value_identifier),
      optional(choice(
        '?',
        seq(
          '=',
          optional('?'),
          field('value', $.expression),
        ),
      )),
    ),

    _definition_signature: $ => seq(
      field('parameters', $.formal_parameters),
      optional(field('return_type', alias($._return_type_annotation, $.type_annotation))),
    ),

    _return_type_annotation: $ => seq(
      ':',
      $._non_function_inline_type,
    ),

    formal_parameters: $ => seq(
      '(',
      optional(commaSep1t($._formal_parameter)),
      ')'
    ),

    _formal_parameter: $ => seq(
      optional($.uncurry),
      choice(
        $._pattern,
        $.labeled_parameter,
        $.unit,
        $.type_parameter,
      ),
    ),

    labeled_parameter: $ => seq(
      '~',
      $.value_identifier,
      optional($.as_aliasing),
      optional($.type_annotation),
      optional(field('default_value', $._labeled_parameter_default_value)),
    ),

    type_parameter: $ => seq(
      'type',
      $.type_identifier,
    ),

    _labeled_parameter_default_value: $ => seq(
      '=',
      choice(
        '?',
        $.expression,
      ),
    ),

    // This negative dynamic precedence ensures that during error recovery,
    // unfinished constructs are generally treated as literal expressions,
    // not patterns.
    _pattern: $ => prec.dynamic(-1, seq(
      barSep1(choice(
        $.value_identifier,
        $._literal_pattern,
        $._destructuring_pattern,
      )),
      optional($.type_annotation),
      optional($.as_aliasing),
    )),

    _destructuring_pattern: $ => choice(
      $.variant_pattern,
      $.polyvar_pattern,
      $.record_pattern,
      $.tuple_pattern,
      $.array_pattern,
      $.list_pattern,
    ),

    _literal_pattern: $ => choice(
      $.string,
      $.template_string,
      $.character,
      $.number,
      $.true,
      $.false,
    ),

    variant_pattern: $ => seq(
      choice(
        $.variant_identifier,
        $.nested_variant_identifier,
      ),
      optional(alias($._variant_pattern_parameters, $.formal_parameters))
    ),

    _variant_pattern_parameters: $ => seq(
      '(',
      commaSep1t($._variant_pattern_parameter),
      ')',
    ),

    _variant_pattern_parameter: $ => seq(
      barSep1($._pattern),
      optional($.type_annotation),
    ),

    polyvar_pattern: $ => seq(
      $.polyvar_identifier,
      optional(alias($._variant_pattern_parameters, $.formal_parameters))
    ),

    record_pattern: $ => seq(
      '{',
      commaSep1t(seq(
        $.value_identifier,
        optional(seq(
          ':',
          barSep1($._pattern),
        )),
      )),
      '}'
    ),

    tuple_pattern: $ => seq(
      '(',
      commaSep2t(alias($._pattern, $.tuple_item_pattern)),
      ')',
    ),

    array_pattern: $ => seq(
      '[',
      optional(commaSep1t($._collection_element_pattern)),
      ']',
    ),

    list_pattern: $ => seq(
      'list',
      '{',
      optional(commaSep1t($._collection_element_pattern)),
      '}',
    ),

    _collection_element_pattern: $ => seq(
      choice($._pattern, $.spread_pattern),
    ),

    spread_pattern: $ => seq(
      '...',
      $.value_identifier,
    ),

    _jsx_element: $ => choice($.jsx_element, $.jsx_self_closing_element),

    jsx_element: $ => seq(
      field('open_tag', $.jsx_opening_element),
      repeat($._jsx_child),
      field('close_tag', $.jsx_closing_element)
    ),

    jsx_fragment: $ => seq('<', '>', repeat($._jsx_child), '<', '/', '>'),

    jsx_expression: $ => seq(
      '{',
      optional(choice(
        $._one_or_more_statements,
        $.spread_element
      )),
      '}'
    ),

    _jsx_child: $ => choice(
      $.value_identifier,
      $.value_identifier_path,
      $.number,
      $.string,
      $.template_string,
      $.character,
      $._jsx_element,
      $.jsx_fragment,
      $.block,
      $.spread_element,
    ),

    jsx_opening_element: $ => prec.dynamic(-1, seq(
      '<',
      field('name', $._jsx_element_name),
      repeat(field('attribute', $.jsx_attribute)),
      '>'
    )),

    _jsx_identifier: $ => alias(
      choice($.value_identifier, $.module_identifier),
      $.jsx_identifier
    ),

    nested_jsx_identifier: $ => prec('member', seq(
      choice($._jsx_identifier, $.nested_jsx_identifier),
      '.',
      $._jsx_identifier
    )),

    _jsx_element_name: $ => choice(
      $._jsx_identifier,
      $.nested_jsx_identifier,
    ),

    jsx_closing_element: $ => seq(
      '<',
      '/',
      field('name', $._jsx_element_name),
      '>'
    ),

    jsx_self_closing_element: $ => seq(
      '<',
      field('name', $._jsx_element_name),
      repeat(field('attribute', $.jsx_attribute)),
      '/',
      '>'
    ),

    _jsx_attribute_name: $ => alias($.value_identifier, $.property_identifier),

    jsx_attribute: $ => seq(
      optional('?'),
      $._jsx_attribute_name,
      optional(seq(
        '=',
        optional('?'),
        $._jsx_attribute_value
      )),
    ),

    _jsx_attribute_value: $ => choice(
      $.primary_expression,
      $.jsx_expression,
    ),

    mutation_expression: $ => seq(
      $._mutation_lvalue,
      choice('=', ':='),
      $.expression,
    ),

    _mutation_lvalue: $ => choice(
      $.value_identifier,
      $.member_expression,
      $.subscript_expression,
    ),

    decorator: $ => seq(
      '@',
      $.decorator_identifier,
      optional($.decorator_arguments)
    ),

    decorator_arguments: $ => seq(
      '(',
      commaSept($.expression),
      ')',
    ),

    subscript_expression: $ => prec.right('member', seq(
      field('object', $.primary_expression),
      '[', field('index', $.expression), ']'
    )),

    member_expression: $ => prec('member', seq(
      field('record', $.primary_expression),
      '.',
      optional(seq(
        field('module', $.module_identifier),
        '.')
      ),
      field('property', alias($.value_identifier, $.property_identifier)),
    )),

    spread_element: $ => seq('...', $.expression),

    ternary_expression: $ => prec.left(seq(
      field('condition', $.expression),
      '?',
      field('consequence', $.expression),
      ':',
      field('alternative', $.expression)
    )),

    for_expression: $ => seq(
      'for',
      $.value_identifier,
      'in',
      $.expression,
      choice('to', 'downto'),
      $.expression,
      $.block,
    ),

    while_expression: $ => seq(
      'while',
      $.expression,
      $.block,
    ),

    binary_expression: $ => choice(
      ...[
        ['&&', 'binary_and'],
        ['||', 'binary_or'],
        ['++', 'binary_plus'],
        ['+', 'binary_plus'],
        ['+.', 'binary_plus'],
        ['-', 'binary_plus'],
        ['-.', 'binary_plus'],
        ['*', 'binary_times'],
        ['*.', 'binary_times'],
        ['/', 'binary_times'],
        ['/.', 'binary_times'],
        ['<', 'binary_relation'],
        ['<=', 'binary_relation'],
        ['==', 'binary_relation'],
        ['===', 'binary_relation'],
        ['!=', 'binary_relation'],
        ['!==', 'binary_relation'],
        ['>=', 'binary_relation'],
        ['>', 'binary_relation'],
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('left', $.expression),
          field('operator', operator),
          field('right', $.expression)
        ))
      )
    ),

    coercion_expression: $ => prec.left(
      'coercion_relation',
      seq(
        field('left', $.expression),
        field('operator', ':>'),
        field('right', $._type_identifier),
      )
    ),

    unary_expression: $ => choice(...[
      ['!', 'unary_not'],
      ['-', 'unary_not'],
      ['-.', 'unary_not'],
      ['+', 'unary_not'],
      ['+.', 'unary_not'],
    ].map(([operator, precedence]) =>
      prec.left(precedence, seq(
        field('operator', operator),
        field('argument', $.expression)
      ))
    )),

    extension_expression: $ => prec('call', seq(
      repeat1('%'),
      choice(
        $._raw_js_extension,
        $._raw_gql_extension,
        $._simple_extension,
      ),
    )),

    _simple_extension: $ => seq(
      $.extension_identifier,
      optional($._extension_expression_payload),
    ),

    _raw_js_extension: $ => seq(
      alias(token('raw'), $.extension_identifier),
      '(',
      alias($._raw_js, $.expression_statement),
      ')',
    ),

    _raw_js: $ => choice(
      alias($._raw_js_template_string, $.template_string),
      alias($._raw_js_string, $.string),
    ),

    _raw_js_string: $ => alias($.string, $.raw_js),

    _raw_js_template_string: $ => seq(
      '`',
      alias(repeat($._template_string_content), $.raw_js),
      '`',
    ),

    _raw_gql_extension: $ => seq(
      alias(token('graphql'), $.extension_identifier),
      '(',
      alias($._raw_gql, $.expression_statement),
      ')',
    ),

    _raw_gql: $ => choice(
      alias($._raw_gql_template_string, $.template_string),
      alias($._raw_gql_string, $.string),
    ),

    _raw_gql_string: $ => alias($.string, $.raw_gql),

    _raw_gql_template_string: $ => seq(
      '`',
      alias(repeat($._template_string_content), $.raw_gql),
      '`',
    ),

    _extension_expression_payload: $ => seq(
      '(',
      $._one_or_more_statements,
      // explicit newline here because it won’t be reported otherwise by the scanner
      // because we’re in parens
      optional($._newline),
      ')',
    ),

    variant: $ => prec.dynamic(-1, seq(
      choice($.variant_identifier, $.nested_variant_identifier),
      optional(alias($.variant_arguments, $.arguments)),
    )),

    nested_variant_identifier: $ => seq(
      repeat1(seq($.module_identifier, '.')),
      $.variant_identifier
    ),

    variant_arguments: $ => seq(
      '(',
      commaSept($.expression),
      ')',
    ),

    polyvar: $ => seq(
      $.polyvar_identifier,
      optional(alias($.variant_arguments, $.arguments)),
    ),

    _type_identifier: $ =>
      choice(
        $.type_identifier,
        $.type_identifier_path,
      ),

    type_identifier_path: $ => seq(
      repeat1(seq($.module_identifier, '.')),
      $.type_identifier
    ),

    module_expression: $ => choice(
      $.module_identifier,
      $.module_identifier_path,
      $.module_type_of,
      $.functor_use,
    ),

    module_identifier_path: $ => prec.left(seq(
      $.module_expression,
      '.',
      $.module_identifier,
    )),

    module_type_of: $ => prec.dynamic(-1, seq(
      'module',
      'type',
      'of',
      $.module_expression,
    )),

    functor_use: $ => seq(
      choice(
        $.module_identifier,
        $.module_identifier_path,
      ),
      alias($.functor_arguments, $.arguments),
    ),

    functor_arguments: $ => seq(
      '(',
      optional(commaSep1t($._functor_argument)),
      ')',
    ),

    _functor_argument: $ => choice(
      $.module_expression,
      $.block,
    ),

    variant_identifier: $ => /[A-Z][a-zA-Z0-9_]*/,

    polyvar_identifier: $ => seq(
      '#',
      choice(
        /[a-zA-Z0-9_]+/,
        seq(
          optional('\\'),
          alias($.string, $.polyvar_string),
        ),
      ),
    ),

    type_identifier: $ => choice(
      /[a-z_'][a-zA-Z0-9_]*/,
      $._escape_identifier,
    ),

    value_identifier: $ => choice(
      /[a-z_][a-zA-Z0-9_']*/,
      $._escape_identifier,
    ),

    _escape_identifier: $ => token(seq('\\"', /[^"]+/ , '"')),

    module_identifier: $ => /[A-Z][a-zA-Z0-9_]*/,

    decorator_identifier: $ => /[a-zA-Z0-9_\.]+/,

    extension_identifier: $ => /[a-zA-Z0-9_\.]+/,

    number: $ => {
      const hex_literal = seq(
        choice('0x', '0X'),
        /[\da-fA-F](_?[\da-fA-F])*/
      )

      const decimal_digits = /\d(_?\d)*/
      const signed_integer = seq(optional(choice('-', '+')), decimal_digits)
      const exponent_part = seq(choice('e', 'E'), signed_integer)

      const binary_literal = seq(choice('0b', '0B'), /[0-1](_?[0-1])*/)

      const octal_literal = seq(choice('0o', '0O'), /[0-7](_?[0-7])*/)

      const bigint_literal = seq(choice(hex_literal, binary_literal, octal_literal, decimal_digits), 'n')

      const decimal_integer_literal = choice(
        '0',
        seq(optional('0'), /[1-9]/, optional(seq(optional('_'), decimal_digits)))
      )

      const decimal_literal = seq(
        optional(choice('-', '+')),
        choice(
          seq(decimal_integer_literal, '.', optional(decimal_digits), optional(exponent_part)),
          seq('.', decimal_digits, optional(exponent_part)),
          seq(decimal_integer_literal, exponent_part),
          seq(decimal_digits),
        )
      )

      return token(choice(
        hex_literal,
        decimal_literal,
        binary_literal,
        octal_literal,
        bigint_literal,
      ))
    },

    unit: $ => seq('(', ')'),
    unit_type: $ => 'unit',

    true: $ => 'true',
    false: $ => 'false',

    string: $ => seq(
      '"',
      repeat(choice(
        alias($.unescaped_double_string_fragment, $.string_fragment),
        $.escape_sequence
      )),
      '"'
    ),

    // Workaround to https://github.com/tree-sitter/tree-sitter/issues/1156
    // We give names to the token() constructs containing a regexp
    // so as to obtain a node in the CST.
    //
    unescaped_double_string_fragment: $ =>
      token.immediate(prec(1, /[^"\\]+/)),

    escape_sequence: $ => token.immediate(seq(
      '\\',
      choice(
        /[^xu0-7]/,
        /[0-7]{1,3}/,
        /x[0-9a-fA-F]{2}/,
        /u[0-9a-fA-F]{4}/,
        /u{[0-9a-fA-F]+}/
      )
    )),

    template_string: $ => seq(
      token(seq(
        optional(choice(
          'j',
          'js',
          'json',
        )),
        '`',
      )),
      repeat($._template_string_content),
      '`'
    ),

    _template_string_content: $ => choice(
      $._template_chars,
      $.template_substitution,
      choice(
        alias('\\`', $.escape_sequence),
        $.escape_sequence,
      ),
    ),

    template_substitution: $ => choice(
      seq('$', $.value_identifier),
      seq('${', $.expression, '}'),
    ),

    character: $ => seq(
      "'",
      choice(/[^\\']/, $.escape_sequence),
      "'"
    ),

    _unescaped_template_string_fragment: $ =>
      token.immediate(prec(1, /[^`\\\$]+/)),

    lparen: $ => alias($._lparen, '('),
    rparen: $ => alias($._rparen, ')'),
    uncurry: $ => '.',
  },
});

function barSep1(rule) {
  return seq(rule, repeat(seq('|', rule)));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSep2(rule) {
  return seq(rule, ',', commaSep1(rule));
}

function commaSep1t(rule) {
  return seq(commaSep1(rule), optional(','));
}

function commaSep2t(rule) {
  return seq(commaSep2(rule), optional(','));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSept(rule) {
  return optional(commaSep1t(rule));
}
