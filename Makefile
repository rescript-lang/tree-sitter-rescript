
TS=yarn tree-sitter

wild_github_repos := rescript-lang/rescript-react \
										 tinymce/rescript-webapi

wild_sandboxes := $(patsubst %,test_wild/%,$(wild_github_repos))

.PHONY: generate
generate:
	$(TS) generate

.PHONY: test
test: generate
	$(TS) test

test_wild/%:
	@mkdir -p test_wild/
	git clone --depth=1 https://github.com/$* ./$@

.PHONY: test_wild
test_wild: $(wild_sandboxes)
	$(TS) parse --quiet --stat '$@/**/*.res*'
