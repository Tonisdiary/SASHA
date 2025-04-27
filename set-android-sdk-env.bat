@echo off
REM This script sets the Android SDK environment variables for the current terminal session.
REM Usage: Run this script in your command prompt before running Android build commands.

REM Common Android SDK paths to check
set SDK_PATHS=%LOCALAPPDATA%\Android\Sdk;C:\Android\Sdk;C:\Users\%USERNAME%\AppData\Local\Android\Sdk

set FOUND_SDK=

for %%p in (%SDK_PATHS%) do (
    if exist "%%p" (
        set FOUND_SDK=%%p
        goto :found
    )
)

:found
if defined FOUND_SDK (
    set ANDROID_HOME=%FOUND_SDK%
    echo Using detected Android SDK path: %ANDROID_HOME%
) else (
    echo No common Android SDK path found.
    echo Please set the correct Android SDK path below:
    set /p ANDROID_HOME=Enter Android SDK path: 
)

REM Add platform-tools to PATH
set PATH=%ANDROID_HOME%\platform-tools;%PATH%

echo ANDROID_HOME set to: %ANDROID_HOME%
echo Updated PATH to include adb tools.

REM Verify adb command
adb version

pause
