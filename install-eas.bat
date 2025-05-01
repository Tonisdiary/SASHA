@echo off
setlocal

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ===================================
echo EAS CLI Installer
echo ===================================

echo This script will install the EAS CLI locally in your project.
echo.

echo Installing EAS CLI...
call npm install --save-dev eas-cli

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install EAS CLI as a dev dependency. Trying as a regular dependency...
    call npm install eas-cli
    
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install EAS CLI. Please check your npm configuration.
        echo.
        echo You can try the following:
        echo 1. Make sure you have Node.js installed
        echo 2. Run 'npm cache clean --force'
        echo 3. Try again
        echo.
        pause
        exit /b 1
    )
)

echo.
echo EAS CLI installed successfully!
echo.
echo You can now run the following scripts:
echo - .\setup-eas.bat to configure your EAS project
echo - .\eas-login.bat to log in to your Expo account
echo - .\eas-build.bat to build your app
echo.
pause

endlocal