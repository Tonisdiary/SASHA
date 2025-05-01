@echo off
setlocal

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ===================================
echo EAS Project Fix
echo ===================================

echo This script will fix the EAS project configuration.
echo.

REM Create .easconfig file directly
echo {"projectId":"b0829ebb-4926-4d9b-9d34-1a16db43d4eb"} > .easconfig

echo Created .easconfig file.
echo.

REM Update app.json
echo Creating PowerShell script to update app.json...
echo $appJson = Get-Content -Path "app.json" -Raw ^| ConvertFrom-Json > fix-app-json.ps1
echo. >> fix-app-json.ps1
echo # Ensure the extra section exists >> fix-app-json.ps1
echo if (-not $appJson.expo.extra) { >> fix-app-json.ps1
echo     $appJson.expo.extra = @{} >> fix-app-json.ps1
echo } >> fix-app-json.ps1
echo. >> fix-app-json.ps1
echo # Ensure the eas section exists >> fix-app-json.ps1
echo if (-not $appJson.expo.extra.eas) { >> fix-app-json.ps1
echo     $appJson.expo.extra.eas = @{} >> fix-app-json.ps1
echo } >> fix-app-json.ps1
echo. >> fix-app-json.ps1
echo # Set the project ID >> fix-app-json.ps1
echo $appJson.expo.extra.eas.projectId = "b0829ebb-4926-4d9b-9d34-1a16db43d4eb" >> fix-app-json.ps1
echo. >> fix-app-json.ps1
echo # Set the owner >> fix-app-json.ps1
echo $appJson.expo.owner = "tonis.diary" >> fix-app-json.ps1
echo. >> fix-app-json.ps1
echo # Save the updated app.json >> fix-app-json.ps1
echo $appJson ^| ConvertTo-Json -Depth 10 ^| Set-Content -Path "app.json" >> fix-app-json.ps1
echo. >> fix-app-json.ps1
echo Write-Host "Updated app.json with project ID and owner" >> fix-app-json.ps1

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File fix-app-json.ps1

REM Clean up
del fix-app-json.ps1

echo.
echo EAS project configuration fixed!
echo.
echo You can now run eas-build.bat to build your app.
echo.
pause

endlocal