#include <tree_sitter/parser.h>
#include <string.h>
#include <wctype.h>

enum TokenType {
  NEWLINE,
  L_PAREN,
  R_PAREN,
};

typedef struct ScannerState {
  int parensNesting;
  int angularBracketNesting;
  int squareBracketNesting;
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

void tree_sitter_rescript_external_scanner_deserialize(void* state, const char *buffer, unsigned nBytes) {
  memcpy(state, buffer, nBytes);
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

bool tree_sitter_rescript_external_scanner_scan(
    void *pState,
    TSLexer *lexer,
    const bool *valid_symbols
    ) {
  ScannerState* state = (ScannerState*)pState;

  /*printf("---\n");
  printf("%d %d %d\n", valid_symbols[0], valid_symbols[1], valid_symbols[2]);
  printf("0x%X '%c'\n", lexer->lookahead, lexer->lookahead);
  printf("nesting (%d)\n", state->parensNesting);*/

  if (valid_symbols[NEWLINE] && lexer->lookahead == '\n') {
    lexer->result_symbol = NEWLINE;
    bool isTerminalNewline =
      state->parensNesting == 0 && state->squareBracketNesting == 0;
    lexer->advance(lexer, !isTerminalNewline);
    lexer->mark_end(lexer);
    return isTerminalNewline;
  }

  if (!scan_whitespace_and_comments(lexer)) {
    return false;
  }

  if (valid_symbols[L_PAREN] && lexer->lookahead == '(') {
    /*printf("lparen(\n", state->parensNesting);*/
    ++state->parensNesting;
    lexer->result_symbol = L_PAREN;
    lexer->advance(lexer, false);
    lexer->mark_end(lexer);
    return true;
  } else if (valid_symbols[R_PAREN] && lexer->lookahead == ')') {
    /*printf(")rparen\n", state->parensNesting);*/
    --state->parensNesting;
    lexer->result_symbol = R_PAREN;
    lexer->advance(lexer, false);
    lexer->mark_end(lexer);
    return true;
  }

  lexer->advance(lexer, iswspace(lexer->lookahead));
  return false;
}

// vim:sw=2
