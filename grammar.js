module.exports = grammar({
  name: 'rescript',

  rules: {
    source_file: $ => repeat($._top_level_statement),

    _top_level_statement: $ => choice(
      $._type_declaration,
    ),

    _type_declaration: $ => choice(
      $.opaque_type,
      $.alias_type,
      $.record_type,
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

    _type_reference: $ => seq(repeat(seq($.module_name, '.')), $.type_name),

    type_name: $ => /[a-z_][a-zA-Z0-9_']*/,

    module_name: $ => /[A-Z][a-zA-Z0-9_]*/,

    identifier: $ => /[a-z_][a-z0-9_']*/,
  }
});
