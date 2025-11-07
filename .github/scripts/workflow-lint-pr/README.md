# Testing GitHub Actions Locally

This guide explains how to test the linting GitHub Action before pushing to GitHub.

## Option 1: Quick Test Script (Recommended)

The simplest way to test the linting logic locally:

```bash
# From the repository root
.github/scripts/workflow-lint-pr/run-lint-pr.sh

# Or compare against a different branch
.github/scripts/workflow-lint-pr/run-lint-pr.sh develop
```

This script:
- Simulates the exact logic from the GitHub Action
- Detects changed files compared to the base branch
- Groups files by workspace
- Runs ESLint on each workspace with only the changed files
- Shows you exactly what would happen in CI

## Option 2: Using `act`

`act` runs GitHub Actions locally using Docker. It's more comprehensive but has some limitations with PR events.

### Basic Usage

```bash
# List all workflows
act -l

# Dry run - see what would happen without executing
act pull_request --dryrun

# Run the pull_request event (simulates opening a PR)
act pull_request -j lint

# Run with a specific event payload
act pull_request -j lint -e .github/workflows/test-event.json
```

### Limitations with `act`

- PR events are complex to simulate (requires setting up PR context)
- Comment-triggered events (`/linter`) are hard to test locally
- Some GitHub APIs may not work perfectly in local mode

### Creating a Test Event

Create `.github/workflows/test-event.json`:

```json
{
  "pull_request": {
    "number": 1,
    "head": {
      "ref": "your-branch-name"
    },
    "base": {
      "ref": "main"
    }
  }
}
```

Then run:
```bash
act pull_request -j lint -e .github/workflows/test-event.json
```

## Option 3: Manual Component Testing

Test individual parts of the workflow:

### Test Changed File Detection

```bash
# Get changed files vs main
git diff --name-only --diff-filter=d origin/main...HEAD

# Filter to lintable files
git diff --name-only --diff-filter=d origin/main...HEAD | grep -E '\.(ts|tsx|js|jsx|mjs|cjs)$'
```

### Test Linting in Each Workspace

```bash
# API
cd apps/api
npx eslint src/

# Web
cd apps/web
npx eslint src/

# Mobile
cd apps/mobile
npx eslint .

# Utils
cd packages/utils/core
npx eslint src/

# UI
cd packages/ui
npx eslint src/
```

## Recommended Testing Flow

1. **Make your changes** on a feature branch
2. **Run the test script**: `.github/scripts/workflow-lint-pr/run-lint-pr.sh`
3. **Fix any linting issues** that are reported
4. **Commit your changes**
5. **Push and create a PR** the workflow will run automatically

## Debugging Tips

- Check that your branch has commits compared to main: `git log main..HEAD`
- Verify ESLint configs are valid: `npx eslint --print-config apps/api/src/main.ts`
- Test with verbose output: Add `--debug` to eslint commands
- Check node_modules are installed: `pnpm install`

## Testing the /linter Comment Trigger

Unfortunately, this is hard to test locally because it requires GitHub's issue comment webhook. The best approach is:

1. Test the core linting logic with the script above
2. Create a draft PR to test the comment trigger in a real environment
3. Comment `/linter` on the draft PR to verify it works
