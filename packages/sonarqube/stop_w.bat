@echo off
setlocal enabledelayedexpansion

REM ========================================
REM SonarQube Stop Script for Windows
REM Gracefully stops running containers
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

echo %BLUE%==========================================%NC%
echo %BLUE%Stopping SonarQube containers...%NC%
echo %BLUE%==========================================%NC%
echo.

REM ----------------------------------------
REM Load environment variables from .env file
REM ----------------------------------------
if exist .env (
    echo Loading environment variables from .env...
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
    echo %GREEN%v Environment variables loaded%NC%
) else (
    echo %YELLOW%!!! .env file not found. Using default values.%NC%
)
echo.

REM ----------------------------------------
REM Default fallbacks if missing in .env
REM ----------------------------------------
if not defined POSTGRES_CONTAINER_NAME set "POSTGRES_CONTAINER_NAME=sonarqube-db"
if not defined SONAR_CONTAINER_NAME set "SONAR_CONTAINER_NAME=sonarqube"
if not defined SCANNER_CONTAINER_NAME set "SCANNER_CONTAINER_NAME=sonarqube-scanner"
if not defined SONARQUBE_PORT_HOST set "SONARQUBE_PORT_HOST=9000"
if not defined POSTGRES_PORT_HOST set "POSTGRES_PORT_HOST=5433"

REM ----------------------------------------
REM Check Docker availability
REM ----------------------------------------
where docker >nul 2>&1
if errorlevel 1 (
    echo %RED%x Docker not found%NC%
    echo Please ensure Docker Desktop is installed.
    pause
    exit /b 1
)

docker ps >nul 2>&1
if errorlevel 1 (
    echo %RED%x Docker daemon not running%NC%
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM ----------------------------------------
REM Step 1: Stop main docker-compose stack
REM ----------------------------------------
echo %YELLOW%[STEP 1] Stopping main containers...%NC%
if exist docker-compose.yml (
    docker compose stop
    if errorlevel 1 (
        echo %YELLOW%!!! Warning: Error stopping main containers%NC%
    ) else (
        echo %GREEN%v Main containers stopped%NC%
    )
) else (
    echo %YELLOW%!!! docker-compose.yml not found, skipping main stack%NC%
)
echo.

REM ----------------------------------------
REM Step 2: Stop any scanner-related stack
REM ----------------------------------------
echo %YELLOW%[STEP 2] Stopping scanner containers (if any^)...%NC%
if exist docker-compose-scanner.yml (
    docker compose -f docker-compose-scanner.yml stop >nul 2>&1
)
docker stop %SCANNER_CONTAINER_NAME% >nul 2>&1
echo %GREEN%v Scanner containers handled%NC%
echo.

REM ----------------------------------------
REM Step 3: Verify containers are stopped
REM ----------------------------------------
echo %YELLOW%[STEP 3] Verifying container shutdown...%NC%
set "containers_running=false"

REM Check if any target containers are still running
docker ps --format "{{.Names}}" 2>nul | findstr /C:"%SONAR_CONTAINER_NAME%" >nul 2>&1
if not errorlevel 1 set "containers_running=true"

docker ps --format "{{.Names}}" 2>nul | findstr /C:"%POSTGRES_CONTAINER_NAME%" >nul 2>&1
if not errorlevel 1 set "containers_running=true"

docker ps --format "{{.Names}}" 2>nul | findstr /C:"%SCANNER_CONTAINER_NAME%" >nul 2>&1
if not errorlevel 1 set "containers_running=true"

if "!containers_running!"=="true" (
    echo %RED%Some containers still running. Forcing shutdown...%NC%
    docker stop %SONAR_CONTAINER_NAME% >nul 2>&1
    docker stop %POSTGRES_CONTAINER_NAME% >nul 2>&1
    docker stop %SCANNER_CONTAINER_NAME% >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo %GREEN%v Forced shutdown complete%NC%
) else (
    echo %GREEN%v All containers stopped successfully%NC%
)
echo.

REM ----------------------------------------
REM Step 4: Check for leaked SonarQube processes
REM ----------------------------------------
echo %YELLOW%[STEP 4] Checking for leftover processes...%NC%
set "sonar_procs_found=false"

REM Look for Java processes related to SonarQube
for /f "tokens=2" %%p in ('tasklist /FI "IMAGENAME eq java.exe" /FO CSV /NH 2^>nul ^| find "java.exe"') do (
    REM Check if this Java process is SonarQube-related
    wmic process where "ProcessId=%%~p" get CommandLine 2>nul | findstr /I "sonar" >nul 2>&1
    if not errorlevel 1 (
        set "sonar_procs_found=true"
        echo %RED%Found active SonarQube process: %%~p. Terminating...%NC%
        taskkill /F /PID %%~p >nul 2>&1
    )
)

if "!sonar_procs_found!"=="false" (
    echo %GREEN%v No residual SonarQube processes detected%NC%
) else (
    echo %GREEN%v SonarQube processes terminated%NC%
)
echo.

echo %GREEN%All SonarQube containers stopped cleanly.%NC%
echo.

REM ----------------------------------------
REM Step 5: Check for processes occupying ports
REM ----------------------------------------
echo %YELLOW%[STEP 5] Checking for active processes on SonarQube/Postgres ports...%NC%
echo.

REM Check SonarQube port
echo %BLUE%Checking port %SONARQUBE_PORT_HOST%...%NC%
set "port_in_use=false"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%SONARQUBE_PORT_HOST%" ^| findstr "LISTENING"') do (
    set "port_in_use=true"
    set "pid=%%p"
    echo %RED%Port %SONARQUBE_PORT_HOST% is still in use by process: !pid!%NC%
    echo %YELLOW%Killing process !pid! on port %SONARQUBE_PORT_HOST%...%NC%
    taskkill /F /PID !pid! >nul 2>&1
    if not errorlevel 1 (
        echo %GREEN%v Cleared port %SONARQUBE_PORT_HOST% successfully%NC%
    ) else (
        echo %RED%x Failed to kill process !pid!%NC%
    )
)
if "!port_in_use!"=="false" (
    echo %GREEN%v No processes found on port %SONARQUBE_PORT_HOST%%NC%
)
echo.

