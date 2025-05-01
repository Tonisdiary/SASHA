@echo off
echo Setting up EAS project...

REM Create PowerShell script file
echo $projectId = "b0829ebb-4926-4d9b-9d34-1a16db43d4eb" > setup-eas.ps1
echo. >> setup-eas.ps1
echo Write-Host "Setting up EAS project with ID: $projectId" >> setup-eas.ps1
echo. >> setup-eas.ps1
echo # Create or update .easconfig file >> setup-eas.ps1
echo $easConfig = @{ >> setup-eas.ps1
echo     projectId = $projectId >> setup-eas.ps1
echo } ^| ConvertTo-Json >> setup-eas.ps1
echo Set-Content -Path ".easconfig" -Value $easConfig >> setup-eas.ps1
echo Write-Host "Created .easconfig file" >> setup-eas.ps1
echo. >> setup-eas.ps1
echo # Update app.json to ensure it has the correct EAS project ID >> setup-eas.ps1
echo $appJson = Get-Content -Path "app.json" -Raw ^| ConvertFrom-Json >> setup-eas.ps1
echo $appJson.expo.extra.eas.projectId = $projectId >> setup-eas.ps1
echo $appJson.expo.owner = "tonis.diary" >> setup-eas.ps1
echo $appJson ^| ConvertTo-Json -Depth 10 ^| Set-Content -Path "app.json" >> setup-eas.ps1
echo Write-Host "Updated app.json with project ID and owner" >> setup-eas.ps1
echo. >> setup-eas.ps1
echo # Update eas.json to include iOS simulator configuration >> setup-eas.ps1
echo $easJson = Get-Content -Path "eas.json" -Raw ^| ConvertFrom-Json >> setup-eas.ps1
echo. >> setup-eas.ps1
echo # Ensure the development section exists >> setup-eas.ps1
echo if (-not $easJson.build.development) { >> setup-eas.ps1
echo     $easJson.build.development = @{ >> setup-eas.ps1
echo         developmentClient = $true >> setup-eas.ps1
echo         distribution = "internal" >> setup-eas.ps1
echo     } >> setup-eas.ps1
echo } >> setup-eas.ps1
echo. >> setup-eas.ps1
echo # Ensure the iOS section exists in development >> setup-eas.ps1
echo if (-not $easJson.build.development.ios) { >> setup-eas.ps1
echo     $easJson.build.development.ios = @{} >> setup-eas.ps1
echo } >> setup-eas.ps1
echo. >> setup-eas.ps1
echo # Set simulator to true >> setup-eas.ps1
echo $easJson.build.development.ios.simulator = $true >> setup-eas.ps1
echo. >> setup-eas.ps1
echo # Update the CLI version >> setup-eas.ps1
echo $easJson.cli.version = "^3.18.3" >> setup-eas.ps1
echo. >> setup-eas.ps1
echo # Save the updated eas.json >> setup-eas.ps1
echo $easJson ^| ConvertTo-Json -Depth 10 ^| Set-Content -Path "eas.json" >> setup-eas.ps1
echo Write-Host "Updated eas.json with iOS simulator configuration" >> setup-eas.ps1
echo. >> setup-eas.ps1
echo Write-Host "EAS project setup complete!" >> setup-eas.ps1

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File setup-eas.ps1

REM Clean up
del setup-eas.ps1

echo.
echo EAS project setup completed successfully!
echo.
pause