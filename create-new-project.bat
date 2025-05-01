@echo off
setlocal

echo ===================================
echo Create New Expo Project with EAS
echo ===================================

echo This script will create a new Expo project and configure it for EAS.
echo.
echo WARNING: This will create a new directory next to your current project.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

REM Create a new directory for the new project
set "NEW_PROJECT_DIR=c:\Users\tonys\Downloads\study-buddy-new"
if exist "%NEW_PROJECT_DIR%" (
    echo The directory %NEW_PROJECT_DIR% already exists.
    echo Please delete it or choose a different name.
    pause
    exit /b 1
)

echo.
echo Creating new Expo project...
call npx create-expo-app "%NEW_PROJECT_DIR%" --template blank
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create new Expo project.
    pause
    exit /b 1
)

cd /d "%NEW_PROJECT_DIR%"

echo.
echo Installing EAS CLI...
call npm install --save-dev eas-cli
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install EAS CLI.
    pause
    exit /b 1
)

echo.
echo Logging in to EAS...
call npx eas login
if %ERRORLEVEL% NEQ 0 (
    echo Failed to log in to EAS.
    pause
    exit /b 1
)

echo.
echo Initializing EAS project...
call npx eas init --non-interactive
if %ERRORLEVEL% NEQ 0 (
    echo Failed to initialize EAS project.
    pause
    exit /b 1
)

echo.
echo Creating EAS build configuration...
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
echo Creating build script...
echo @echo off > build.bat
echo setlocal >> build.bat
echo. >> build.bat
echo cd /d "%NEW_PROJECT_DIR%" >> build.bat
echo. >> build.bat
echo echo ================================== >> build.bat
echo echo EAS Build >> build.bat
echo echo ================================== >> build.bat
echo. >> build.bat
echo echo Choose a platform to build for: >> build.bat
echo echo 1. iOS >> build.bat
echo echo 2. Android >> build.bat
echo echo 3. Both >> build.bat
echo echo. >> build.bat
echo set /p platform_choice="Enter your choice (1-3): " >> build.bat
echo. >> build.bat
echo set platform= >> build.bat
echo if "%%platform_choice%%"=="1" set platform=ios >> build.bat
echo if "%%platform_choice%%"=="2" set platform=android >> build.bat
echo if "%%platform_choice%%"=="3" set platform=all >> build.bat
echo. >> build.bat
echo if "%%platform%%"=="" ( >> build.bat
echo     echo Invalid platform choice. >> build.bat
echo     pause >> build.bat
echo     exit /b 1 >> build.bat
echo ) >> build.bat
echo. >> build.bat
echo echo Building for %%platform%% in development mode... >> build.bat
echo echo. >> build.bat
echo. >> build.bat
echo call npx eas build --platform %%platform%% --profile development >> build.bat
echo. >> build.bat
echo echo. >> build.bat
echo echo Build process initiated. Check the EAS dashboard for build status. >> build.bat
echo echo. >> build.bat
echo pause >> build.bat
echo. >> build.bat
echo endlocal >> build.bat

echo.
echo New project created and configured successfully!
echo.
echo Your new project is located at: %NEW_PROJECT_DIR%
echo.
echo Next steps:
echo 1. Copy your app code from study-buddy to study-buddy-new
echo 2. Update dependencies in package.json
echo 3. Run the build script: cd %NEW_PROJECT_DIR% && .\build.bat
echo.
pause

endlocal