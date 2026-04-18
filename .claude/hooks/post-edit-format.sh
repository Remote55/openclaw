#!/usr/bin/env bash
# Auto-format files after Claude edits them.
# Runs Prettier + ESLint --fix on TypeScript/TSX files.
# Exit code 0 = success, non-zero = block next tool use.

set -eo pipefail

# Read hook input from stdin (JSON)
INPUT=$(cat)

# Extract file_path from tool_input (supports both Edit and Write tools)
FILE_PATH=$(echo "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')

# Skip if no file path extracted
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Skip if file doesn't exist (e.g., was deleted)
if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Only format TS/TSX/JS/JSX/JSON/MD/CSS
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.css|*.mjs)
    # Run prettier silently; don't fail the hook if prettier has issues
    pnpm exec prettier --write "$FILE_PATH" 2>/dev/null || true

    # Run ESLint only on TS/TSX/JS/JSX, silently
    case "$FILE_PATH" in
      *.ts|*.tsx|*.js|*.jsx)
        pnpm exec eslint --fix "$FILE_PATH" 2>/dev/null || true
        ;;
    esac
    ;;
esac

exit 0