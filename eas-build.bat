@echo off
echo ===================================
echo EAS Build Helper
echo ===================================

echo Checking EAS CLI installation...
where eas >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo EAS CLI not found. Installing...
    call npm install -g eas-cli
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install EAS CLI. Please install it manually with: npm install -g eas-cli
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

if "%platform%"=="all" (
    echo Running: eas build --platform all --profile %profile%
    call npx eas build --platform all --profile %profile%
) else (
    echo Running: eas build --platform %platform% --profile %profile%
    call npx eas build --platform %platform% --profile %profile%
)

echo.
echo Build process initiated. Check the EAS dashboard for build status.
echo.
pause