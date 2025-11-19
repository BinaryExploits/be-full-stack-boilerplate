@echo off
setlocal enabledelayedexpansion

REM ========================================
REM Test script to simulate the GitHub Action lint workflow locally
REM This helps verify the linting logic before pushing to GitHub
REM ========================================

REM Enable ANSI color support
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
  set "ESC=%%b"
)

REM ----------------------------------------
REM Color codes (ANSI escape sequences)
REM ----------------------------------------
set "RED=%ESC%[0;31m"
set "GREEN=%ESC%[0;32m"
set "YELLOW=%ESC%[1;33m"
set "BLUE=%ESC%[0;34m"
set "NC=%ESC%[0m"

REM ----------------------------------------
REM Navigate to repository root
REM ----------------------------------------
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%..\..\..\"
set "REPO_ROOT=%CD%"

echo %BLUE%=== Testing Lint Workflow Locally ===%NC%
echo Repository root: %REPO_ROOT%
echo.

REM ----------------------------------------
REM Get the base branch (default to main)
REM ----------------------------------------
set "BASE_BRANCH=%~1"
if not defined BASE_BRANCH set "BASE_BRANCH=main"

echo Comparing against branch: %BASE_BRANCH%
echo.

REM ----------------------------------------
REM Get list of changed files (excluding deleted files)
REM ----------------------------------------
for /f "delims=" %%i in ('git diff --name-only --diff-filter=d %BASE_BRANCH%...HEAD 2^>nul') do (
    set "CHANGED_FILES=!CHANGED_FILES!%%i "
)

if not defined CHANGED_FILES (
    echo No files changed compared to %BASE_BRANCH%
    exit /b 0
)

echo Changed files:
for %%f in (%CHANGED_FILES%) do echo %%f
echo.

REM ----------------------------------------
REM Filter to only lintable files
REM ----------------------------------------
set "LINTABLE_FILES="
for %%f in (%CHANGED_FILES%) do (
    set "file=%%f"
    REM Convert forward slashes to backslashes for Windows
    set "file=!file:/=\!"
    
    REM Check if file has lintable extension
    echo !file! | findstr /R "\.ts$ \.tsx$ \.js$ \.jsx$ \.mjs$ \.cjs$" >nul 2>&1
    if not errorlevel 1 (
        REM Skip node_modules only
        echo !file! | findstr /I "node_modules" >nul 2>&1
        if errorlevel 1 (
            set "LINTABLE_FILES=!LINTABLE_FILES!%%f "
        )
    )
)

if not defined LINTABLE_FILES (
    echo No lintable files changed
    exit /b 0
)

echo Lintable files:
for %%f in (%LINTABLE_FILES%) do echo %%f
echo.

REM ----------------------------------------
REM Discover workspaces using pnpm
REM ----------------------------------------
echo %BLUE%=== Discovering workspaces ===%NC%
set "WORKSPACES="
set "workspace_count=0"

for /f "delims=" %%w in ('pnpm list -r --depth -1 --parseable 2^>nul') do (
    set "workspace=%%w"
    if not "!workspace!"=="%REPO_ROOT%" (
        set "WORKSPACES=!WORKSPACES!%%w|"
        set /a workspace_count+=1
    )
)

if %workspace_count%==0 (
    echo No workspaces found
    exit /b 0
)

echo Found workspaces:
for %%w in (%WORKSPACES:^|= %) do echo %%w
echo.

set "LINT_EXIT_CODE=0"
set "FAILED_WORKSPACES="
set "has_failures=false"

REM ----------------------------------------
REM Function to lint workspace
REM ----------------------------------------
:lint_workspace
setlocal
set "workspace_path=%~1"

REM Get workspace name (last directory in path)
for %%i in ("%workspace_path%") do set "workspace_name=%%~ni"

REM Get relative path from repo root
set "workspace_relative_path=!workspace_path:%REPO_ROOT%\=!"

REM Find files in this workspace
set "workspace_files="
for %%f in (%LINTABLE_FILES%) do (
    set "file=%%f"
    set "file=!file:/=\!"
    echo !file! | findstr /B /I "%workspace_relative_path%\" >nul 2>&1
    if not errorlevel 1 (
        set "workspace_files=!workspace_files!%%f "
    )
)

if defined workspace_files (
    echo %BLUE%=== Linting !workspace_name! ^(!workspace_relative_path!^) ===%NC%
    cd /d "!workspace_path!"

    REM Convert files to relative paths within workspace
    set "RELATIVE_FILES="
    for %%f in (!workspace_files!) do (
        set "file=%%f"
        set "file=!file:/=\!"
        set "rel_file=!file:%workspace_relative_path%\=!"
        set "RELATIVE_FILES=!RELATIVE_FILES!!rel_file! "
    )

    echo Files: !RELATIVE_FILES!
    echo.

    REM Run ESLint and capture output
    npx eslint !RELATIVE_FILES! --max-warnings 0 --no-warn-ignored >temp_lint_output.txt 2>&1
    set "WORKSPACE_EXIT_CODE=!errorlevel!"

    if !WORKSPACE_EXIT_CODE! equ 0 (
        echo %GREEN%✓ !workspace_name! files passed linting%NC%
    ) else (
        echo %RED%✗ !workspace_name! files failed linting%NC%
        type temp_lint_output.txt
        set "LINT_EXIT_CODE=1"
        set "has_failures=true"
        if not defined FAILED_WORKSPACES (
            set "FAILED_WORKSPACES=  - !workspace_name! ^(!workspace_relative_path!^)"
        ) else (
            set "FAILED_WORKSPACES=!FAILED_WORKSPACES!^

  - !workspace_name! ^(!workspace_relative_path!^)"
        )
    )

    if exist temp_lint_output.txt del temp_lint_output.txt
    cd /d "%REPO_ROOT%"
    echo.
)
endlocal & set "LINT_EXIT_CODE=%LINT_EXIT_CODE%" & set "FAILED_WORKSPACES=%FAILED_WORKSPACES%" & set "has_failures=%has_failures%"
goto :eof

REM ----------------------------------------
REM Lint each workspace
REM ----------------------------------------
for %%w in (%WORKSPACES:^|= %) do (
    call :lint_workspace "%%w"
)

REM ----------------------------------------
REM Final summary
REM ----------------------------------------
echo.
if "%LINT_EXIT_CODE%"=="0" (
    echo %GREEN%=== ✓ All checks passed! ===%NC%
) else (
    echo %RED%=== ✗ Linting failed in the following workspaces: ===%NC%
    echo !FAILED_WORKSPACES!
    echo.
    echo Review the output above for details on each workspace's issues.
)

exit /b %LINT_EXIT_CODE%