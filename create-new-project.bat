@echo off
echo ===================================
echo Create New Study Buddy Project
echo ===================================

echo This script will create a new Expo project with the latest version
echo and then help you migrate your code to the new project.

echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

cd /d "%~dp0\.."
echo Creating new project in %CD%\study-buddy-new...

npx create-expo-app@latest study-buddy-new --template blank-typescript

echo.
echo New project created successfully!
echo.
echo Next steps:
echo 1. Copy your code from study-buddy to study-buddy-new
echo 2. Update dependencies in package.json
echo 3. Run the new project with: cd study-buddy-new && npx expo start
echo.
pause