@echo off
setlocal

echo ===================================
echo Create and Configure EAS Project
echo ===================================

echo This script will create a new temporary Expo project and configure it for EAS.
echo Then it will copy the EAS configuration to your current project.
echo.
echo Press any key to continue...
pause > nul

REM Create a temporary directory
set "TEMP_DIR=%TEMP%\expo-temp"
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"
cd /d "%TEMP_DIR%"

echo.
echo Creating temporary Expo project...
call npx create-expo-app temp-project --template blank
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create temporary Expo project.
    pause
    exit /b 1
)

cd temp-project

echo.
echo Initializing EAS project...
call npx eas init --id b0829ebb-4926-4d9b-9d34-1a16db43d4eb --non-interactive
if %ERRORLEVEL% NEQ 0 (
    echo Failed to initialize EAS project.
    pause
    exit /b 1
)

echo.
echo Copying EAS configuration to your project...
if exist ".easconfig" (
    copy /y ".easconfig" "c:\Users\tonys\Downloads\study-buddy\.easconfig"
    echo Copied .easconfig file.
)

REM Copy the eas section from app.json
echo $tempAppJson = Get-Content -Path "app.json" -Raw ^| ConvertFrom-Json > copy-config.ps1
echo $targetAppJson = Get-Content -Path "c:\Users\tonys\Downloads\study-buddy\app.json" -Raw ^| ConvertFrom-Json >> copy-config.ps1
echo. >> copy-config.ps1
echo # Copy the eas configuration >> copy-config.ps1
echo if ($tempAppJson.expo.extra -and $tempAppJson.expo.extra.eas) { >> copy-config.ps1
echo     if (-not $targetAppJson.expo.extra) { >> copy-config.ps1
echo         $targetAppJson.expo.extra = @{} >> copy-config.ps1
echo     } >> copy-config.ps1
echo     $targetAppJson.expo.extra.eas = $tempAppJson.expo.extra.eas >> copy-config.ps1
echo } >> copy-config.ps1
echo. >> copy-config.ps1
echo # Copy the owner >> copy-config.ps1
echo if ($tempAppJson.expo.owner) { >> copy-config.ps1
echo     $targetAppJson.expo.owner = $tempAppJson.expo.owner >> copy-config.ps1
echo } >> copy-config.ps1
echo. >> copy-config.ps1
echo # Save the updated app.json >> copy-config.ps1
echo $targetAppJson ^| ConvertTo-Json -Depth 10 ^| Set-Content -Path "c:\Users\tonys\Downloads\study-buddy\app.json" >> copy-config.ps1
echo. >> copy-config.ps1
echo Write-Host "Updated app.json with EAS configuration" >> copy-config.ps1

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File copy-config.ps1

REM Clean up
del copy-config.ps1
cd /d "c:\Users\tonys\Downloads\study-buddy"
rmdir /s /q "%TEMP_DIR%"

echo.
echo EAS configuration copied successfully!
echo.
echo Next steps:
echo 1. Run eas-login.bat to log in to your Expo account
echo 2. Run eas-build.bat to build your app
echo.
pause

endlocal