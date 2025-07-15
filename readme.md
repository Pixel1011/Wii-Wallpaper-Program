# External script for Wii wallpaper by [Lillykyu](https://www.lillykyu.gay/)

## Usage instructions
1. Download the zip file from releases.
2. Extract into a folder
3. Run ``install.bat`` and if that succeeds then run ``start.bat``
4. Edit the info.txt with your executables and log path in the format shown in the file

If you need to make any edits,`, 
run ``stop.bat``, edit your info.txt
then run ``start.bat`` to restart it,

Once you have done that

## Build instructions
Run these commands in order in the main directory:
  - ``pnpm i or npm i``
  - ``tsc``
  - ``pkg .\dist\index.js --targets latest-win-x64 --output ./dont-touch/lillywallpaper.exe``

:3
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/N4N6145I0V)