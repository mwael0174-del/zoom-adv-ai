const { app, shell } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  const desktopPath = app.getPath('desktop');
  const shortcutPath = path.join(desktopPath, 'Zoom Adv AI.lnk');

  const success = shell.writeShortcutLink(shortcutPath, 'create', {
    target: process.execPath,
    args: path.resolve(__dirname, '..'),
    icon: path.resolve(__dirname, '../build/icon.ico'),
    iconIndex: 0,
    description: 'Zoom Adv AI - Smart Advertising Management',
    appUserModelId: 'com.zoomadvai.app',
  });

  if (success) {
    console.log('Desktop shortcut created successfully!');
    console.log(`   Location: ${shortcutPath}`);
  } else {
    console.error('Failed to create shortcut');
  }

  app.quit();
});
