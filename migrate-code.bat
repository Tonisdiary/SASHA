@echo off
setlocal

echo ===================================
echo Migrate Code to New Project
echo ===================================

echo This script will help you migrate your code to the new project.
echo.
echo WARNING: This will copy files from your current project to the new project.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause > nul

REM Check if the new project directory exists
set "NEW_PROJECT_DIR=c:\Users\tonys\Downloads\study-buddy-new"
if not exist "%NEW_PROJECT_DIR%" (
    echo The directory %NEW_PROJECT_DIR% does not exist.
    echo Please run create-new-project.bat first.
    pause
    exit /b 1
)

echo.
echo Copying your app code...
echo $sourceDir = "c:\Users\tonys\Downloads\study-buddy" > migrate-code.ps1
echo $destDir = "%NEW_PROJECT_DIR%" >> migrate-code.ps1
echo. >> migrate-code.ps1
echo # Files and directories to exclude from copying >> migrate-code.ps1
echo $excludes = @( >> migrate-code.ps1
echo     ".git", >> migrate-code.ps1
echo     "node_modules", >> migrate-code.ps1
echo     ".easconfig", >> migrate-code.ps1
echo     "eas.json", >> migrate-code.ps1
echo     "app.json", >> migrate-code.ps1
echo     "package.json", >> migrate-code.ps1
echo     "package-lock.json", >> migrate-code.ps1
echo     "*.bat" >> migrate-code.ps1
echo ) >> migrate-code.ps1
echo. >> migrate-code.ps1
echo # Source directories to copy >> migrate-code.ps1
echo $sourceDirs = @( >> migrate-code.ps1
echo     "src", >> migrate-code.ps1
echo     "assets", >> migrate-code.ps1
echo     "components", >> migrate-code.ps1
echo     "screens", >> migrate-code.ps1
echo     "navigation", >> migrate-code.ps1
echo     "hooks", >> migrate-code.ps1
echo     "utils", >> migrate-code.ps1
echo     "services", >> migrate-code.ps1
echo     "styles", >> migrate-code.ps1
echo     "constants", >> migrate-code.ps1
echo     "api", >> migrate-code.ps1
echo     "models" >> migrate-code.ps1
echo ) >> migrate-code.ps1
echo. >> migrate-code.ps1
echo # Copy source directories if they exist >> migrate-code.ps1
echo foreach ($dir in $sourceDirs) { >> migrate-code.ps1
echo     $sourcePath = Join-Path $sourceDir $dir >> migrate-code.ps1
echo     if (Test-Path $sourcePath) { >> migrate-code.ps1
echo         $destPath = Join-Path $destDir $dir >> migrate-code.ps1
echo         if (-not (Test-Path $destPath)) { >> migrate-code.ps1
echo             New-Item -Path $destPath -ItemType Directory -Force | Out-Null >> migrate-code.ps1
echo         } >> migrate-code.ps1
echo         Copy-Item -Path "$sourcePath\*" -Destination $destPath -Recurse -Force >> migrate-code.ps1
echo         Write-Host "Copied $dir directory" >> migrate-code.ps1
echo     } >> migrate-code.ps1
echo } >> migrate-code.ps1
echo. >> migrate-code.ps1
echo # Copy individual source files from the root directory >> migrate-code.ps1
echo $sourceFiles = @( >> migrate-code.ps1
echo     "App.js", >> migrate-code.ps1
echo     "App.tsx", >> migrate-code.ps1
echo     "babel.config.js", >> migrate-code.ps1
echo     "metro.config.js", >> migrate-code.ps1
echo     "tsconfig.json", >> migrate-code.ps1
echo     ".env", >> migrate-code.ps1
echo     ".env.development", >> migrate-code.ps1
echo     ".env.production" >> migrate-code.ps1
echo ) >> migrate-code.ps1
echo. >> migrate-code.ps1
echo foreach ($file in $sourceFiles) { >> migrate-code.ps1
echo     $sourcePath = Join-Path $sourceDir $file >> migrate-code.ps1
echo     if (Test-Path $sourcePath) { >> migrate-code.ps1
echo         Copy-Item -Path $sourcePath -Destination $destDir -Force >> migrate-code.ps1
echo         Write-Host "Copied $file" >> migrate-code.ps1
echo     } >> migrate-code.ps1
echo } >> migrate-code.ps1
echo. >> migrate-code.ps1
echo # Update package.json with dependencies from the original project >> migrate-code.ps1
echo $sourcePackageJson = Get-Content -Path (Join-Path $sourceDir "package.json") -Raw | ConvertFrom-Json >> migrate-code.ps1
echo $destPackageJson = Get-Content -Path (Join-Path $destDir "package.json") -Raw | ConvertFrom-Json >> migrate-code.ps1
echo. >> migrate-code.ps1
echo # Merge dependencies >> migrate-code.ps1
echo if ($sourcePackageJson.dependencies) { >> migrate-code.ps1
echo     foreach ($dep in $sourcePackageJson.dependencies.PSObject.Properties) { >> migrate-code.ps1
echo         if (-not $destPackageJson.dependencies.($dep.Name)) { >> migrate-code.ps1
echo             $destPackageJson.dependencies | Add-Member -MemberType NoteProperty -Name $dep.Name -Value $dep.Value >> migrate-code.ps1
echo             Write-Host "Added dependency: $($dep.Name) $($dep.Value)" >> migrate-code.ps1
echo         } >> migrate-code.ps1
echo     } >> migrate-code.ps1
echo } >> migrate-code.ps1
echo. >> migrate-code.ps1
echo # Merge devDependencies >> migrate-code.ps1
echo if ($sourcePackageJson.devDependencies) { >> migrate-code.ps1
echo     if (-not $destPackageJson.devDependencies) { >> migrate-code.ps1
echo         $destPackageJson | Add-Member -MemberType NoteProperty -Name "devDependencies" -Value @{} >> migrate-code.ps1
echo     } >> migrate-code.ps1
echo     foreach ($dep in $sourcePackageJson.devDependencies.PSObject.Properties) { >> migrate-code.ps1
echo         if (-not $destPackageJson.devDependencies.($dep.Name)) { >> migrate-code.ps1
echo             $destPackageJson.devDependencies | Add-Member -MemberType NoteProperty -Name $dep.Name -Value $dep.Value >> migrate-code.ps1
echo             Write-Host "Added devDependency: $($dep.Name) $($dep.Value)" >> migrate-code.ps1
echo         } >> migrate-code.ps1
echo     } >> migrate-code.ps1
echo } >> migrate-code.ps1
echo. >> migrate-code.ps1
echo # Copy scripts >> migrate-code.ps1
echo if ($sourcePackageJson.scripts) { >> migrate-code.ps1
echo     foreach ($script in $sourcePackageJson.scripts.PSObject.Properties) { >> migrate-code.ps1
echo         if (-not $destPackageJson.scripts.($script.Name)) { >> migrate-code.ps1
echo             $destPackageJson.scripts | Add-Member -MemberType NoteProperty -Name $script.Name -Value $script.Value >> migrate-code.ps1
echo             Write-Host "Added script: $($script.Name): $($script.Value)" >> migrate-code.ps1
echo         } >> migrate-code.ps1
echo     } >> migrate-code.ps1
echo } >> migrate-code.ps1
echo. >> migrate-code.ps1
echo # Save the updated package.json >> migrate-code.ps1
echo $destPackageJson | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $destDir "package.json") >> migrate-code.ps1
echo Write-Host "Updated package.json with dependencies and scripts" >> migrate-code.ps1

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File migrate-code.ps1

REM Clean up
del migrate-code.ps1

echo.
echo Code migration completed!
echo.
echo Next steps:
echo 1. cd %NEW_PROJECT_DIR%
echo 2. npm install
echo 3. .\build.bat
echo.
pause

endlocal