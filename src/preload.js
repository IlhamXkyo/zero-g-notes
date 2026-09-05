const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  getNotesData: () => ipcRenderer.invoke('get-notes-data'),
  saveNotesData: (data) => ipcRenderer.invoke('save-notes-data', data),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  closeApp: () => ipcRenderer.send('close-app'),
  onToggleThemeShortcut: (callback) => {
    ipcRenderer.on('toggle-theme-shortcut', () => callback());
  }
});
