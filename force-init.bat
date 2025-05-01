@echo off
setlocal

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ===================================
echo Force EAS Project Init
echo ===================================

echo This script will force initialize your EAS project.
echo.

REM Delete existing .easconfig if it exists
if exist ".easconfig" (
    echo Removing existing .easconfig file...
    del /f /q .easconfig
)

REM Create new .easconfig file with the correct format
echo Creating new .easconfig file...
echo {> .easconfig
echo   "projectId": "b0829ebb-4926-4d9b-9d34-1a16db43d4eb">> .easconfig
echo }>> .easconfig

echo .easconfig file created.
echo.

REM Update app.json directly
echo Updating app.json...
echo $appJson = Get-Content -Path "app.json" -Raw ^| ConvertFrom-Json > force-init.ps1
echo. >> force-init.ps1
echo # Ensure the extra section exists >> force-init.ps1
echo if (-not $appJson.expo.extra) { >> force-init.ps1
echo     $appJson.expo.extra = @{} >> force-init.ps1
echo } >> force-init.ps1
echo. >> force-init.ps1
echo # Ensure the eas section exists >> force-init.ps1
echo if (-not $appJson.expo.extra.eas) { >> force-init.ps1
echo     $appJson.expo.extra.eas = @{} >> force-init.ps1
echo } >> force-init.ps1
echo. >> force-init.ps1
echo # Set the project ID >> force-init.ps1
echo $appJson.expo.extra.eas.projectId = "b0829ebb-4926-4d9b-9d34-1a16db43d4eb" >> force-init.ps1
echo. >> force-init.ps1
echo # Set the owner >> force-init.ps1
echo $appJson.expo.owner = "tonis.diary" >> force-init.ps1
echo. >> force-init.ps1
echo # Save the updated app.json >> force-init.ps1
echo $appJson ^| ConvertTo-Json -Depth 10 ^| Set-Content -Path "app.json" >> force-init.ps1
echo. >> force-init.ps1
echo Write-Host "Updated app.json with project ID and owner" >> force-init.ps1

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File force-init.ps1

REM Clean up
del force-init.ps1

echo.
echo Now running EAS init with force flag...
call npx eas init --id b0829ebb-4926-4d9b-9d34-1a16db43d4eb --non-interactive --force

echo.
echo Force initialization completed!
echo.
echo Next steps:
echo 1. Run eas-login.bat to log in to your Expo account
echo 2. Try building with direct-build.bat
echo.
pause

endlocal