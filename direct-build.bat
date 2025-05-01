@echo off
setlocal

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ===================================
echo Direct EAS Build
echo ===================================

echo This script will directly build your app using EAS.
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

echo.
echo Choose a build profile:
echo 1. Development (with simulator for iOS)
echo 2. Preview
echo 3. Production
echo.
set /p profile_choice="Enter your choice (1-3): "

set platform=
set profile=

if "%platform_choice%"=="1" set platform=ios
if "%platform_choice%"=="2" set platform=android
if "%platform_choice%"=="3" set platform=all

if "%profile_choice%"=="1" set profile=development
if "%profile_choice%"=="2" set profile=preview
if "%profile_choice%"=="3" set profile=production

if "%platform%"=="" (
    echo Invalid platform choice.
    pause
    exit /b 1
)

if "%profile%"=="" (
    echo Invalid profile choice.
    pause
    exit /b 1
)

echo.
echo Building for %platform% with profile: %profile%
echo.

REM Set the EAS project ID directly
set EAS_PROJECT_ID=b0829ebb-4926-4d9b-9d34-1a16db43d4eb

if "%platform%"=="all" (
    echo Running: npx eas build --platform all --profile %profile% --non-interactive --project-id %EAS_PROJECT_ID%
    call npx eas build --platform all --profile %profile% --non-interactive --project-id %EAS_PROJECT_ID%
) else (
    echo Running: npx eas build --platform %platform% --profile %profile% --non-interactive --project-id %EAS_PROJECT_ID%
    call npx eas build --platform %platform% --profile %profile% --non-interactive --project-id %EAS_PROJECT_ID%
)

echo.
echo Build process initiated. Check the EAS dashboard for build status.
echo.
pause

endlocal