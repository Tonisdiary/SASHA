@echo off
echo Starting Study Buddy App...

REM Check if node_modules exists
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)

REM Check if TypeScript types are installed
if not exist "node_modules\@types\react-native" (
  echo Installing TypeScript types...
  call npm install --save-dev @types/react-native
)

REM Try to start the app
echo Starting the app...
call npx expo start --web

REM If the app fails to start, run the fix script
if %ERRORLEVEL% NEQ 0 (
  echo App failed to start. Running fix script...
  node fix-expo.js
  echo Trying to start the app again...
  call npx expo start --web
)

pause