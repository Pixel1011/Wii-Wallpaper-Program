# External script for Wii wallpaper by lillykyu

## Usage instructions
1. Download the zip file from releases.
2. Extract into a folder
3. Run ``lillywallpaper.exe``
4. Edit the info.txt with your executables and log path in the format shown in the file
5. Run ``install.ps1`` and if that succeeds then run ``start.ps1``

If you need to make any edits after running ``install.ps1``, 
run ``stop.ps1``, edit your info.txt,
run ``lillywallpaper.exe`` to make sure it functions properly,
then run ``start.ps1``

Once you have done that

## Build instructions
Run these commands in order:
  - ``pnpm i or npm i``
  - ``tsc``
  - ``pkg .\dist\index.js --targets latest-win-x64 --output lillywallpaper.exe``