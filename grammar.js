module.exports = grammar({
  name: 'rescript',

  supertypes: $ => [
    $.statement,
    //$.declaration,
    $.expression,
    $.primary_expression,
    $.pattern,
  ],

  rules: {
    source_file: $ => repeat($._statement),

    statement: $ => $._statement,

    _statement: $ => choice(
      $._type_declaration,
      $.expression_statement,
    ),

    statement_block: $ => prec.right(seq(
      '{',
      repeat($.statement),
      '}',
    )),

    _type_declaration: $ => choice(
      $.opaque_type,
      $.alias_type,
      $.record_type,
      $.let_binding,
    ),

    opaque_type: $ => seq('type', $.type_name),
    alias_type: $ => seq('type', $.type_name, '=', $._type_reference),
    record_type: $ => seq('type', $.type_name, '=', $._record_definition),

    _record_definition: $ => seq(
      '{',
      repeat($.record_type_field),
      '}',
    ),

    record_type_field: $ => seq(
      $.identifier,
      ':',
      $._type_reference,
      ',',
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
      $.identifier,
      $.number,
      $.string,
      $.function,
      $.polyvar,
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

    _type_reference: $ => seq(repeat(seq($.module_name, '.')), $.type_name),

    polyvar: $ => seq('#', /[a-zA-Z0-9_]*/),

    type_name: $ => /[a-z_][a-zA-Z0-9_']*/,

    module_name: $ => /[A-Z][a-zA-Z0-9_]*/,

    identifier: $ => /[a-z_][a-z0-9_']*/,

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

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}
