# --- Relaunch as admin if not already ---
if (-not ([Security.Principal.WindowsPrincipal] `
        [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Output "Restarting as administrator..."
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

$taskName = "WiiWallpaper"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$exePath = Join-Path $scriptDir "dont-touch.ps1"

# this is the thing that took about 6 years to figure out i hate powershell i never wanna touch ever again oh my god
$taskCommand = "powershell.exe -ExecutionPolicy Bypass -Command `"\`"$exePath\`"`""

# Check if task exists
schtasks /Query /TN $taskName > $null 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Output "Task '$taskName' already exists."
} else {
    Write-Output "Creating task '$taskName'..."
    cd $scriptDIR
    $result = schtasks /Create /TN $taskName /TR $taskCommand /SC ONLOGON /RL LIMITED /F
    if ($LASTEXITCODE -eq 0) {
        Write-Output "Task created successfully."
    } else {
        Write-Error "Failed to create task. Exit code: $LASTEXITCODE"
        Write-Output $result
    }
}
pause
