
#!/bin/bash
# Script om de Chrome extensie te bouwen

echo "Building Chrome extension..."
npm run build

echo "Copying missing files to dist..."
cp public/manifest.json dist/
mkdir -p dist/icons
cp public/icons/* dist/icons/

echo "Build complete! The extension is now in the 'dist' directory."
echo "To install: Open Chrome, go to chrome://extensions/, enable Developer Mode, then click 'Load unpacked' and select the 'dist' folder."
