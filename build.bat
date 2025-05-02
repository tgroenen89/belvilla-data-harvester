
@echo off
echo Building Chrome extension...
call npm run build

echo Copying missing files to dist...
copy public\manifest.json dist\
if not exist dist\icons mkdir dist\icons
copy public\icons\* dist\icons\

echo Build complete! The extension is now in the 'dist' directory.
echo To install: Open Chrome, go to chrome://extensions/, enable Developer Mode, then click 'Load unpacked' and select the 'dist' folder.
pause
