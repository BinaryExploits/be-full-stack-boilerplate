@echo off
setlocal enabledelayedexpansion

REM ========================================
REM SonarQube Code Analysis Scanner
REM Automates code analysis for your monorepo
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

echo ==========================================
echo SonarQube Code Analysis Scanner
echo ==========================================
echo.

REM Get script directory
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM ----------------------------------------
REM Step 1: Check if .env file exists
REM ----------------------------------------
echo %YELLOW%[Step 1/6]%NC% Checking configuration...
if not exist .env (
    echo %RED%x .env file not found%NC%
    echo.
    echo Please create a .env file with your SonarQube configuration.
    echo You can copy from .env.example:
    echo.
    echo %YELLOW%  copy .env.example .env%NC%
    echo.
    echo Then edit .env and add your SonarQube token and project details.
    pause
    exit /b 1
)

REM Load environment variables
for /f "usebackq tokens=* delims=" %%a in (".env") do (
    set "line=%%a"
    if defined line (
        REM Get first character to check for comments
        set "firstchar=!line:~0,1!"
        if not "!firstchar!"=="#" (
            REM Check if line contains =
            echo !line! | findstr /C:"=" >nul 2>&1
            if not errorlevel 1 (
                REM Split by first = only
                for /f "tokens=1* delims==" %%b in ("!line!") do (
                    set "key=%%b"
                    set "value=%%c"
                    REM Trim spaces from key
                    for /f "tokens=* delims= " %%d in ("!key!") do set "key=%%d"
                    REM Set the environment variable if key is not empty
                    if defined key (
                        set "!key!=!value!"
                    )
                )
            )
        )
    )
)

REM Set defaults for missing variables
if not defined SONAR_HOST_URL set "SONAR_HOST_URL=http://localhost:9000"
if not defined SONAR_CONTAINER_NAME set "SONAR_CONTAINER_NAME=sonarqube"
if not defined SONAR_PROJECT_NAME set "SONAR_PROJECT_NAME=my-project"
if not defined SONAR_PROJECT_KEY set "SONAR_PROJECT_KEY=my-monorepo"
if not defined SONAR_PROJECT_VERSION set "SONAR_PROJECT_VERSION=1.0.0"
if not defined SONAR_SOURCES set "SONAR_SOURCES=."
if not defined SONARQUBE_NETWORK_NAME set "SONARQUBE_NETWORK_NAME=sonarqube_sonarqube-net"

echo %GREEN%v Configuration loaded%NC%
echo.

REM ----------------------------------------
REM Step 2: Validate token
REM ----------------------------------------
echo %YELLOW%[Step 2/6]%NC% Validating authentication token...
if not defined SONAR_TOKEN (
    echo %RED%x SONAR_TOKEN is not set in .env file%NC%
    echo.
    echo Please add your SonarQube token to .env file:
    echo.
    echo 1. Open %SONAR_HOST_URL%
    echo 2. Login as admin
    echo 3. Go to: Administration -^> Security -^> Users -^> admin -^> Tokens
    echo 4. Generate a token ^(e.g., 'scanner-token'^)
    echo 5. Copy the token and add it to .env file:
    echo.
    echo %YELLOW%   SONAR_TOKEN=your-token-here%NC%
    echo.
    pause
    exit /b 1
)
echo %GREEN%v Token configured%NC%
echo.

REM ----------------------------------------
REM Step 3: Check Docker
REM ----------------------------------------
echo %YELLOW%[Step 3/6]%NC% Checking Docker...
where docker >nul 2>&1
if errorlevel 1 (
    echo %RED%x Docker not found%NC%
    echo Please install Docker Desktop and try again.
    pause
    exit /b 1
)

