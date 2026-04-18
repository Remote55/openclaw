---
description: Verify Thai and English translation files are in sync
---

Perform a thorough i18n audit:

1. Read `messages/th.json` and `messages/en.json`.

2. Compare the key structure at every nesting level. Report:
   - Keys present in `th.json` but missing in `en.json`
   - Keys present in `en.json` but missing in `th.json`
   - Keys where one locale has a nested object and the other has a string (type mismatch)

3. Scan the codebase for translation key usage:
   - `grep -rn "useTranslations\|getTranslations" src/`
   - `grep -rnE "t\(['\"]([^'\"]+)['\"]" src/`

4. Report any translation keys used in code that don't exist in the JSON files.

5. Report any keys in JSON files that are never used in code (dead translations).

6. For any user-facing strings hardcoded in components (not going through `t()`),
   list them as violations of the i18n convention.

Output format: markdown table with columns [Issue type | Key/String | File | Line].