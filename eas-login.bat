@echo off
echo ===================================
echo EAS Login Helper
echo ===================================

echo This script will help you log in to your Expo account.
echo You'll need to have an Expo account to use EAS Build.
echo.
echo Press any key to continue...
pause > nul

echo.
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
echo Running EAS login...
call npx eas login

if %ERRORLEVEL% NEQ 0 (
    echo Failed to log in to EAS. Please try again.
    pause
    exit /b 1
)

echo.
echo Successfully logged in to EAS!
echo You can now run eas-build.bat to build your app.
echo.
pause