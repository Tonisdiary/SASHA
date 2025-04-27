@echo off
echo Cleaning up node_modules and build directories...

rem Delete node_modules directories
rd /s /q "C:\Users\tonys\Downloads\study-buddy\node_modules"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\auth_app\node_modules"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\study-buddy\node_modules"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\project\node_modules"

rem Delete build and cache directories
rd /s /q "C:\Users\tonys\Downloads\study-buddy\web-build"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\.expo"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\android\.gradle"

rem Clean iOS and Android build artifacts
rd /s /q "C:\Users\tonys\Downloads\study-buddy\ios\build"
rd /s /q "C:\Users\tonys\Downloads\study-buddy\android\app\build"

rem Delete any temporary files or logs
del /s /q "C:\Users\tonys\Downloads\study-buddy\*.log"

echo Cleanup completed!