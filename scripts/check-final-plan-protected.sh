#!/usr/bin/env bash
set -euo pipefail

TARGET_FILE="docs/planning/final-implementation-plan.md"

if [ "$#" -eq 0 ]; then
  # Local hook mode: inspect staged changes only.
  CHANGED_FILES="$(git diff --cached --name-only)"
elif [ "$#" -eq 2 ]; then
  # CI mode: inspect a provided commit range.
  CHANGED_FILES="$(git diff --name-only "$1" "$2")"
else
  echo "Usage: $0 [<base_sha> <head_sha>]" >&2
  exit 2
fi

if printf '%s\n' "$CHANGED_FILES" | grep -Fxq "$TARGET_FILE"; then
  echo "ERROR: $TARGET_FILE is protected and must not be modified." >&2
  echo "Use a new planning document if you need to propose changes." >&2
  exit 1
fi
