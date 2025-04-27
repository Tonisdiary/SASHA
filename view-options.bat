@echo off
echo Study Buddy Viewing Options
echo =========================
echo.
echo Choose how you want to view the app:
echo.
echo 1. Start Expo development server (npm run web)
echo 2. Open static demo viewer (static-demo.html)
echo 3. Build static web version (build-web.bat)
echo 4. Serve built web version (serve-web.bat)
echo 5. Exit
echo.

set /p choice=Enter your choice (1-5): 

if "%choice%"=="1" (
  echo Starting Expo development server...
  start cmd /k npm run web
  timeout /t 5 /nobreak > nul
  start http://localhost:19006
) else if "%choice%"=="2" (
  echo Opening static demo viewer...
  start static-demo.html
) else if "%choice%"=="3" (
  echo Building static web version...
  call build-web.bat
) else if "%choice%"=="4" (
  echo Serving built web version...
  start cmd /k serve-web.bat
  timeout /t 3 /nobreak > nul
  start http://localhost:3000
) else if "%choice%"=="5" (
  echo Exiting...
  exit
) else (
  echo Invalid choice. Please try again.
  pause
  call view-options.bat
)