docker ps >nul 2>&1
if errorlevel 1 (
    echo %RED%x Docker daemon is not running%NC%
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo %GREEN%v Docker is running%NC%
echo.

REM ----------------------------------------
REM Step 4: Check SonarQube server
REM ----------------------------------------
echo %YELLOW%[Step 4/6]%NC% Checking SonarQube server...
docker ps --format "{{.Names}}" | findstr /i "%SONAR_CONTAINER_NAME%" >nul 2>&1
if errorlevel 1 (
    echo %RED%x SonarQube server is not running%NC%
    echo.
    echo Please start SonarQube server first:
    echo %YELLOW%  start_w.bat%NC%
    echo.
    echo Or if already set up:
    echo %YELLOW%  docker compose up -d%NC%
    echo.
    pause
    exit /b 1
)

echo Checking server health...
set "max_attempts=10"
set "attempt=0"
set "server_ready=false"

:health_check_loop
if !attempt! geq %max_attempts% goto health_check_failed

REM Get actual container name
for /f "tokens=*" %%i in ('docker ps --format "{{.Names}}" ^| findstr /i "%SONAR_CONTAINER_NAME%"') do (
    set "ACTUAL_CONTAINER=%%i"
)

docker exec !ACTUAL_CONTAINER! wget -qO- %SONAR_HOST_URL%/api/system/status 2>nul | findstr "\"status\":\"UP\"" >nul 2>&1
if not errorlevel 1 (
    echo %GREEN%v SonarQube server is UP%NC%
    set "server_ready=true"
    goto health_check_success
)

if !attempt! equ 0 (
    echo|set /p="Waiting for server to be ready"
)
echo|set /p="."
set /a attempt+=1
timeout /t 2 /nobreak >nul
goto health_check_loop

:health_check_failed
echo.
echo %RED%x SonarQube server is not responding%NC%
echo Check logs: docker compose logs -f %SONAR_CONTAINER_NAME%
pause
exit /b 1

:health_check_success
echo.
echo.

REM ----------------------------------------
REM Step 5: Check network
REM ----------------------------------------
echo %YELLOW%[Step 5/6]%NC% Checking Docker network...
set "SONARQUBE_NETWORK="

REM Try to find the network
for /f "tokens=*" %%n in ('docker network ls --format "{{.Name}}" 2^>nul') do (
    echo %%n | findstr /i "%SONARQUBE_NETWORK_NAME%" >nul 2>&1
    if not errorlevel 1 (
        set "SONARQUBE_NETWORK=%%n"
        goto network_found
    )
    echo %%n | findstr /i "sonarqube_sonarqube-net" >nul 2>&1
    if not errorlevel 1 (
        set "SONARQUBE_NETWORK=%%n"
        goto network_found
    )
)

:network_found
if not defined SONARQUBE_NETWORK (
    echo %RED%x SonarQube network not found%NC%
    echo Please ensure SonarQube server is running:
    echo %YELLOW%  docker compose up -d%NC%
    pause
    exit /b 1
)

echo %GREEN%v Network detected:%NC% !SONARQUBE_NETWORK!
echo.

REM ----------------------------------------
REM Step 6: Run scanner
REM ----------------------------------------
echo %YELLOW%[Step 6/6]%NC% Starting code analysis...
echo.
echo %BLUE%Project: %SONAR_PROJECT_NAME%%NC%
echo %BLUE%Version: %SONAR_PROJECT_VERSION%%NC%
echo %BLUE%Scanning: %SONAR_SOURCES% ^(from project root^)%NC%
echo.

echo Running scanner... ^(this may take a few minutes^)
echo.

REM Check if docker-compose-scanner.yml exists
if not exist docker-compose-scanner.yml (
    echo %RED%x docker-compose-scanner.yml not found%NC%
    echo Please ensure you have the scanner compose file in the current directory.
    pause
    exit /b 1
)

REM Run the scanner and capture exit code
docker compose -f docker-compose-scanner.yml run --rm sonarqube-scanner 2>&1 | findstr /v "Found orphan containers"
set "scanner_exit_code=!errorlevel!"

if !scanner_exit_code! equ 0 (
    goto analysis_success
) else (
    goto analysis_failed
)

:analysis_success
echo.
echo.
echo %GREEN%==========================================
echo v Analysis Complete!
echo ==========================================%NC%
echo.
echo %BLUE%View Results:%NC%
echo   URL: %GREEN%%SONAR_HOST_URL%%NC%
echo   Project: %GREEN%%SONAR_PROJECT_KEY%%NC%
echo.
echo %BLUE%Next Steps:%NC%
echo 1. Open %GREEN%%SONAR_HOST_URL%%NC%
echo 2. Click on your project: %GREEN%%SONAR_PROJECT_NAME%%NC%
echo 3. Review:
echo    - %YELLOW%Issues%NC% - Code quality problems
echo    - %YELLOW%Security%NC% - Vulnerabilities ^& hotspots
echo    - %YELLOW%Coverage%NC% - Test coverage metrics
echo    - %YELLOW%Duplications%NC% - Repeated code blocks
echo.
echo %BLUE%Useful Commands:%NC%
echo   Re-run analysis:    %YELLOW%scan_w.bat%NC%
echo   View server logs:   %YELLOW%docker compose logs -f %SONAR_CONTAINER_NAME%%NC%
echo   View scanner logs:  %YELLOW%docker compose -f docker-compose-scanner.yml logs%NC%
echo.
goto end_script

:analysis_failed
echo.
echo %RED%==========================================
echo x Analysis Failed
echo ==========================================%NC%
echo.
echo Common issues:
echo 1. Token is invalid - regenerate in SonarQube UI
echo 2. Project key contains invalid characters
echo 3. Server is not fully started - wait and retry
echo.
echo View logs for more details:
echo %YELLOW%  docker compose -f docker-compose-scanner.yml logs%NC%
echo.
pause
exit /b 1

:end_script
endlocal
exit /b 0