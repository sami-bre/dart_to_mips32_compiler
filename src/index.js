const { app, Menu, BrowserWindow } = require('electron');

const template = [  {    label: 'File',    submenu: [      { label: 'New File' },      { label: 'Open File' },      { label: 'Save File' },      { label: 'Save As...' },      { type: 'separator' },      { label: 'Exit', role: 'quit' }    ]
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo' },
      { label: 'Redo' },
      { type: 'separator' },
      { label: 'Cut' },
      { label: 'Copy' },
      { label: 'Paste' },
      { label: 'Delete' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { label: 'Reload' },
      { label: 'Toggle Full Screen' },
      { label: 'Toggle Developer Tools' }
    ]
  }
];

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  mainWindow.loadFile('./components/ui/index.html');
});

app.on('window-all-closed', () => {
  app.quit();
});
