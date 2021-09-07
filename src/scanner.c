#include <tree_sitter/parser.h>
#include <string.h>
#include <wctype.h>

enum TokenType {
  NEWLINE,
  QUOTE,
  BACKTICK,
  TEMPLATE_CHARS,
  COMMENT,
  L_PAREN,
  R_PAREN,
};

typedef struct ScannerState {
  int parens_nesting;
  bool in_quotes;
  bool in_backticks;
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

static bool scan_whitespace(TSLexer *lexer) {
  while (iswspace(lexer->lookahead) && !lexer->eof(lexer)) {
    lexer->advance(lexer, true);
  }
}

static bool scan_whitespace_and_comments(TSLexer *lexer) {
  for (;;) {
    while (iswspace(lexer->lookahead)) {
      advance(lexer);
    }

    if (lexer->lookahead == '/') {
      advance(lexer);

      if (lexer->lookahead == '/') {
        advance(lexer);
        while (lexer->lookahead != 0 && lexer->lookahead != '\n') {
          advance(lexer);
        }
      } else if (lexer->lookahead == '*') {
        advance(lexer);
        while (lexer->lookahead != 0) {
          if (lexer->lookahead == '*') {
            advance(lexer);
            if (lexer->lookahead == '/') {
              advance(lexer);
              break;
            }
          } else {
            advance(lexer);
          }
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}

static void scan_multiline_comment(TSLexer *lexer) {
  int level = 1;
  advance(lexer);
  while (level > 0 && !lexer->eof(lexer)) {
    switch (lexer->lookahead) {
      case '/':
        advance(lexer);
        if (lexer->lookahead == '*') {
          ++level;
        }

      case '*':
        advance(lexer);
        if (lexer->lookahead == '/') {
          --level;
        }
    }

    advance(lexer);
  }
}

static bool is_identifier_start(char c) {
  return c == '_' || (c >= 'a' && c <= 'z');
}

bool tree_sitter_rescript_external_scanner_scan(
    void* payload,
    TSLexer* lexer,
    const bool* valid_symbols
    ) {
  ScannerState* state = (ScannerState*)payload;
  const in_string = state->in_quotes || state->in_backticks;

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

  if (valid_symbols[NEWLINE] && lexer->lookahead == '\n') {
    lexer->result_symbol = NEWLINE;
    bool is_unnested = state->parens_nesting == 0;
    lexer->advance(lexer, !is_unnested);
    lexer->mark_end(lexer);

    scan_whitespace_and_comments(lexer);
    if (lexer->lookahead == '-') {
      advance(lexer);
      if (lexer->lookahead == '>') {
        // Ignore new lines before pipe operator (->)
        return false;
      }
    } else if (lexer->lookahead == '|') {
      // Ignore new lines before variant declarations and switch matches
      return false;
    } else if (lexer->lookahead == '?' || lexer->lookahead == ':') {
      // Ignore new lines before potential ternaries
      return false;
    } else if (lexer->lookahead == '}') {
      // Do not report new lines right before block/switch closings to avoid
      // parser confustion between a terminated and unterminated statements
      // for rules like seq(repeat($._statement), $.statement)
      return false;
    }

    return is_unnested;
  }

  if (!in_string) {
    scan_whitespace(lexer);
  }

  if (valid_symbols[COMMENT] && lexer->lookahead == '/' && !in_string) {
    lexer->result_symbol = COMMENT;
    advance(lexer);
    switch (lexer->lookahead) {
      case '/':
        // Single-line comment
        do {
          advance(lexer);
          lexer->mark_end(lexer);
        } while (lexer->lookahead != '\n');
        return true;

      case '*':
        // Multi-line comment
        scan_multiline_comment(lexer);
        lexer->mark_end(lexer);
        return true;

      default:
        // Division, etc
        return false;
    }
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

  lexer->advance(lexer, iswspace(lexer->lookahead));
  return false;
}

// vim:sw=2
