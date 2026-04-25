package tree_sitter_rescript_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_rescript "github.com/tree-sitter/tree-sitter-rescript/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_rescript.Language())
	if language == nil {
		t.Errorf("Error loading ReScript grammar")
	}
}
