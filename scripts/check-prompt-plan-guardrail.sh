#!/usr/bin/env bash
set -euo pipefail

REQUIRED_LINE='Do not modify `docs/planning/final-implementation-plan.md`.'

if [ "$#" -eq 0 ]; then
  PROMPT_FILES="$(git diff --cached --name-only -- 'docs/prompt/*.md')"
elif [ "$#" -eq 2 ]; then
  PROMPT_FILES="$(git diff --name-only "$1" "$2" -- 'docs/prompt/*.md')"
else
  echo "Usage: $0 [<base_sha> <head_sha>]" >&2
  exit 2
fi

if [ -z "$PROMPT_FILES" ]; then
  exit 0
fi

MISSING=""

while IFS= read -r FILE; do
  if [ ! -f "$FILE" ]; then
    continue
  fi
  if ! grep -Fq "$REQUIRED_LINE" "$FILE"; then
    MISSING="${MISSING}${FILE}\n"
  fi
done <<EOF
$PROMPT_FILES
EOF

if [ -n "$MISSING" ]; then
  echo "ERROR: Prompt files must include the immutable-plan rule:" >&2
  echo "  $REQUIRED_LINE" >&2
  echo "Missing in:" >&2
  printf '%b' "$MISSING" | sed 's/^/  - /' >&2
  exit 1
fi
