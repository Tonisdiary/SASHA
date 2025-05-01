@echo off
setlocal

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ===================================
echo EAS Version Fix
echo ===================================

echo This script will fix the EAS CLI version constraint in your eas.json file.
echo.

REM Check if eas.json exists
if not exist "eas.json" (
    echo Error: eas.json file not found.
    pause
    exit /b 1
)

REM Create PowerShell script file
echo $easJson = Get-Content -Path "eas.json" -Raw ^| ConvertFrom-Json > fix-version.ps1
echo. >> fix-version.ps1
echo # Get the installed EAS CLI version >> fix-version.ps1
echo $installedVersion = "16.3.3" >> fix-version.ps1
echo Write-Host "Using EAS CLI version: $installedVersion" >> fix-version.ps1
echo. >> fix-version.ps1
echo # Update the CLI version constraint >> fix-version.ps1
echo $easJson.cli.version = "^$installedVersion" >> fix-version.ps1
echo. >> fix-version.ps1
echo # Save the updated eas.json >> fix-version.ps1
echo $easJson ^| ConvertTo-Json -Depth 10 ^| Set-Content -Path "eas.json" >> fix-version.ps1
echo. >> fix-version.ps1
echo Write-Host "Updated eas.json with correct version constraint" >> fix-version.ps1

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File fix-version.ps1

REM Clean up
del fix-version.ps1

echo.
echo EAS version constraint fixed!
echo.
echo You can now run eas-build.bat to build your app.
echo.
pause

endlocal