REM Check PostgreSQL port
echo %BLUE%Checking port %POSTGRES_PORT_HOST%...%NC%
set "port_in_use=false"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%POSTGRES_PORT_HOST%" ^| findstr "LISTENING"') do (
    set "port_in_use=true"
    set "pid=%%p"
    echo %RED%Port %POSTGRES_PORT_HOST% is still in use by process: !pid!%NC%
    echo %YELLOW%Killing process !pid! on port %POSTGRES_PORT_HOST%...%NC%
    taskkill /F /PID !pid! >nul 2>&1
    if not errorlevel 1 (
        echo %GREEN%v Cleared port %POSTGRES_PORT_HOST% successfully%NC%
    ) else (
        echo %RED%x Failed to kill process !pid!%NC%
    )
)
if "!port_in_use!"=="false" (
    echo %GREEN%v No processes found on port %POSTGRES_PORT_HOST%%NC%
)
echo.

REM ----------------------------------------
REM Final summary
REM ----------------------------------------
echo.
echo %GREEN%==========================================%NC%
echo %GREEN%v Shutdown Complete!%NC%
echo %GREEN%==========================================%NC%
echo.
echo %BLUE%Summary:%NC%
echo   - Containers stopped: %GREEN%v%NC%
echo   - Ports cleared: %GREEN%v%NC%
echo   - Processes terminated: %GREEN%v%NC%
echo.
echo %BLUE%To remove containers and volumes completely, run:%NC%
echo   docker compose down --volumes
echo.
echo %BLUE%To restart SonarQube, run:%NC%
echo   start_w.bat
echo.

endlocal
exit /b 0