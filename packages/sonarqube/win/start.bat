@echo off
setlocal enabledelayedexpansion

REM ========================================
REM SonarQube Local Start Script for Windows
REM Uses .env configuration
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
echo SonarQube Windows Start Script
echo ==========================================
echo.

REM ----------------------------------------
REM Navigate to sonarqube directory
REM ----------------------------------------
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.."
echo %GREEN%v Changed directory to %CD%%NC%
echo.  


REM ----------------------------------------
REM Load environment variables from .env file
REM ----------------------------------------
if not exist .env (
    echo %RED%!!! .env file not found in current directory.%NC%
    echo Please create one first (see example in README^).
    pause
    exit /b 1
)

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
echo.

REM ----------------------------------------
REM Default fallbacks if missing in .env
REM ----------------------------------------
if not defined POSTGRES_PORT_HOST set "POSTGRES_PORT_HOST=5433"
if not defined SONARQUBE_PORT_HOST set "SONARQUBE_PORT_HOST=9000"
if not defined POSTGRES_CONTAINER_NAME set "POSTGRES_CONTAINER_NAME=sonarqube-db"
if not defined SONAR_CONTAINER_NAME set "SONAR_CONTAINER_NAME=sonarqube"
if not defined POSTGRES_USER set "POSTGRES_USER=sonar"
if not defined POSTGRES_PASSWORD set "POSTGRES_PASSWORD=sonar"
if not defined POSTGRES_DB set "POSTGRES_DB=sonar"
if not defined AUTO_KILL_PORTS set "AUTO_KILL_PORTS=false"

REM ----------------------------------------
REM Step 1: Windows OS check
REM ----------------------------------------
echo %YELLOW%[Step 1/7]%NC% Checking Windows system...
ver | findstr /i "Windows" >nul 2>&1
if errorlevel 1 (
    echo %RED%x Not Windows%NC%
    pause
    exit /b 1
)
echo %GREEN%v Windows detected%NC%
echo.

REM ----------------------------------------
REM Step 2: Docker check
REM ----------------------------------------
echo %YELLOW%[Step 2/7]%NC% Checking Docker Desktop...
where docker >nul 2>&1
if errorlevel 1 (
    echo %RED%x Docker not found%NC%
    echo Please install Docker Desktop for Windows from:
    echo https://www.docker.com/products/docker-desktop
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
echo %GREEN%v Docker is running%NC%
echo.

REM ----------------------------------------
REM Step 3: Docker Compose check
REM ----------------------------------------
echo %YELLOW%[Step 3/7]%NC% Checking Docker Compose...
docker compose version >nul 2>&1
if errorlevel 1 (
    echo %RED%x Docker Compose not available%NC%
    echo Docker Compose should be included with Docker Desktop.
    echo Please update Docker Desktop to the latest version.
    pause
    exit /b 1
)
echo %GREEN%v Docker Compose OK%NC%
echo.

REM ----------------------------------------
REM Step 4: Port checks
REM ----------------------------------------
echo %YELLOW%[Step 4/7]%NC% Checking ports...

REM Check SonarQube port
set "SONAR_PORT_IN_USE=false"
netstat -ano | findstr ":%SONARQUBE_PORT_HOST%" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    set "SONAR_PORT_IN_USE=true"
    echo %YELLOW%!!! Port %SONARQUBE_PORT_HOST% is in use%NC%
    
    if /i "!AUTO_KILL_PORTS!"=="true" (
        echo Attempting to free port %SONARQUBE_PORT_HOST%...
        for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%SONARQUBE_PORT_HOST%" ^| findstr "LISTENING"') do (
            echo Killing process %%p...
            taskkill /F /PID %%p >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
        set "SONAR_PORT_IN_USE=false"
    ) else (
        echo This may cause issues. Consider stopping the service using this port.
    )
) else (
    echo %GREEN%v Port %SONARQUBE_PORT_HOST% available%NC%
)

