Write-Host "=== Step 1: Killing Java Processes ==="
Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "javaw" -Force -ErrorAction SilentlyContinue

# Give the OS a moment to release file handles
Start-Sleep -Seconds 2

Write-Host "=== Step 2 & 3: Deleting and Verifying Daemon Folder ==="
$gradleDaemonPath = "$env:USERPROFILE\.gradle\daemon\9.3.1"

if (Test-Path $gradleDaemonPath) {
    Remove-Item -Path $gradleDaemonPath -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path $gradleDaemonPath) {
        Write-Host "Warning: Could not completely remove the daemon folder. Check your folder permissions." -ForegroundColor Yellow
    } else {
        Write-Host "Successfully removed Gradle daemon folder (9.3.1)." -ForegroundColor Green
    }
} else {
    Write-Host "Gradle daemon folder does not exist or was already removed." -ForegroundColor Green
}

Write-Host "=== Step 5: Running Gradle Clean ==="
$androidDir = Join-Path -Path $PSScriptRoot -ChildPath "android"
if (Test-Path $androidDir) {
    Push-Location -Path $androidDir
    Write-Host "Executing .\gradlew clean..."
    try {
        .\gradlew clean
        Write-Host "Gradle clean completed successfully." -ForegroundColor Green
    } catch {
        Write-Host "Gradle clean encountered an error: $_" -ForegroundColor Red
    }
    Pop-Location
} else {
    Write-Host "Could not find android directory to run gradle clean." -ForegroundColor Red
}

Write-Host "=== Fix Complete ===" -ForegroundColor Cyan
Write-Host "You can now run 'npm run android' again." -ForegroundColor Cyan
