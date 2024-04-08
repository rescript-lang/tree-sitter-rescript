package tree_sitter_rescript_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-rescript"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_rescript.Language())
	if language == nil {
		t.Errorf("Error loading Rescript grammar")
	}
}
