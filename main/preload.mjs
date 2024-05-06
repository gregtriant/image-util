import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    on: async (channel, callback) => {
        ipcRenderer.on(channel, callback);
    },
    send: async (channel, args) => {
        ipcRenderer.send(channel, args);
    },
    removeAllListeners: async (channel) => {
        if (channel) {
            ipcRenderer.removeAllListeners(channel);
        } else {
            ipcRenderer.removeAllListeners();
        }
    },
});
