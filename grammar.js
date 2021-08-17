module.exports = grammar({
  name: 'rescript',

  supertypes: $ => [
    $.statement,
    $.declaration,
    $.expression,
    $.primary_expression,
    $.pattern,
    $._type,
  ],

  conflicts: $ => [
    [$.call_expression, $.expression],
    [$.primary_expression, $.pattern],
  ],

  rules: {
    source_file: $ => repeat($._statement),

    statement: $ => $._statement,

    _statement: $ => choice(
      $.expression_statement,
      $.declaration,
      $.statement_block,
    ),

    statement_block: $ => prec.right(seq(
      '{',
      repeat($.statement),
      '}',
    )),

    declaration: $ => choice(
      $.type_declaration,
      $.let_binding,
      $.module_declaration,
    ),

    module_declaration: $ => seq(
      'module',
      $.module_name,
      '=',
      $.statement_block,
    ),

    type_declaration: $ => seq(
      'type',
      $.type_identifier,
      optional(seq(
        '=',
        $._type,
      ))
    ),

    type_annotation: $ => seq(
      ':',
      $._type,
    ),

    _type: $ => choice(
      $.variant_type,
      $.record_type,
      $.type_identifier,
      $.nested_type_identifier,
      $.generic_type,
    ),

    variant_type: $ => seq(
      optional('|'),
      barSep1($.variant_declaration),
    ),

    variant_declaration: $ => prec.right(seq(
      $.variant_identifier,
      optional($.variant_parameters),
    )),

    variant_parameters: $ => seq(
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
      alias($.identifier, $.property_identifier),
      $.type_annotation,
    ),

    generic_type: $ => seq(
      choice(
        $.type_identifier,
        $.nested_type_identifier
      ),
      $.type_arguments
    ),

    type_arguments: $ => seq(
      '<', commaSep1($._type), optional(','), '>'
    ),

    let_binding: $ => seq(
      'let',
      $.identifier,
      '=',
      $.expression,
    ),

    expression_statement: $ => $.expression,

    expression: $ => choice(
      $.primary_expression,
    ),

    primary_expression: $ => choice(
      //$._symbol_reference,
      $.module_nested_identifier,
      $.identifier,
      $.number,
      $.string,
      $.function,
      $.polyvar,
      $.tuple,
      $.call_expression,
    ),

    module_nested_identifier: $ => seq(
      repeat1(seq($.module_name, '.')),
      $.identifier,
    ),

    function: $ => seq(
      choice(
        field('parameter', $.identifier),
        $._definition_signature
      ),
      '=>',
      field('body', choice(
        $.expression,
        $.statement_block
      ))
    ),

    tuple: $ => seq(
      '(',
      commaSep1($.expression),
      ')',
    ),

    call_expression: $ => seq(
      field('function', $.primary_expression),
      field('arguments', $.arguments),
    ),

    arguments: $ => seq(
      '(',
      commaSep(optional($.expression)),
      ')'
    ),

    _definition_signature: $ => field('parameters', $.formal_parameters),
    _formal_parameter: $ => choice($.pattern/*, $.assignment_pattern TODO */),

    formal_parameters: $ => seq(
      '(',
      optional(seq(
        commaSep1($._formal_parameter),
        optional(',')
      )),
      ')'
    ),

    // This negative dynamic precedence ensures that during error recovery,
    // unfinished constructs are generally treated as literal expressions,
    // not patterns.
    pattern: $ => prec.dynamic(-1, choice(
      $.identifier,
      // $._destructuring_pattern, // TODO
    )),

    _symbol_reference: $ => seq(repeat(seq($.module_name, '.')), $.identifier),

    nested_type_identifier: $ => seq(repeat1(seq($.module_name, '.')), $.type_identifier),

    variant_identifier: $ => /[A-Z][a-zA-Z0-9_]*/,

    polyvar: $ => seq('#', /[a-zA-Z0-9_]*/),

    type_identifier: $ => /[a-z_'][a-zA-Z0-9_]*/,

    identifier: $ => /[a-z_][a-zA-Z0-9_']*/,

    module_name: $ => /[A-Z][a-zA-Z0-9_]*/,

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

      const decimal_literal = choice(
        seq(decimal_integer_literal, '.', optional(decimal_digits), optional(exponent_part)),
        seq('.', decimal_digits, optional(exponent_part)),
        seq(decimal_integer_literal, exponent_part),
        seq(decimal_digits),
      )

      return token(choice(
        hex_literal,
        decimal_literal,
        binary_literal,
        octal_literal,
        bigint_literal,
      ))
    },

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
  },
});

function barSep1(rule) {
  return seq(rule, repeat(seq('|', rule)));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSep1t(rule) {
  return seq(commaSep1(rule), optional(','))
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}
