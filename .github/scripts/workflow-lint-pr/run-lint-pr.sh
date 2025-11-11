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
CHANGED_FILES=$(git diff --name-only --diff-filter=d $BASE_BRANCH...HEAD)

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

# Dynamically discover workspaces using pnpm
echo "=== Discovering workspaces ==="
WORKSPACES=$(pnpm list -r --depth -1 --parseable 2>/dev/null | grep -v "^$REPO_ROOT$" || true)

if [ -z "$WORKSPACES" ]; then
  echo "No workspaces found"
  exit 0
fi

echo "Found workspaces:"
echo "$WORKSPACES"
echo ""

LINT_EXIT_CODE=0
FAILED_WORKSPACES=""
ALL_LINT_OUTPUT=""

# Function to lint files in a workspace
lint_workspace() {
  local workspace_path=$1
  # shellcheck disable=SC2155 # Local assignment and command substitution combined for readability
  local workspace_name=$(basename "$workspace_path")

  # Get relative path from repo root
  # shellcheck disable=SC2155 # Local assignment and command substitution combined for readability
  local workspace_relative_path=$(realpath --relative-to="$REPO_ROOT" "$workspace_path" 2>/dev/null || python3 -c "import os.path; print(os.path.relpath('$workspace_path', '$REPO_ROOT'))")

  # Find files in this workspace
  # shellcheck disable=SC2155 # Local assignment and command substitution combined for readability
  local workspace_files=$(echo "$LINTABLE_FILES" | grep "^$workspace_relative_path/" || true)

  if [ -n "$workspace_files" ]; then
    echo "=== Linting $workspace_name ($workspace_relative_path) ==="
    cd "$workspace_path"

    RELATIVE_FILES=""
    for file in $workspace_files; do
      # shellcheck disable=SC2001 # sed is more portable than parameter expansion for path manipulation
      RELATIVE_FILE=$(echo "$file" | sed "s|^$workspace_relative_path/||")
      RELATIVE_FILES="$RELATIVE_FILES $RELATIVE_FILE"
    done

    echo "Files: $RELATIVE_FILES"
    echo ""

    # Capture output and exit code, but don't stop on failure
    set +e
    # shellcheck disable=SC2086 # Word splitting is intentional here to pass multiple files to eslint
    WORKSPACE_OUTPUT=$(npx eslint $RELATIVE_FILES --max-warnings 0 2>&1)
    WORKSPACE_EXIT_CODE=$?
    set -e

    if [ $WORKSPACE_EXIT_CODE -eq 0 ]; then
      echo "✅ $workspace_name files passed linting"
    else
      echo "❌ $workspace_name files failed linting"
      echo "$WORKSPACE_OUTPUT"
      LINT_EXIT_CODE=1
      FAILED_WORKSPACES="$FAILED_WORKSPACES\n  - $workspace_name ($workspace_relative_path)"
      ALL_LINT_OUTPUT="$ALL_LINT_OUTPUT\n\n### $workspace_name ($workspace_relative_path)\n$WORKSPACE_OUTPUT"
    fi

    cd "$REPO_ROOT"
    echo ""
  fi
}

# Lint each workspace dynamically - continue even if one fails
for workspace_path in $WORKSPACES; do
  lint_workspace "$workspace_path" || true
done

if [ $LINT_EXIT_CODE -eq 0 ]; then
  echo "=== ✅ All checks passed! ==="
else
  echo "=== ❌ Linting failed in the following workspaces: ==="
  echo -e "$FAILED_WORKSPACES"
  echo ""
  echo "Review the output above for details on each workspace's issues."
fi

exit $LINT_EXIT_CODE
