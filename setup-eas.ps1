Write-Host "Setting up EAS project..."
$projectId = "b0829ebb-4926-4d9b-9d34-1a16db43d4eb"

# Create or update .easconfig file
$easConfig = @{
    projectId = $projectId
} | ConvertTo-Json

Set-Content -Path ".easconfig" -Value $easConfig

# Update app.json to ensure it has the correct EAS project ID
$appJson = Get-Content -Path "app.json" -Raw | ConvertFrom-Json
$appJson.expo.extra.eas.projectId = $projectId
$appJson.expo.owner = "tonis.diary"
$appJson | ConvertTo-Json -Depth 10 | Set-Content -Path "app.json"

# Update eas.json to include iOS simulator configuration
$easJson = Get-Content -Path "eas.json" -Raw | ConvertFrom-Json
$easJson.build.development.ios = @{
    simulator = $true
}
$easJson | ConvertTo-Json -Depth 10 | Set-Content -Path "eas.json"

Write-Host "EAS project setup complete!"