---
description: Verify current branch is ready for PR (typecheck, lint, build, translations)
---

Run the following verification steps in order, reporting the result of each:

1. **Git status**: Run `git status` and confirm there are no uncommitted changes.
   If there are uncommitted changes, stop and list them for the user to decide.

2. **Branch name**: Run `git branch --show-current`. Confirm the branch name follows
   the convention `<type>/<description>` where type is one of: feat, fix, chore,
   docs, test, ci. If not, suggest a better name.

3. **Typecheck**: Run `pnpm typecheck`. Must pass with zero errors.

4. **Lint**: Run `pnpm lint`. Must pass with zero warnings.

5. **Build**: Run `pnpm build`. Must succeed.

6. **Translations parity**: Check that `messages/th.json` and `messages/en.json`
   have the same keys at every nesting level. Report any missing keys.

7. **Secret scan**: Search for patterns that look like leaked secrets:
   - `grep -r "sk-" src/ --include="*.ts" --include="*.tsx"` (OpenAI-style keys)
   - `grep -r "AKIA" src/ --include="*.ts" --include="*.tsx"` (AWS keys)
   - `grep -rE "(password|apiKey|secret)[[:space:]]*=[[:space:]]*['\"]" src/`

If ALL checks pass, respond with a summary ready to paste into a PR description:
- What changed
- Why
- How to test
- Screenshots/recordings if UI changed (ask user to attach)

If ANY check fails, list the failures and offer to fix them.