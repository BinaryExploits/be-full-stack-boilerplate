#!/bin/bash

# Test script to simulate the GitHub Action lint workflow locally
# This helps verify the linting logic before pushing to GitHub

set -e

# Find repository root and cd to it
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"

echo "=== Testing Lint Workflow Locally ==="
echo "Repository root: $REPO_ROOT"
echo ""

# Get the base branch (default to main)
BASE_BRANCH=${1:-main}

echo "Comparing against branch: $BASE_BRANCH"
echo ""

# Get list of changed files (excluding deleted files)
CHANGED_FILES=$(git diff --name-only --diff-filter=d "$BASE_BRANCH"...HEAD)

if [ -z "$CHANGED_FILES" ]; then
  echo "No files changed compared to $BASE_BRANCH"
  exit 0
fi

echo "Changed files:"
echo "$CHANGED_FILES"
echo ""

# Filter to only lintable files (ts, tsx, js, jsx, mjs, cjs)
LINTABLE_FILES=$(echo "$CHANGED_FILES" | grep -E '\.(ts|tsx|js|jsx|mjs|cjs)$' || true)

# Remove empty lines, node_modules, and commonly ignored files
LINTABLE_FILES=$(echo "$LINTABLE_FILES" | grep -v 'node_modules' | grep -v '^$' | grep -v 'eslint.config' | grep -v '.eslintrc' || true)

if [ -z "$LINTABLE_FILES" ]; then
  echo "No lintable files changed"
  exit 0
fi

echo "Lintable files:"
echo "$LINTABLE_FILES"
echo ""

# Group files by workspace
API_FILES=$(echo "$LINTABLE_FILES" | grep '^apps/api/' || true)
WEB_FILES=$(echo "$LINTABLE_FILES" | grep '^apps/web/' || true)
MOBILE_FILES=$(echo "$LINTABLE_FILES" | grep '^apps/mobile/' || true)
UTILS_FILES=$(echo "$LINTABLE_FILES" | grep '^packages/utils/core/' || true)
UI_FILES=$(echo "$LINTABLE_FILES" | grep '^packages/ui/' || true)

LINT_EXIT_CODE=0

# Function to lint files in a workspace
lint_workspace() {
  local workspace_dir=$1
  local files=$2
  local label=$3

  if [ -n "$files" ]; then
    echo "=== Linting $label files ==="
    cd "$REPO_ROOT/$workspace_dir"

    RELATIVE_FILES=""
    for file in $files; do
      RELATIVE_FILE=$(echo "$file" | sed "s|^$workspace_dir/||")
      RELATIVE_FILES="$RELATIVE_FILES $RELATIVE_FILE"
    done

    echo "Files: $RELATIVE_FILES"
    echo ""

    if npx eslint "$RELATIVE_FILES" --max-warnings 0; then
      echo "✅ $label files passed linting"
    else
      echo "❌ $label files failed linting"
      LINT_EXIT_CODE=1
    fi

    cd "$REPO_ROOT" > /dev/null
    echo ""
  fi
}

# Lint each workspace
lint_workspace "apps/api" "api" "$API_FILES" "API"
lint_workspace "apps/web" "web" "$WEB_FILES" "Web"
lint_workspace "apps/mobile" "mobile" "$MOBILE_FILES" "Mobile"
lint_workspace "packages/utils/core" "utils-core" "$UTILS_FILES" "Utils"
lint_workspace "packages/ui" "ui" "$UI_FILES" "UI"

if [ $LINT_EXIT_CODE -eq 0 ]; then
  echo "=== ✅ All checks passed! ==="
else
  echo "=== ❌ Linting failed ==="
fi

exit $LINT_EXIT_CODE
