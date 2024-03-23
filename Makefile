
TS=yarn tree-sitter

# This is an opinionated list of significant ReScript repos on GitHub
# that are representative and trick-heavy enough to be a subject
# for acceptance testing. The general idea: if `tree-sitter-rescript`
# is 100% legit for this codebase, it should satisfy everyone.
wild_github_repos := rescript-lang/rescript-react \
										 rescript-association/rescript-lang.org \
										 tinymce/rescript-webapi \
										 cca-io/rescript-material-ui \
										 rescript-association/reanalyze \
										 TheSpyder/rescript-nodejs.git

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
