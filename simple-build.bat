@echo off
setlocal

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ===================================
echo Simple EAS Build
echo ===================================

echo This script will build your app using EAS with the simplest approach possible.
echo.

REM Check if the user is logged in
echo Checking if you're logged in to EAS...
call npx eas whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo You're not logged in to EAS. Please log in first.
    call npx eas login
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to log in to EAS.
        pause
        exit /b 1
    )
)

echo.
echo Choose a platform to build for:
echo 1. iOS
echo 2. Android
echo 3. Both
echo.
set /p platform_choice="Enter your choice (1-3): "

set platform=
if "%platform_choice%"=="1" set platform=ios
if "%platform_choice%"=="2" set platform=android
if "%platform_choice%"=="3" set platform=all

if "%platform%"=="" (
    echo Invalid platform choice.
    pause
    exit /b 1
)

echo.
echo Building for %platform% in development mode...
echo.

if "%platform%"=="all" (
    echo Running: npx eas build --platform all --profile development --non-interactive
    call npx eas build --platform all --profile development --non-interactive
) else (
    echo Running: npx eas build --platform %platform% --profile development --non-interactive
    call npx eas build --platform %platform% --profile development --non-interactive
)

echo.
echo Build process initiated. Check the EAS dashboard for build status.
echo.
pause

endlocal