REM Check PostgreSQL port
set "POSTGRES_PORT_IN_USE=false"
netstat -ano | findstr ":%POSTGRES_PORT_HOST%" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    set "POSTGRES_PORT_IN_USE=true"
    echo %RED%x Port %POSTGRES_PORT_HOST% is in use%NC%
    
    if /i "!AUTO_KILL_PORTS!"=="true" (
        echo Attempting to free port %POSTGRES_PORT_HOST%...
        for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%POSTGRES_PORT_HOST%" ^| findstr "LISTENING"') do (
            echo Killing process %%p...
            taskkill /F /PID %%p >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
        
        REM Verify port is now free
        netstat -ano | findstr ":%POSTGRES_PORT_HOST%" | findstr "LISTENING" >nul 2>&1
        if errorlevel 1 (
            echo %GREEN%v Port %POSTGRES_PORT_HOST% freed successfully%NC%
            set "POSTGRES_PORT_IN_USE=false"
        ) else (
            echo %RED%x Failed to free port %POSTGRES_PORT_HOST%%NC%
            echo You can find which process is using it with: netstat -ano ^| findstr ":%POSTGRES_PORT_HOST%"
            pause
            exit /b 1
        )
    ) else (
        echo Cannot start PostgreSQL. Please free up this port and try again.
        echo.
        echo %YELLOW%Options:%NC%
        echo 1. Kill the process manually: taskkill /F /PID [PID]
        echo 2. Change POSTGRES_PORT_HOST in .env file
        echo 3. Set AUTO_KILL_PORTS=true in .env to automatically kill blocking processes
        echo.
        echo You can find which process is using it with: netstat -ano ^| findstr ":%POSTGRES_PORT_HOST%"
        pause
        exit /b 1
    )
) else (
    echo %GREEN%v Port %POSTGRES_PORT_HOST% available%NC%
)
echo.

REM ----------------------------------------
REM Step 5: Cleanup
REM ----------------------------------------
echo %YELLOW%[Step 5/7]%NC% Cleaning up containers...
docker compose down --remove-orphans >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%!!! Warning: docker compose down encountered issues%NC%
)
docker compose -f docker-compose-scanner.yml down >nul 2>&1
echo %GREEN%v Cleanup complete%NC%
echo.

REM ----------------------------------------
REM Step 6: Start services
REM ----------------------------------------
echo %YELLOW%[Step 6/7]%NC% Starting SonarQube + PostgreSQL...

REM Check if docker-compose.yml exists
if not exist docker-compose.yml (
    echo %RED%x docker-compose.yml not found in current directory%NC%
    echo Please ensure you're running this script from the correct directory.
    pause
    exit /b 1
)

docker compose up -d
if errorlevel 1 (
    echo %RED%x Failed to start containers%NC%
    echo Check docker-compose.yml for errors.
    pause
    exit /b 1
)

REM Wait a bit for containers to initialize
echo Waiting for containers to initialize...
timeout /t 3 /nobreak >nul

REM Get the actual service name from docker-compose.yml
set "SONAR_SERVICE_NAME="
for /f "tokens=*" %%i in ('docker compose config --services 2^>nul') do (
    echo %%i | findstr /i "sonar" >nul 2>&1
    if not errorlevel 1 (
        set "SONAR_SERVICE_NAME=%%i"
    )
)

if not defined SONAR_SERVICE_NAME (
    echo %YELLOW%!!! Could not detect SonarQube service name, using default%NC%
    set "SONAR_SERVICE_NAME=sonarqube"
)

echo %BLUE%Detected SonarQube service: %SONAR_SERVICE_NAME%%NC%

REM Check if SonarQube container is running
docker ps --format "{{.Names}}" | findstr /i "sonar" >nul 2>&1
if errorlevel 1 (
    echo %RED%x SonarQube container failed to start%NC%
    echo.
    echo Container logs:
    echo ----------------------------------------
    docker compose logs %SONAR_SERVICE_NAME%
    echo ----------------------------------------
    pause
    exit /b 1
)

REM Get actual container name
for /f "tokens=*" %%i in ('docker ps --format "{{.Names}}" ^| findstr /i "sonar"') do (
    set "ACTUAL_SONAR_CONTAINER=%%i"
)

echo %BLUE%Using container: %ACTUAL_SONAR_CONTAINER%%NC%

REM Check if PostgreSQL container is running
docker ps --format "{{.Names}}" | findstr /C:"%POSTGRES_CONTAINER_NAME%" >nul 2>&1
if errorlevel 1 (
    echo %RED%x PostgreSQL container failed to start%NC%
    echo.
    echo Container logs:
    echo ----------------------------------------
    docker compose logs
    echo ----------------------------------------
    pause
    exit /b 1
)

echo %GREEN%v Containers started successfully%NC%
echo.

REM ----------------------------------------
REM Step 7: Wait for SonarQube health
REM ----------------------------------------
echo %YELLOW%[Step 7/7]%NC% Waiting for SonarQube to be ready...
echo This may take a few minutes on first startup...
set "max_attempts=90"
set "attempt=0"

