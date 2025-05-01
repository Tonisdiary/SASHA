@echo off
setlocal

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ===================================
echo EAS Project Init
echo ===================================

echo This script will initialize your EAS project.
echo.
echo Press any key to continue...
pause > nul

echo.
echo Running EAS init...
call npx eas init --id b0829ebb-4926-4d9b-9d34-1a16db43d4eb

if %ERRORLEVEL% NEQ 0 (
    echo Failed to initialize EAS project. Please try again.
    pause
    exit /b 1
)

echo.
echo EAS project initialized successfully!
echo.
echo You can now run eas-build.bat to build your app.
echo.
pause

endlocal