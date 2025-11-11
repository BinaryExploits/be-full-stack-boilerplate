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
- **Dynamically discovers all workspaces** from your pnpm-workspace.yaml configuration
- Detects changed files compared to the base branch
- Groups files by workspace automatically
- **Checks ALL workspaces and reports ALL errors** (doesn't stop at the first failure)
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

### Test Linting in Workspaces

```bash
# Discover all workspaces
pnpm list -r --depth -1 --parseable

# Test a specific workspace (example: api)
cd apps/api
npx eslint src/

# Test another workspace (example: ui)
cd packages/ui
npx eslint src/
```

**Note:** The workflow dynamically discovers all workspaces from `pnpm-workspace.yaml`, so you don't need to manually maintain a list. Any new workspace you add will automatically be included in linting.

## Recommended Testing Flow

1. **Make your changes** on a feature branch
2. **Run the test script**: `.github/scripts/workflow-lint-pr/run-lint-pr.sh`
3. **Fix any linting issues** that are reported
4. **Commit your changes**
5. **Push and create a PR** the workflow will run automatically

## Key Features

### Dynamic Workspace Discovery
The linting workflow automatically discovers all workspaces defined in your `pnpm-workspace.yaml`. This means:
- **No hardcoded workspace paths** - add new workspaces without updating the workflow
- **Automatic detection** - works with any monorepo structure
- **Future-proof** - scales as your project grows

### Comprehensive Error Reporting
The workflow checks **all** workspaces with changed files and reports **all** errors:
- **Doesn't stop at first failure** - continues checking remaining workspaces
- **Complete error summary** - see all issues across all workspaces in one run
- **Organized output** - errors grouped by workspace for easy identification

## Debugging Tips

- Check that your branch has commits compared to main: `git log main..HEAD`
- List all workspaces: `pnpm list -r --depth -1`
- Verify ESLint configs are valid: `npx eslint --print-config apps/api/src/main.ts`
- Test with verbose output: Add `--debug` to eslint commands
- Check node_modules are installed: `pnpm install`

## Testing the /linter Comment Trigger

Unfortunately, this is hard to test locally because it requires GitHub's issue comment webhook. The best approach is:

1. Test the core linting logic with the script above
2. Create a draft PR to test the comment trigger in a real environment
3. Comment `/linter` on the draft PR to verify it works
