@echo off
echo Opening Study Buddy Tabs directly...
echo.
echo This will open your web browser directly to the tabs section of the app.
echo Note: This may not work if authentication is required.
echo.
start http://localhost:19006/(tabs)
echo.
echo If the app is not already running, please start it with:
echo npm run web
echo.
pause