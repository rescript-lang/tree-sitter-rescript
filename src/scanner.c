#include "tree_sitter/parser.h"
#include <string.h>
#include <wctype.h>

enum TokenType {
  AUTOMATIC_SEMICOLON,
  CONTINUATION,
  BLOCK_COMMENT,
  QUOTE,
  BACKTICK,
  TEMPLATE_CHARS,
  L_PAREN,
  R_PAREN,
  LIST_CONSTRUCTOR,
  DICT_CONSTRUCTOR,
  DECORATOR,
  DECORATOR_INLINE,
};

typedef struct ScannerState {
  int parens_nesting;
  bool in_quotes;
  bool in_backticks;
  bool eof_reported;
  bool saw_line_terminator;
} ScannerState;

void *tree_sitter_rescript_external_scanner_create() {
  void* state = malloc(sizeof(ScannerState));
  memset(state, 0, sizeof(ScannerState));
  return state;
}

void tree_sitter_rescript_external_scanner_destroy(void* state) {
  free(state);
}

void tree_sitter_rescript_external_scanner_reset(void* state) {
  memset(state, 0, sizeof(ScannerState));
}

unsigned tree_sitter_rescript_external_scanner_serialize(void* state, char *buffer) {
  memcpy(buffer, state, sizeof(ScannerState));
  return sizeof(ScannerState);
}

void tree_sitter_rescript_external_scanner_deserialize(void* state, const char *buffer, unsigned n_bytes) {
  memcpy(state, buffer, n_bytes);
}

static void advance(TSLexer *lexer) { lexer->advance(lexer, false); }
static void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

static bool is_inline_whitespace(int32_t c) {
  return c == ' ' || c == '\t';
}

static bool is_identifier_start(char c) {
  return c == '_' || (c >= 'a' && c <= 'z');
}

