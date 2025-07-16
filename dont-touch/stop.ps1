# --- Relaunch as admin if not already ---
if (-not ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Output "Restarting as administrator..."
    Start-Process powershell -ArgumentList " -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Output "Ending WiiWallpaper task.."
schtasks /End /TN "WiiWallpaper"
Write-Output "Killing wallpaper process.."
taskkill /IM lillywallpaper.exe /F
Write-Output "Sucess! (if the one above this message errored, it is fine)"
pause