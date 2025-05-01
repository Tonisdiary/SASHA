@echo off
setlocal

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

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
if not exist "node_modules\.bin\eas.cmd" (
    echo EAS CLI not found locally. Installing...
    call npm install --save-dev eas-cli
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install EAS CLI locally. Trying alternative method...
        call npm install eas-cli
        if %ERRORLEVEL% NEQ 0 (
            echo Failed to install EAS CLI. Please check your npm configuration.
            pause
            exit /b 1
        )
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