static bool is_identifier_continue(int32_t c) {
  return c == '_' || c == '\'' ||
    (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
    (c >= '0' && c <= '9');
}

static bool is_decorator_start(char c) {
  return c == '_' || c == '\\' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

static bool is_decorator_identifier(char c) {
  return c == '_' || c == '.' || c == '\'' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
}

static bool is_whitespace(char c) {
  return c == ' ' || c == '\t' || c == '\n' || c == '\r';
}

static bool is_line_terminator(int32_t c) {
  return c == '\n' || c == '\r' || c == 0x2028 || c == 0x2029;
}

static void scan_whitespace(TSLexer *lexer, bool skip) {
  while (iswspace(lexer->lookahead) && !lexer->eof(lexer)) {
    lexer->advance(lexer, skip);
  }
}

static bool scan_keyword(TSLexer *lexer, const char *keyword) {
  for (unsigned i = 0; keyword[i] != '\0'; i++) {
    if (lexer->lookahead != keyword[i]) return false;
    skip(lexer);
  }
  return !is_identifier_continue(lexer->lookahead);
}

static bool token_continues_statement(TSLexer *lexer) {
  switch (lexer->lookahead) {
    case '.':
    case '|':
    case '?':
    case ':':
    case ';':
      return true;
    case '-':
      skip(lexer);
      return lexer->lookahead == '>';
    case 'a':
      return scan_keyword(lexer, "and");
    case 'e':
      return scan_keyword(lexer, "else");
    case 'w':
      return scan_keyword(lexer, "with");
    default:
      return false;
  }
}

static bool scan_block_comment_after_slash(
    TSLexer *lexer,
    bool *comment_has_newline
    ) {
  if (lexer->lookahead != '*') return false;

  int level = 1;
  advance(lexer);
  while (level > 0 && !lexer->eof(lexer)) {
    if (lexer->lookahead == '/') {
      advance(lexer);
      if (lexer->lookahead == '*') {
        level++;
        advance(lexer);
      }
    } else if (lexer->lookahead == '*') {
      advance(lexer);
      if (lexer->lookahead == '/') {
        level--;
        advance(lexer);
      }
    } else {
      if (comment_has_newline && is_line_terminator(lexer->lookahead)) {
        *comment_has_newline = true;
      }
      advance(lexer);
    }
  }
  return true;
}

bool tree_sitter_rescript_external_scanner_scan(
    void* payload,
    TSLexer* lexer,
    const bool* valid_symbols
    ) {
  ScannerState* state = (ScannerState*)payload;
  bool in_string = state->in_quotes || state->in_backticks;

  while (is_inline_whitespace(lexer->lookahead) && !in_string) {
    skip(lexer);
  }

  if (valid_symbols[TEMPLATE_CHARS]) {
    lexer->result_symbol = TEMPLATE_CHARS;
    for (bool has_content = false;; has_content = true) {
      lexer->mark_end(lexer);
      switch (lexer->lookahead) {
        case '`':
          state->in_backticks = false;
          return has_content;
        case '\0':
          return false;
        case '$':
          advance(lexer);
          if (lexer->lookahead == '{' || is_identifier_start(lexer->lookahead)) {
            return has_content;
          }
          break;
        case '\\':
          return has_content;
        default:
          advance(lexer);
      }
    }

    return true;
  }

  if (valid_symbols[AUTOMATIC_SEMICOLON]) {
    lexer->result_symbol = AUTOMATIC_SEMICOLON;
    lexer->mark_end(lexer);

    bool had_saved_line_terminator = state->saw_line_terminator;
    bool saw_line_terminator = had_saved_line_terminator;
    state->saw_line_terminator = false;
    while (iswspace(lexer->lookahead) && !lexer->eof(lexer)) {
      if (is_line_terminator(lexer->lookahead)) saw_line_terminator = true;
      skip(lexer);
    }

    if (lexer->eof(lexer)) {
      if (state->eof_reported) return false;
      state->eof_reported = true;
      return true;
    }
    if (lexer->lookahead == '}') {
      // A same-line `}` may close a record pattern, as in `({id}) => ...`.
      // Emitting here would commit the parser to the competing block parse.
      return saw_line_terminator;
    }
    if (lexer->is_at_included_range_start(lexer)) {
      return true;
    }

    if (lexer->lookahead == '/') {
      advance(lexer);
      if (lexer->lookahead == '*' && valid_symbols[BLOCK_COMMENT]) {
        bool comment_has_newline = false;
        scan_block_comment_after_slash(lexer, &comment_has_newline);
        lexer->result_symbol = BLOCK_COMMENT;
        lexer->mark_end(lexer);
        state->saw_line_terminator =
          saw_line_terminator || comment_has_newline;
        return true;
      }
      if (lexer->lookahead == '/') {
        state->saw_line_terminator = saw_line_terminator;
        return false;
      }
      if (saw_line_terminator) return true;
      return false;
    } else if (lexer->lookahead == '@') {
      // Preserve the newline until the decorator has been emitted. This lets
      // an attribute appear between a type binding and its following `and`.
      state->saw_line_terminator = saw_line_terminator;
    } else {
      if (!saw_line_terminator) return false;
      if (token_continues_statement(lexer)) {
        if (had_saved_line_terminator && valid_symbols[CONTINUATION]) {
          lexer->result_symbol = CONTINUATION;
          return true;
        }
        return false;
      }
      return true;
    }
  }

  if (!in_string) {
    scan_whitespace(lexer, true);
  }

  // Block comments encountered at an arbitrary position (e.g. mid-expression).
  // These are emitted as BLOCK_COMMENT tokens and captured via grammar extras.
  if (valid_symbols[BLOCK_COMMENT] && lexer->lookahead == '/' && !in_string) {
    advance(lexer);
    if (scan_block_comment_after_slash(lexer, NULL)) {
      lexer->result_symbol = BLOCK_COMMENT;
      lexer->mark_end(lexer);
      return true;
    }
    // Not a block comment — fall through to other checks.
    return false;
  }

  if (valid_symbols[QUOTE] && lexer->lookahead == '"') {
    state->in_quotes = !state->in_quotes;
    lexer->result_symbol = QUOTE;
    lexer->advance(lexer, false);
    lexer->mark_end(lexer);
    return true;
  }

  if (valid_symbols[BACKTICK] && lexer->lookahead == '`') {
    state->in_backticks = !state->in_backticks;
    lexer->result_symbol = BACKTICK;
    lexer->advance(lexer, false);
    lexer->mark_end(lexer);
    return true;
  }

  if (valid_symbols[L_PAREN] && lexer->lookahead == '(') {
    ++state->parens_nesting;
    lexer->result_symbol = L_PAREN;
    lexer->advance(lexer, false);
    lexer->mark_end(lexer);
    return true;
  }

  if (valid_symbols[R_PAREN] && lexer->lookahead == ')') {
    --state->parens_nesting;
    lexer->result_symbol = R_PAREN;
    lexer->advance(lexer, false);
    lexer->mark_end(lexer);
    return true;
  }

  if (valid_symbols[LIST_CONSTRUCTOR]) {
    lexer->result_symbol = LIST_CONSTRUCTOR;
    if (lexer->lookahead == 'l') {
      advance(lexer);
      if (lexer->lookahead == 'i') {
        advance(lexer);
        if (lexer->lookahead == 's') {
          advance(lexer);
          if (lexer->lookahead == 't') {
            advance(lexer);
            if (lexer->lookahead == '{') {
              lexer->mark_end(lexer);
              return true;
            }
          }
        }
      }
    }
  }

  if (valid_symbols[DICT_CONSTRUCTOR]) {
    lexer->result_symbol = DICT_CONSTRUCTOR;
    if (lexer->lookahead == 'd') {
      advance(lexer);
      if (lexer->lookahead == 'i') {
        advance(lexer);
        if (lexer->lookahead == 'c') {
          advance(lexer);
          if (lexer->lookahead == 't') {
            advance(lexer);
            if (lexer->lookahead == '{') {
              lexer->mark_end(lexer);
              return true;
            }
          }
        }
      }
    }
  }

  if (valid_symbols[DECORATOR] && valid_symbols[DECORATOR_INLINE] && lexer->lookahead == '@') {
    advance(lexer);
    if (lexer->lookahead == '@') {
      advance(lexer);
    }

    if (is_decorator_start(lexer->lookahead)) {
      advance(lexer);

      if (lexer->lookahead == '"') {
        advance(lexer);
        while (lexer->lookahead != '"') {
          advance(lexer);
          if (lexer->eof(lexer)) {
            return false;
          }
        }
        advance(lexer);
        if (is_whitespace(lexer->lookahead)) {
          lexer->result_symbol = DECORATOR_INLINE;
          lexer->mark_end(lexer);
          return true;
        }
        if (lexer -> lookahead == '(') {
          lexer->result_symbol = DECORATOR;
          lexer->mark_end(lexer);
          return true;
        }
        return false;
      }

      while (is_decorator_identifier(lexer->lookahead)) {
        advance(lexer);
        if (lexer->eof(lexer)) {
          return false;
        }
      }

      if (is_whitespace(lexer->lookahead)) {
        lexer->result_symbol = DECORATOR_INLINE;
        lexer->mark_end(lexer);
        return true;
      }

      if (lexer->lookahead == '(') {
          lexer->result_symbol = DECORATOR;
          lexer->mark_end(lexer);
          return true;
      }
    }
    return false;
  }

  lexer->advance(lexer, iswspace(lexer->lookahead));
  return false;
}

// vim:sw=2