:health_check_loop
if !attempt! geq %max_attempts% goto health_timeout

REM Try multiple methods to check health
REM Method 1: Check via wget inside container
docker exec %ACTUAL_SONAR_CONTAINER% wget -qO- http://localhost:%SONARQUBE_PORT_HOST%/api/system/status 2>nul | findstr "\"status\":\"UP\"" >nul 2>&1
if not errorlevel 1 (
    echo %GREEN%v SonarQube is ready!%NC%
    goto health_success
)

REM Method 2: Check via curl from host (if available)
curl -s http://localhost:%SONARQUBE_PORT_HOST%/api/system/status 2>nul | findstr "\"status\":\"UP\"" >nul 2>&1
if not errorlevel 1 (
    echo %GREEN%v SonarQube is ready!%NC%
    goto health_success
)

REM Show progress
set /a progress=!attempt!*100/%max_attempts%
if !attempt! equ 22 echo Still waiting... (!progress!%% complete^)
if !attempt! equ 45 echo Still waiting... (!progress!%% complete^)
if !attempt! equ 67 echo Still waiting... (!progress!%% complete^)

REM Check if container is still running
docker ps --format "{{.Names}}" | findstr "%ACTUAL_SONAR_CONTAINER%" >nul 2>&1
if errorlevel 1 (
    echo %RED%x Container stopped unexpectedly%NC%
    goto show_logs_and_exit
)

set /a attempt+=1
timeout /t 2 /nobreak >nul
goto health_check_loop

:health_timeout
echo %RED%x Timeout waiting for SonarQube (waited 3 minutes^)%NC%
goto show_logs_and_exit

:show_logs_and_exit
echo.
echo This could be due to:
echo - Insufficient system resources
echo - Database connection issues
echo - SonarQube startup errors
echo.
echo %YELLOW%Showing container logs:%NC%
echo ----------------------------------------
docker compose logs --tail=50 %SONAR_SERVICE_NAME%
echo ----------------------------------------
echo.
echo %BLUE%For full logs, run: docker compose logs -f %SONAR_SERVICE_NAME%%NC%
pause
exit /b 1

:health_success
echo.

REM ----------------------------------------
REM Verify containers are still running
REM ----------------------------------------
docker ps --format "{{.Names}}" | findstr "%ACTUAL_SONAR_CONTAINER%" >nul 2>&1
if errorlevel 1 (
    echo %RED%x SonarQube container stopped unexpectedly%NC%
    docker compose logs %SONAR_SERVICE_NAME%
    pause
    exit /b 1
)

docker ps --format "{{.Names}}" | findstr /C:"%POSTGRES_CONTAINER_NAME%" >nul 2>&1
if errorlevel 1 (
    echo %RED%x PostgreSQL container stopped unexpectedly%NC%
    docker compose logs
    pause
    exit /b 1
)

REM ----------------------------------------
REM Done summary
REM ----------------------------------------
echo.
echo %GREEN%==========================================
echo v Start Complete!
echo ==========================================%NC%
echo.
echo %BLUE%Access SonarQube:%NC%
echo   URL: %GREEN%http://localhost:%SONARQUBE_PORT_HOST%%NC%
echo   Username: %GREEN%admin%NC%
echo   Password: %GREEN%admin%NC%
echo.
echo %BLUE%Database:%NC%
echo   Host: %GREEN%localhost%NC%
echo   Port: %GREEN%%POSTGRES_PORT_HOST%%NC%
echo   DB: %GREEN%%POSTGRES_DB%%NC%
echo   User: %GREEN%%POSTGRES_USER%%NC%
echo.
echo %BLUE%Container Names:%NC%
echo   SonarQube: %GREEN%!ACTUAL_SONAR_CONTAINER!%NC%
echo   PostgreSQL: %GREEN%%POSTGRES_CONTAINER_NAME%%NC%
echo.
echo %BLUE%Useful Commands:%NC%
echo   docker compose logs -f %SONAR_SERVICE_NAME%
echo   docker compose down
echo   docker compose restart
echo   docker compose ps
echo.
echo Next: Open http://localhost:%SONARQUBE_PORT_HOST% and create your token for scanning.
echo.
echo %YELLOW%Note:%NC% Press Ctrl+C to stop viewing logs if you run the logs command.
echo.

endlocal
exit /b 0