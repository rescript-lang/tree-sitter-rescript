#include <tree_sitter/parser.h>
#include <string.h>
#include <wctype.h>

enum TokenType {
  NEWLINE,
  TEMPLATE_CHARS,
  L_PAREN,
  R_PAREN,
};

typedef struct ScannerState {
  int parens_nesting;
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

static bool is_identifier_start(char c) {
  return c == '_' || (c >= 'a' && c <= 'z');
}

bool tree_sitter_rescript_external_scanner_scan(
    void* payload,
    TSLexer* lexer,
    const bool* valid_symbols
    ) {
  ScannerState* state = (ScannerState*)payload;

  if (valid_symbols[TEMPLATE_CHARS]) {
    lexer->result_symbol = TEMPLATE_CHARS;
    for (bool has_content = false;; has_content = true) {
      lexer->mark_end(lexer);
      switch (lexer->lookahead) {
        case '`':
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
    } else if (lexer->lookahead == '?' || lexer->lookahead == ':') {
      // Ignore new lines before potential ternaries
      return false;
    }

    return is_unnested;
  }

  if (!scan_whitespace_and_comments(lexer)) {
    return false;
  }

  if (valid_symbols[L_PAREN] && lexer->lookahead == '(') {
    ++state->parens_nesting;
    lexer->result_symbol = L_PAREN;
    lexer->advance(lexer, false);
    lexer->mark_end(lexer);
    return true;
  } else if (valid_symbols[R_PAREN] && lexer->lookahead == ')') {
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
