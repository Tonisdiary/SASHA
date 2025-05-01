@echo off
setlocal

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ===================================
echo Reset EAS Configuration
echo ===================================

echo This script will completely reset your EAS configuration and set it up from scratch.
echo.
echo WARNING: This will delete your existing EAS configuration.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

REM Delete existing EAS configuration files
if exist ".easconfig" (
    echo Removing .easconfig file...
    del /f /q .easconfig
)

if exist "eas.json" (
    echo Removing eas.json file...
    del /f /q eas.json
)

REM Update app.json to remove EAS configuration
echo Updating app.json to remove EAS configuration...
echo $appJson = Get-Content -Path "app.json" -Raw ^| ConvertFrom-Json > reset-eas.ps1
echo. >> reset-eas.ps1
echo # Remove EAS configuration >> reset-eas.ps1
echo if ($appJson.expo.extra -and $appJson.expo.extra.eas) { >> reset-eas.ps1
echo     $appJson.expo.extra.eas = $null >> reset-eas.ps1
echo } >> reset-eas.ps1
echo. >> reset-eas.ps1
echo # Save the updated app.json >> reset-eas.ps1
echo $appJson ^| ConvertTo-Json -Depth 10 ^| Set-Content -Path "app.json" >> reset-eas.ps1
echo. >> reset-eas.ps1
echo Write-Host "Removed EAS configuration from app.json" >> reset-eas.ps1

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File reset-eas.ps1

REM Clean up
del reset-eas.ps1

echo.
echo Creating new eas.json file...
echo {> eas.json
echo   "cli": {>> eas.json
echo     "version": "^16.3.3">> eas.json
echo   },>> eas.json
echo   "build": {>> eas.json
echo     "development": {>> eas.json
echo       "developmentClient": true,>> eas.json
echo       "distribution": "internal",>> eas.json
echo       "ios": {>> eas.json
echo         "simulator": true>> eas.json
echo       }>> eas.json
echo     },>> eas.json
echo     "preview": {>> eas.json
echo       "distribution": "internal">> eas.json
echo     },>> eas.json
echo     "production": {>> eas.json
echo       "autoIncrement": true>> eas.json
echo     }>> eas.json
echo   },>> eas.json
echo   "submit": {>> eas.json
echo     "production": {}>> eas.json
echo   }>> eas.json
echo }>> eas.json

echo.
echo Now running EAS init with force flag...
call npx eas init --id b0829ebb-4926-4d9b-9d34-1a16db43d4eb --non-interactive --force

echo.
echo EAS configuration reset and initialized!
echo.
echo Next steps:
echo 1. Run eas-login.bat to log in to your Expo account
echo 2. Try building with direct-build.bat
echo.
pause

endlocal