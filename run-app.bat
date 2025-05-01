@echo off
echo ===================================
echo Study Buddy App Launcher
echo ===================================

echo Checking environment...
cd /d "%~dp0"

echo Installing dependencies...
call npm install --save-dev @types/react-native

echo Starting the app...
echo.
echo IMPORTANT: When the app starts, you may need to:
echo 1. Open a web browser and go to: http://localhost:19006
echo 2. If you see any errors, check the console (F12)
echo.
echo Press any key to start the app...
pause > nul

npx expo start --web

echo.
echo If the app didn't start correctly, try:
echo 1. Run 'npx expo start --no-dev --web'
echo 2. Run 'node fix-expo.js' to fix common issues
echo.
pause