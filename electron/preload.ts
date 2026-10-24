import { contextBridge, ipcRenderer } from 'electron';

/**
 * Narrow, secure preload bridge.
 * Node integration is disabled and context isolation is enabled.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
  getAppVersion: () => ipcRenderer.invoke('app:version'),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close')
});
