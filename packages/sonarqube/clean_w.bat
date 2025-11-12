@echo off
setlocal enabledelayedexpansion

REM ========================================
REM SonarQube Cleanup Script for Windows
REM Removes containers, volumes, and networks
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
echo %BLUE%Cleaning up SonarQube environment...%NC%
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

REM ----------------------------------------
REM Step 1: Stop all containers
REM ----------------------------------------
echo %YELLOW%[STEP 1] Stopping containers...%NC%

if exist docker-compose.yml (
    docker compose down --remove-orphans >nul 2>&1
)

if exist docker-compose-scanner.yml (
    docker compose -f docker-compose-scanner.yml down --remove-orphans >nul 2>&1
)

docker stop %SONAR_CONTAINER_NAME% >nul 2>&1
docker stop %POSTGRES_CONTAINER_NAME% >nul 2>&1
docker stop %SCANNER_CONTAINER_NAME% >nul 2>&1

echo %GREEN%v Containers stopped%NC%
echo.

REM ----------------------------------------
REM Step 2: Remove containers
REM ----------------------------------------
echo %YELLOW%[STEP 2] Removing leftover containers...%NC%

docker rm -f %SONAR_CONTAINER_NAME% >nul 2>&1
docker rm -f %POSTGRES_CONTAINER_NAME% >nul 2>&1
docker rm -f %SCANNER_CONTAINER_NAME% >nul 2>&1

echo %GREEN%v Containers removed%NC%
echo.

REM ----------------------------------------
REM Step 3: Remove SonarQube-related volumes
REM ----------------------------------------
echo %YELLOW%[STEP 3] Removing SonarQube volumes...%NC%

set "volumes_found=false"
set "volume_list="

REM Find all SonarQube-related volumes
for /f "tokens=*" %%v in ('docker volume ls -q 2^>nul') do (
    echo %%v | findstr /i "sonar scanner" >nul 2>&1
    if not errorlevel 1 (
        set "volumes_found=true"
        set "volume_list=!volume_list! %%v"
    )
)

if "!volumes_found!"=="true" (
    echo %BLUE%Found volumes:%NC%
    for %%v in (!volume_list!) do (
        echo %%v
        docker volume rm -f %%v >nul 2>&1
    )
    echo %GREEN%v Volumes removed%NC%
) else (
    echo %GREEN%v No SonarQube volumes found%NC%
)
echo.

REM ----------------------------------------
REM Step 4: Prune unused Docker volumes
REM ----------------------------------------
echo %YELLOW%[STEP 4] Pruning unused Docker volumes...%NC%
docker volume prune -f >nul 2>&1
echo %GREEN%v Unused volumes pruned%NC%
echo.

REM ----------------------------------------
REM Step 5: Remove unused networks
REM ----------------------------------------
echo %YELLOW%[STEP 5] Cleaning up Docker networks...%NC%
docker network prune -f >nul 2>&1
echo %GREEN%v Networks cleaned%NC%
echo.

REM ----------------------------------------
REM Step 6: Remove dangling images
REM ----------------------------------------
echo %YELLOW%[STEP 6] Removing unused Docker images...%NC%
docker image prune -f >nul 2>&1
echo %GREEN%v Dangling images removed%NC%
echo.

REM ----------------------------------------
REM Step 7: Verification
REM ----------------------------------------
echo %YELLOW%[STEP 7] Verification:%NC%
echo.

echo %BLUE%Checking remaining containers...%NC%
set "containers_found=false"

for /f "tokens=*" %%c in ('docker ps -a --format "{{.Names}}" 2^>nul') do (
    echo %%c | findstr /i "%SONAR_CONTAINER_NAME%" >nul 2>&1
    if not errorlevel 1 (
        set "containers_found=true"
        echo %%c
    )
    echo %%c | findstr /i "%POSTGRES_CONTAINER_NAME%" >nul 2>&1
    if not errorlevel 1 (
        set "containers_found=true"
        echo %%c
    )
    echo %%c | findstr /i "%SCANNER_CONTAINER_NAME%" >nul 2>&1
    if not errorlevel 1 (
        set "containers_found=true"
        echo %%c
    )
)

if "!containers_found!"=="true" (
    echo %RED%Some containers are still present.%NC%
) else (
    echo %GREEN%v No SonarQube containers found%NC%
)
echo.

echo %BLUE%Checking remaining volumes...%NC%
set "volumes_remain=false"

for /f "tokens=*" %%v in ('docker volume ls --format "{{.Name}}" 2^>nul') do (
    echo %%v | findstr /i "sonar scanner" >nul 2>&1
    if not errorlevel 1 (
        set "volumes_remain=true"
        echo %%v
    )
)

if "!volumes_remain!"=="true" (
    echo %RED%Some SonarQube volumes are still present.%NC%
) else (
    echo %GREEN%v No SonarQube volumes remain%NC%
)
echo.

echo %GREEN%Cleanup complete. SonarQube environment reset successfully.%NC%
echo.

endlocal
exit /b 0