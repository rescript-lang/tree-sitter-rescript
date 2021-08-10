module.exports = grammar({
  name: 'rescript',

  rules: {
    source_file: $ => repeat($._definition),

    _definition: $ => choice(
      $.type_definition,
    ),

    type_definition: $ => seq(
      'type',
      $.identifier,
    ),

    identifier: $ => /[a-z_][a-z0-9_']*/,
  }
});
