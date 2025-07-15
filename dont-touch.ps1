$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$exePath = Join-Path $scriptDir "lillywallpaper.exe"

echo $scriptDir
cd $scriptDir

powershell.exe -Command `$process = Start-Process -FilePath $exePath -WindowStyle Hidden -PassThru
