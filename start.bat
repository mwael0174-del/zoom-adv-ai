@echo off
echo Starting Zoom Adv AI...

:: Start Vite dev server in background
start "Vite Server" cmd /c "node node_modules/vite/bin/vite.js --port 5173 --strictPort"

:: Wait for Vite to be ready
echo Waiting for Vite server...
timeout /t 4 /nobreak > nul

:: Start Electron with development mode
set NODE_ENV=development
node_modules\.bin\electron.cmd .

echo App closed.
