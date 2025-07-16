# --- Relaunch as admin if not already ---
if (-not ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Output "Restarting as administrator..."
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

$taskName = "WiiWallpaper"

# Check if task exists
schtasks /Query /TN $taskName > $null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Output "Uninstalling..."
    Write-Output "Ending WiiWallpaper task.."
    schtasks /End /TN "WiiWallpaper"
    Write-Output "Killing wallpaper process.."
    taskkill /IM lillywallpaper.exe /F
    Write-Output "Removing WiiWallpaper task.."
    schtasks /Delete /TN $taskName /F
} else {
    Write-Output "Task '$taskName' is not installed!"
}
pause
