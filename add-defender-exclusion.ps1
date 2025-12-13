# Run this script as Administrator to add Windows Defender exclusion
# Right-click PowerShell -> Run as Administrator, then execute:
# Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
# .\add-defender-exclusion.ps1

$projectPath = "F:\Onebby-dashboard"

Write-Host "Adding Windows Defender exclusion for: $projectPath"

try {
    Add-MpPreference -ExclusionPath $projectPath
    Write-Host "✓ Successfully added exclusion!" -ForegroundColor Green
    Write-Host "The project folder is now excluded from Windows Defender scanning."
} catch {
    Write-Host "✗ Failed to add exclusion. Make sure you're running as Administrator!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
