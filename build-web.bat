@echo off
echo Building Study Buddy for web...
echo.

echo Installing required dependencies...
call npm install -g serve

echo Building the web version...
call npx expo export:web

echo.
echo Build completed! The web version is now available in the web-build directory.
echo.
echo To view the app, run:
echo serve -s web-build
echo.
echo Or you can open the web-build directory in any web server.
echo.
pause